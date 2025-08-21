import { create } from 'zustand';
import {
  CommunityUser,
  PeerGroup,
  Message,
  Mentor,
  MentorSession,
  Question,
  Answer,
  ModerationReport,
  ModerationAction,
  ModerationStats,
  CommunityState,
  RealtimeEvent,
  CommunitySearchFilters
} from '../types/community';

interface CommunityActions {
  // User & Profile Actions
  setCurrentUser: (user: CommunityUser | null) => void;
  setUsers: (users: CommunityUser[]) => void;
  updateUserStatus: (userId: string, isOnline: boolean) => void;
  updateUserProfile: (userId: string, updates: Partial<CommunityUser>) => void;
  
  // Groups Actions
  setGroups: (groups: PeerGroup[]) => void;
  addGroup: (group: PeerGroup) => void;
  updateGroup: (groupId: string, updates: Partial<PeerGroup>) => void;
  deleteGroup: (groupId: string) => void;
  setCurrentGroup: (group: PeerGroup | null) => void;
  joinGroup: (groupId: string, userId: string) => void;
  leaveGroup: (groupId: string, userId: string) => void;
  
  // Messages Actions
  setMessages: (groupId: string, messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (messageId: string) => void;
  addReaction: (messageId: string, emoji: string, userId: string) => void;
  removeReaction: (messageId: string, emoji: string, userId: string) => void;
  
  // Mentorship Actions
  setMentors: (mentors: Mentor[]) => void;
  addMentor: (mentor: Mentor) => void;
  updateMentor: (mentorId: string, updates: Partial<Mentor>) => void;
  
  setMentorSessions: (sessions: MentorSession[]) => void;
  addMentorSession: (session: MentorSession) => void;
  updateMentorSession: (sessionId: string, updates: Partial<MentorSession>) => void;
  setCurrentSession: (session: MentorSession | null) => void;
  
  // Q&A Actions
  setQuestions: (questions: Question[]) => void;
  addQuestion: (question: Question) => void;
  updateQuestion: (questionId: string, updates: Partial<Question>) => void;
  setCurrentQuestion: (question: Question | null) => void;
  addAnswer: (questionId: string, answer: Answer) => void;
  updateAnswer: (questionId: string, answerId: string, updates: Partial<Answer>) => void;
  acceptAnswer: (questionId: string, answerId: string) => void;
  
  // Moderation Actions
  setReports: (reports: ModerationReport[]) => void;
  addReport: (report: ModerationReport) => void;
  updateReport: (reportId: string, updates: Partial<ModerationReport>) => void;
  
  setModerationActions: (actions: ModerationAction[]) => void;
  addModerationAction: (action: ModerationAction) => void;
  
  setModerationStats: (stats: ModerationStats) => void;
  
  // UI State Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setConnectionStatus: (status: 'connected' | 'connecting' | 'disconnected') => void;
  setLastSyncTime: (time: string) => void;
  clearError: () => void;
  
  // Real-time Actions
  addSubscription: (subscription: string) => void;
  removeSubscription: (subscription: string) => void;
  handleRealtimeEvent: (event: RealtimeEvent) => void;
  
  // Computed Getters
  getGroupById: (groupId: string) => PeerGroup | undefined;
  getGroupMessages: (groupId: string) => Message[];
  getUserGroups: (userId: string) => PeerGroup[];
  getMentorById: (mentorId: string) => Mentor | undefined;
  getSessionsByMentor: (mentorId: string) => MentorSession[];
  getSessionsByStudent: (studentId: string) => MentorSession[];
  getQuestionById: (questionId: string) => Question | undefined;
  getUserQuestions: (userId: string) => Question[];
  getUnreadMessages: (userId: string) => number;
  getActiveReports: () => ModerationReport[];
}

export const useCommunityStore = create<CommunityState & CommunityActions>((set, get) => ({
  // Initial State
  currentUser: null,
  users: [],
  groups: [],
  currentGroup: null,
  messages: {},
  mentors: [],
  mentorSessions: [],
  currentSession: null,
  questions: [],
  currentQuestion: null,
  reports: [],
  moderationActions: [],
  moderationStats: {
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    totalActions: 0,
    activeWarnings: 0,
    activeBans: 0,
    reportsByType: {
      spam: 0,
      harassment: 0,
      inappropriate_content: 0,
      misinformation: 0,
      copyright_violation: 0,
      other: 0
    },
    actionsByType: {
      warning: 0,
      mute: 0,
      temporary_ban: 0,
      permanent_ban: 0,
      content_removal: 0,
      content_edit: 0,
      group_suspension: 0
    }
  },
  isLoading: false,
  error: null,
  connectionStatus: 'disconnected',
  lastSyncTime: null,
  activeSubscriptions: [],

  // User & Profile Actions
  setCurrentUser: (user) => set({ currentUser: user }),
  
  setUsers: (users) => set({ users }),
  
  updateUserStatus: (userId, isOnline) => set((state) => ({
    users: state.users.map(user =>
      user.id === userId ? { ...user, isOnline, lastActive: new Date().toISOString() } : user
    )
  })),
  
  updateUserProfile: (userId, updates) => set((state) => ({
    users: state.users.map(user =>
      user.id === userId ? { ...user, ...updates } : user
    ),
    currentUser: state.currentUser?.id === userId 
      ? { ...state.currentUser, ...updates }
      : state.currentUser
  })),

  // Groups Actions
  setGroups: (groups) => set({ groups }),
  
  addGroup: (group) => set((state) => ({
    groups: [...state.groups, group]
  })),
  
  updateGroup: (groupId, updates) => set((state) => ({
    groups: state.groups.map(group =>
      group.id === groupId ? { ...group, ...updates, updatedAt: new Date().toISOString() } : group
    ),
    currentGroup: state.currentGroup?.id === groupId 
      ? { ...state.currentGroup, ...updates, updatedAt: new Date().toISOString() }
      : state.currentGroup
  })),
  
  deleteGroup: (groupId) => set((state) => ({
    groups: state.groups.filter(group => group.id !== groupId),
    currentGroup: state.currentGroup?.id === groupId ? null : state.currentGroup,
    messages: Object.fromEntries(
      Object.entries(state.messages).filter(([id]) => id !== groupId)
    )
  })),
  
  setCurrentGroup: (group) => set({ currentGroup: group }),
  
  joinGroup: (groupId, userId) => set((state) => ({
    groups: state.groups.map(group => {
      if (group.id === groupId) {
        const newMember = {
          userId,
          role: 'member' as const,
          joinedAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          permissions: ['post_messages' as const]
        };
        return {
          ...group,
          members: [...group.members, newMember],
          stats: {
            ...group.stats,
            totalMembers: group.stats.totalMembers + 1
          }
        };
      }
      return group;
    })
  })),
  
  leaveGroup: (groupId, userId) => set((state) => ({
    groups: state.groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          members: group.members.filter(member => member.userId !== userId),
          stats: {
            ...group.stats,
            totalMembers: Math.max(0, group.stats.totalMembers - 1)
          }
        };
      }
      return group;
    })
  })),

  // Messages Actions
  setMessages: (groupId, messages) => set((state) => ({
    messages: { ...state.messages, [groupId]: messages }
  })),
  
  addMessage: (message) => set((state) => {
    const groupMessages = state.messages[message.groupId] || [];
    return {
      messages: {
        ...state.messages,
        [message.groupId]: [...groupMessages, message]
      }
    };
  }),
  
  updateMessage: (messageId, updates) => set((state) => {
    const newMessages = { ...state.messages };
    Object.keys(newMessages).forEach(groupId => {
      newMessages[groupId] = newMessages[groupId].map(message =>
        message.id === messageId 
          ? { ...message, ...updates, updatedAt: new Date().toISOString() }
          : message
      );
    });
    return { messages: newMessages };
  }),
  
  deleteMessage: (messageId) => set((state) => {
    const newMessages = { ...state.messages };
    Object.keys(newMessages).forEach(groupId => {
      newMessages[groupId] = newMessages[groupId].map(message =>
        message.id === messageId 
          ? { ...message, isDeleted: true, content: '[Message deleted]' }
          : message
      );
    });
    return { messages: newMessages };
  }),
  
  addReaction: (messageId, emoji, userId) => set((state) => {
    const newMessages = { ...state.messages };
    Object.keys(newMessages).forEach(groupId => {
      newMessages[groupId] = newMessages[groupId].map(message => {
        if (message.id === messageId) {
          const existingReaction = message.reactions.find(r => r.emoji === emoji);
          if (existingReaction) {
            if (!existingReaction.users.includes(userId)) {
              existingReaction.count++;
              existingReaction.users.push(userId);
            }
          } else {
            message.reactions.push({
              emoji,
              count: 1,
              users: [userId]
            });
          }
        }
        return message;
      });
    });
    return { messages: newMessages };
  }),
  
  removeReaction: (messageId, emoji, userId) => set((state) => {
    const newMessages = { ...state.messages };
    Object.keys(newMessages).forEach(groupId => {
      newMessages[groupId] = newMessages[groupId].map(message => {
        if (message.id === messageId) {
          message.reactions = message.reactions.map(reaction => {
            if (reaction.emoji === emoji && reaction.users.includes(userId)) {
              return {
                ...reaction,
                count: Math.max(0, reaction.count - 1),
                users: reaction.users.filter(id => id !== userId)
              };
            }
            return reaction;
          }).filter(reaction => reaction.count > 0);
        }
        return message;
      });
    });
    return { messages: newMessages };
  }),

  // Mentorship Actions
  setMentors: (mentors) => set({ mentors }),
  
  addMentor: (mentor) => set((state) => ({
    mentors: [...state.mentors, mentor]
  })),
  
  updateMentor: (mentorId, updates) => set((state) => ({
    mentors: state.mentors.map(mentor =>
      mentor.id === mentorId ? { ...mentor, ...updates } : mentor
    )
  })),
  
  setMentorSessions: (sessions) => set({ mentorSessions: sessions }),
  
  addMentorSession: (session) => set((state) => ({
    mentorSessions: [...state.mentorSessions, session]
  })),
  
  updateMentorSession: (sessionId, updates) => set((state) => ({
    mentorSessions: state.mentorSessions.map(session =>
      session.id === sessionId ? { ...session, ...updates, updatedAt: new Date().toISOString() } : session
    ),
    currentSession: state.currentSession?.id === sessionId 
      ? { ...state.currentSession, ...updates, updatedAt: new Date().toISOString() }
      : state.currentSession
  })),
  
  setCurrentSession: (session) => set({ currentSession: session }),

  // Q&A Actions
  setQuestions: (questions) => set({ questions }),
  
  addQuestion: (question) => set((state) => ({
    questions: [question, ...state.questions]
  })),
  
  updateQuestion: (questionId, updates) => set((state) => ({
    questions: state.questions.map(question =>
      question.id === questionId ? { ...question, ...updates, updatedAt: new Date().toISOString() } : question
    ),
    currentQuestion: state.currentQuestion?.id === questionId 
      ? { ...state.currentQuestion, ...updates, updatedAt: new Date().toISOString() }
      : state.currentQuestion
  })),
  
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  
  addAnswer: (questionId, answer) => set((state) => ({
    questions: state.questions.map(question => {
      if (question.id === questionId) {
        return {
          ...question,
          answers: [...question.answers, answer],
          updatedAt: new Date().toISOString()
        };
      }
      return question;
    })
  })),
  
  updateAnswer: (questionId, answerId, updates) => set((state) => ({
    questions: state.questions.map(question => {
      if (question.id === questionId) {
        return {
          ...question,
          answers: question.answers.map(answer =>
            answer.id === answerId ? { ...answer, ...updates, updatedAt: new Date().toISOString() } : answer
          )
        };
      }
      return question;
    })
  })),
  
  acceptAnswer: (questionId, answerId) => set((state) => ({
    questions: state.questions.map(question => {
      if (question.id === questionId) {
        return {
          ...question,
          isResolved: true,
          acceptedAnswerId: answerId,
          answers: question.answers.map(answer => ({
            ...answer,
            isAccepted: answer.id === answerId
          }))
        };
      }
      return question;
    })
  })),

  // Moderation Actions
  setReports: (reports) => set({ reports }),
  
  addReport: (report) => set((state) => ({
    reports: [report, ...state.reports]
  })),
  
  updateReport: (reportId, updates) => set((state) => ({
    reports: state.reports.map(report =>
      report.id === reportId ? { ...report, ...updates } : report
    )
  })),
  
  setModerationActions: (actions) => set({ moderationActions: actions }),
  
  addModerationAction: (action) => set((state) => ({
    moderationActions: [action, ...state.moderationActions]
  })),
  
  setModerationStats: (stats) => set({ moderationStats: stats }),

  // UI State Actions
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setLastSyncTime: (time) => set({ lastSyncTime: time }),
  clearError: () => set({ error: null }),

  // Real-time Actions
  addSubscription: (subscription) => set((state) => ({
    activeSubscriptions: [...state.activeSubscriptions, subscription]
  })),
  
  removeSubscription: (subscription) => set((state) => ({
    activeSubscriptions: state.activeSubscriptions.filter(sub => sub !== subscription)
  })),
  
  handleRealtimeEvent: (event) => {
    const { type, data } = event;
    const actions = get();
    
    switch (type) {
      case 'message_sent':
        actions.addMessage(data);
        break;
      case 'message_updated':
        actions.updateMessage(data.id, data);
        break;
      case 'message_deleted':
        actions.deleteMessage(data.id);
        break;
      case 'user_online':
        actions.updateUserStatus(data.userId, true);
        break;
      case 'user_offline':
        actions.updateUserStatus(data.userId, false);
        break;
      case 'group_updated':
        actions.updateGroup(data.id, data);
        break;
      case 'question_posted':
        actions.addQuestion(data);
        break;
      case 'answer_posted':
        actions.addAnswer(data.questionId, data);
        break;
    }
  },

  // Computed Getters
  getGroupById: (groupId) => {
    return get().groups.find(group => group.id === groupId);
  },
  
  getGroupMessages: (groupId) => {
    return get().messages[groupId] || [];
  },
  
  getUserGroups: (userId) => {
    return get().groups.filter(group => 
      group.members.some(member => member.userId === userId)
    );
  },
  
  getMentorById: (mentorId) => {
    return get().mentors.find(mentor => mentor.id === mentorId);
  },
  
  getSessionsByMentor: (mentorId) => {
    return get().mentorSessions.filter(session => session.mentorId === mentorId)
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  },
  
  getSessionsByStudent: (studentId) => {
    return get().mentorSessions.filter(session => session.studentId === studentId)
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  },
  
  getQuestionById: (questionId) => {
    return get().questions.find(question => question.id === questionId);
  },
  
  getUserQuestions: (userId) => {
    return get().questions.filter(question => question.askedBy === userId)
      .sort((a, b) => new Date(b.askedAt).getTime() - new Date(a.askedAt).getTime());
  },
  
  getUnreadMessages: (userId) => {
    // This would need to be implemented with read receipts
    return 0;
  },
  
  getActiveReports: () => {
    return get().reports.filter(report => 
      report.status === 'pending' || report.status === 'under_review'
    );
  }
}));

// Selector hooks for better performance
export const useCurrentUser = () => useCommunityStore(state => state.currentUser);
export const useGroups = () => useCommunityStore(state => state.groups);
export const useCurrentGroup = () => useCommunityStore(state => state.currentGroup);
export const useMentors = () => useCommunityStore(state => state.mentors);
export const useQuestions = () => useCommunityStore(state => state.questions);
export const useCommunityLoading = () => useCommunityStore(state => state.isLoading);
export const useCommunityError = () => useCommunityStore(state => state.error);
export const useConnectionStatus = () => useCommunityStore(state => state.connectionStatus);
