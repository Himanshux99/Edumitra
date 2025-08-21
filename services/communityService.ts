import { database, ref, push, set, onValue, off, serverTimestamp } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { databaseService } from './database';
import { useCommunityStore } from '../store/communityStore';
import {
  CommunityUser,
  PeerGroup,
  Message,
  Mentor,
  MentorSession,
  Question,
  Answer,
  ModerationReport,
  RealtimeEvent
} from '../types/community';

class CommunityService {
  private userId: string = 'default_user'; // This should come from auth service
  private realtimeListeners: { [key: string]: any } = {};

  async initialize(): Promise<void> {
    await this.loadAllCommunityData();
    await this.setupRealtimeListeners();
  }

  // Load all community data from local storage and Firebase
  async loadAllCommunityData(): Promise<void> {
    const store = useCommunityStore.getState();
    store.setLoading(true);

    try {
      // Load from local storage first for offline support
      await this.loadLocalData();

      // Then sync with Firebase if online
      if (navigator.onLine) {
        await this.syncWithFirebase();
      }

      store.setLastSyncTime(new Date().toISOString());
    } catch (error) {
      console.error('Failed to load community data:', error);
      store.setError('Failed to load community data');
    } finally {
      store.setLoading(false);
    }
  }

  private async loadLocalData(): Promise<void> {
    const store = useCommunityStore.getState();

    try {
      // Load groups
      const groups = await this.getLocalGroups();
      store.setGroups(groups);

      // Load mentors
      const mentors = await this.getLocalMentors();
      store.setMentors(mentors);

      // Load mentor sessions
      const sessions = await this.getLocalMentorSessions();
      store.setMentorSessions(sessions);

      // Load questions
      const questions = await this.getLocalQuestions();
      store.setQuestions(questions);

      // Load user profile
      const userProfile = await this.getLocalUserProfile();
      if (userProfile) {
        store.setCurrentUser(userProfile);
      }
    } catch (error) {
      console.error('Error loading local community data:', error);
    }
  }

  private async syncWithFirebase(): Promise<void> {
    const store = useCommunityStore.getState();
    store.setConnectionStatus('connecting');

    try {
      // Sync groups from Firebase
      await this.syncGroupsFromFirebase();
      
      // Sync mentors from Firebase
      await this.syncMentorsFromFirebase();
      
      // Sync questions from Firebase
      await this.syncQuestionsFromFirebase();

      store.setConnectionStatus('connected');
    } catch (error) {
      console.error('Firebase sync failed:', error);
      store.setConnectionStatus('disconnected');
    }
  }

  // Real-time listeners setup
  private async setupRealtimeListeners(): Promise<void> {
    if (!navigator.onLine) return;

    const store = useCommunityStore.getState();

    try {
      // Listen to user groups for real-time messages
      const userGroups = store.getUserGroups(this.userId);
      
      userGroups.forEach(group => {
        this.subscribeToGroupMessages(group.id);
      });

      // Listen to user presence
      this.setupPresenceListener();

    } catch (error) {
      console.error('Failed to setup real-time listeners:', error);
    }
  }

  // Group & Message Methods
  async createGroup(groupData: Partial<PeerGroup>): Promise<PeerGroup> {
    const newGroup: PeerGroup = {
      id: this.generateId('group'),
      name: groupData.name || '',
      description: groupData.description || '',
      topic: groupData.topic || '',
      category: groupData.category || 'General Discussion',
      isPrivate: groupData.isPrivate || false,
      createdBy: this.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      members: [{
        userId: this.userId,
        role: 'admin',
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        permissions: ['post_messages', 'delete_messages', 'manage_members', 'edit_group', 'moderate_content']
      }],
      tags: groupData.tags || [],
      rules: groupData.rules || [],
      stats: {
        totalMembers: 1,
        totalMessages: 0,
        activeMembers: 1,
        lastActivity: new Date().toISOString()
      }
    };

    // Save locally
    await this.saveGroupLocally(newGroup);

    // Save to Firebase if online
    if (navigator.onLine) {
      await this.saveGroupToFirebase(newGroup);
    }

    // Update store
    const store = useCommunityStore.getState();
    store.addGroup(newGroup);

    return newGroup;
  }

  async sendMessage(groupId: string, content: string, type: 'text' | 'image' | 'file' = 'text'): Promise<Message> {
    const store = useCommunityStore.getState();
    const currentUser = store.currentUser;

    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const message: Message = {
      id: this.generateId('message'),
      groupId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content,
      type,
      attachments: [],
      reactions: [],
      isEdited: false,
      isPinned: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save locally
    await this.saveMessageLocally(message);

    // Save to Firebase if online
    if (navigator.onLine) {
      await this.saveMessageToFirebase(message);
    }

    // Update store
    store.addMessage(message);

    return message;
  }

  subscribeToGroupMessages(groupId: string): void {
    if (!navigator.onLine) return;

    const messagesRef = ref(database, `groups/${groupId}/messages`);
    
    const listener = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messages = Object.values(data) as Message[];
        const store = useCommunityStore.getState();
        store.setMessages(groupId, messages.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ));
      }
    });

    this.realtimeListeners[`messages_${groupId}`] = listener;
    
    const store = useCommunityStore.getState();
    store.addSubscription(`messages_${groupId}`);
  }

  unsubscribeFromGroupMessages(groupId: string): void {
    const listenerKey = `messages_${groupId}`;
    if (this.realtimeListeners[listenerKey]) {
      const messagesRef = ref(database, `groups/${groupId}/messages`);
      off(messagesRef, this.realtimeListeners[listenerKey]);
      delete this.realtimeListeners[listenerKey];
      
      const store = useCommunityStore.getState();
      store.removeSubscription(listenerKey);
    }
  }

  // Mentor Session Methods
  async bookMentorSession(mentorId: string, sessionData: Partial<MentorSession>): Promise<MentorSession> {
    const session: MentorSession = {
      id: this.generateId('session'),
      mentorId,
      studentId: this.userId,
      title: sessionData.title || '',
      description: sessionData.description || '',
      type: sessionData.type || 'one-on-one',
      status: 'scheduled',
      scheduledAt: sessionData.scheduledAt || new Date().toISOString(),
      duration: sessionData.duration || 60,
      agenda: sessionData.agenda || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save locally
    await this.saveSessionLocally(session);

    // Save to Firebase if online
    if (navigator.onLine) {
      await this.saveSessionToFirebase(session);
    }

    // Update store
    const store = useCommunityStore.getState();
    store.addMentorSession(session);

    return session;
  }

  async updateSessionStatus(sessionId: string, status: MentorSession['status']): Promise<void> {
    const store = useCommunityStore.getState();
    const updates = { status, updatedAt: new Date().toISOString() };

    // Update locally
    await this.updateSessionLocally(sessionId, updates);

    // Update Firebase if online
    if (navigator.onLine) {
      await this.updateSessionInFirebase(sessionId, updates);
    }

    // Update store
    store.updateMentorSession(sessionId, updates);
  }

  // Q&A Methods
  async postQuestion(questionData: Partial<Question>): Promise<Question> {
    const question: Question = {
      id: this.generateId('question'),
      title: questionData.title || '',
      content: questionData.content || '',
      category: questionData.category || 'General',
      tags: questionData.tags || [],
      askedBy: this.userId,
      askedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      votes: 0,
      answers: [],
      isResolved: false,
      attachments: questionData.attachments || []
    };

    // Save locally
    await this.saveQuestionLocally(question);

    // Save to Firebase if online
    if (navigator.onLine) {
      await this.saveQuestionToFirebase(question);
    }

    // Update store
    const store = useCommunityStore.getState();
    store.addQuestion(question);

    return question;
  }

  async postAnswer(questionId: string, content: string): Promise<Answer> {
    const answer: Answer = {
      id: this.generateId('answer'),
      questionId,
      content,
      answeredBy: this.userId,
      answeredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      votes: 0,
      isAccepted: false,
      attachments: [],
      comments: []
    };

    // Save locally
    await this.saveAnswerLocally(answer);

    // Save to Firebase if online
    if (navigator.onLine) {
      await this.saveAnswerToFirebase(answer);
    }

    // Update store
    const store = useCommunityStore.getState();
    store.addAnswer(questionId, answer);

    return answer;
  }

  // Moderation Methods
  async reportContent(targetId: string, targetType: string, reason: string, description: string): Promise<ModerationReport> {
    const report: ModerationReport = {
      id: this.generateId('report'),
      type: 'other',
      targetId,
      targetType: targetType as any,
      reportedBy: this.userId,
      reason: reason as any,
      description,
      status: 'pending',
      createdAt: new Date().toISOString(),
      evidence: []
    };

    // Save locally
    await this.saveReportLocally(report);

    // Save to Firebase if online
    if (navigator.onLine) {
      await this.saveReportToFirebase(report);
    }

    // Update store
    const store = useCommunityStore.getState();
    store.addReport(report);

    return report;
  }

  // Presence Management
  private setupPresenceListener(): void {
    if (!navigator.onLine) return;

    const userPresenceRef = ref(database, `presence/${this.userId}`);
    
    // Set user as online
    set(userPresenceRef, {
      isOnline: true,
      lastActive: serverTimestamp()
    });

    // Set user as offline when they disconnect
    const offlineData = {
      isOnline: false,
      lastActive: serverTimestamp()
    };

    // Use onDisconnect to set offline status
    // Note: This would need proper Firebase setup
  }

  // Utility Methods
  generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Local Storage Methods
  private async getLocalGroups(): Promise<PeerGroup[]> {
    try {
      const rows = await databaseService.findMany('community_groups', 'userId = ?', [this.userId]);
      return rows.map(this.mapGroupFromDb);
    } catch (error) {
      console.error('Error loading local groups:', error);
      return [];
    }
  }

  private async saveGroupLocally(group: PeerGroup): Promise<void> {
    const dbGroup = this.mapGroupToDb(group);
    await databaseService.insert('community_groups', dbGroup);
  }

  private async getLocalMentors(): Promise<Mentor[]> {
    try {
      const rows = await databaseService.findMany('mentors', undefined, undefined, 'rating DESC');
      return rows.map(this.mapMentorFromDb);
    } catch (error) {
      console.error('Error loading local mentors:', error);
      return [];
    }
  }

  private async getLocalMentorSessions(): Promise<MentorSession[]> {
    try {
      const rows = await databaseService.findMany('mentor_sessions', 'studentId = ? OR mentorId = ?', [this.userId, this.userId]);
      return rows.map(this.mapSessionFromDb);
    } catch (error) {
      console.error('Error loading local sessions:', error);
      return [];
    }
  }

  private async saveSessionLocally(session: MentorSession): Promise<void> {
    const dbSession = this.mapSessionToDb(session);
    await databaseService.insert('mentor_sessions', dbSession);
  }

  private async updateSessionLocally(sessionId: string, updates: Partial<MentorSession>): Promise<void> {
    await databaseService.update('mentor_sessions', updates, 'id = ?', [sessionId]);
  }

  private async getLocalQuestions(): Promise<Question[]> {
    try {
      const rows = await databaseService.findMany('community_questions', undefined, undefined, 'askedAt DESC');
      return rows.map(this.mapQuestionFromDb);
    } catch (error) {
      console.error('Error loading local questions:', error);
      return [];
    }
  }

  private async saveQuestionLocally(question: Question): Promise<void> {
    const dbQuestion = this.mapQuestionToDb(question);
    await databaseService.insert('community_questions', dbQuestion);
  }

  private async saveAnswerLocally(answer: Answer): Promise<void> {
    const dbAnswer = this.mapAnswerToDb(answer);
    await databaseService.insert('community_answers', dbAnswer);
  }

  private async saveMessageLocally(message: Message): Promise<void> {
    const dbMessage = this.mapMessageToDb(message);
    await databaseService.insert('community_messages', dbMessage);
  }

  private async saveReportLocally(report: ModerationReport): Promise<void> {
    const dbReport = this.mapReportToDb(report);
    await databaseService.insert('moderation_reports', dbReport);
  }

  private async getLocalUserProfile(): Promise<CommunityUser | null> {
    try {
      const profile = await AsyncStorage.getItem(`community_profile_${this.userId}`);
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }

  // Firebase Methods (placeholder implementations)
  private async syncGroupsFromFirebase(): Promise<void> {
    // Implementation would sync with Firebase Realtime Database
  }

  private async syncMentorsFromFirebase(): Promise<void> {
    // Implementation would sync with Firebase Realtime Database
  }

  private async syncQuestionsFromFirebase(): Promise<void> {
    // Implementation would sync with Firebase Realtime Database
  }

  private async saveGroupToFirebase(group: PeerGroup): Promise<void> {
    // Implementation would save to Firebase Realtime Database
  }

  private async saveMessageToFirebase(message: Message): Promise<void> {
    // Implementation would save to Firebase Realtime Database
  }

  private async saveSessionToFirebase(session: MentorSession): Promise<void> {
    // Implementation would save to Firebase Realtime Database
  }

  private async updateSessionInFirebase(sessionId: string, updates: Partial<MentorSession>): Promise<void> {
    // Implementation would update in Firebase Realtime Database
  }

  private async saveQuestionToFirebase(question: Question): Promise<void> {
    // Implementation would save to Firebase Realtime Database
  }

  private async saveAnswerToFirebase(answer: Answer): Promise<void> {
    // Implementation would save to Firebase Realtime Database
  }

  private async saveReportToFirebase(report: ModerationReport): Promise<void> {
    // Implementation would save to Firebase Realtime Database
  }

  // Data mapping methods
  private mapGroupFromDb(row: any): PeerGroup {
    return {
      ...row,
      members: JSON.parse(row.members || '[]'),
      tags: JSON.parse(row.tags || '[]'),
      rules: JSON.parse(row.rules || '[]'),
      stats: JSON.parse(row.stats || '{}'),
      isPrivate: Boolean(row.isPrivate)
    };
  }

  private mapGroupToDb(group: PeerGroup): any {
    return {
      ...group,
      members: JSON.stringify(group.members),
      tags: JSON.stringify(group.tags),
      rules: JSON.stringify(group.rules),
      stats: JSON.stringify(group.stats),
      isPrivate: group.isPrivate ? 1 : 0,
      userId: this.userId
    };
  }

  private mapMentorFromDb(row: any): Mentor {
    return {
      ...row,
      expertise: JSON.parse(row.expertise || '[]'),
      languages: JSON.parse(row.languages || '[]'),
      availability: JSON.parse(row.availability || '[]'),
      pricing: JSON.parse(row.pricing || '{}'),
      isVerified: Boolean(row.isVerified),
      isActive: Boolean(row.isActive)
    };
  }

  private mapSessionFromDb(row: any): MentorSession {
    return {
      ...row,
      agenda: JSON.parse(row.agenda || '[]'),
      feedback: row.feedback ? JSON.parse(row.feedback) : undefined,
      recording: row.recording ? JSON.parse(row.recording) : undefined
    };
  }

  private mapSessionToDb(session: MentorSession): any {
    return {
      ...session,
      agenda: JSON.stringify(session.agenda),
      feedback: session.feedback ? JSON.stringify(session.feedback) : null,
      recording: session.recording ? JSON.stringify(session.recording) : null
    };
  }

  private mapQuestionFromDb(row: any): Question {
    return {
      ...row,
      tags: JSON.parse(row.tags || '[]'),
      answers: JSON.parse(row.answers || '[]'),
      attachments: JSON.parse(row.attachments || '[]'),
      isResolved: Boolean(row.isResolved)
    };
  }

  private mapQuestionToDb(question: Question): any {
    return {
      ...question,
      tags: JSON.stringify(question.tags),
      answers: JSON.stringify(question.answers),
      attachments: JSON.stringify(question.attachments),
      isResolved: question.isResolved ? 1 : 0
    };
  }

  private mapAnswerFromDb(row: any): Answer {
    return {
      ...row,
      attachments: JSON.parse(row.attachments || '[]'),
      comments: JSON.parse(row.comments || '[]'),
      isAccepted: Boolean(row.isAccepted)
    };
  }

  private mapAnswerToDb(answer: Answer): any {
    return {
      ...answer,
      attachments: JSON.stringify(answer.attachments),
      comments: JSON.stringify(answer.comments),
      isAccepted: answer.isAccepted ? 1 : 0
    };
  }

  private mapMessageFromDb(row: any): Message {
    return {
      ...row,
      attachments: JSON.parse(row.attachments || '[]'),
      reactions: JSON.parse(row.reactions || '[]'),
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      isEdited: Boolean(row.isEdited),
      isPinned: Boolean(row.isPinned),
      isDeleted: Boolean(row.isDeleted)
    };
  }

  private mapMessageToDb(message: Message): any {
    return {
      ...message,
      attachments: JSON.stringify(message.attachments),
      reactions: JSON.stringify(message.reactions),
      metadata: message.metadata ? JSON.stringify(message.metadata) : null,
      isEdited: message.isEdited ? 1 : 0,
      isPinned: message.isPinned ? 1 : 0,
      isDeleted: message.isDeleted ? 1 : 0
    };
  }

  private mapReportFromDb(row: any): ModerationReport {
    return {
      ...row,
      evidence: JSON.parse(row.evidence || '[]')
    };
  }

  private mapReportToDb(report: ModerationReport): any {
    return {
      ...report,
      evidence: JSON.stringify(report.evidence)
    };
  }
}

export const communityService = new CommunityService();
