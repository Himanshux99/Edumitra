import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useCommunityStore } from '../../../store/communityStore';
import { communityService } from '../../../services/communityService';
import { Colors } from '../../../constants/Colors';
import { Mentor, MentorSession, SessionType } from '../../../types/community';

const { width } = Dimensions.get('window');

const sessionTypes: SessionType[] = [
  'one-on-one',
  'group',
  'workshop',
  'code-review',
  'career-guidance',
  'interview-prep'
];

export default function MentorsScreen() {
  const {
    mentors,
    mentorSessions,
    currentUser,
    isLoading,
    error,
    getSessionsByStudent
  } = useCommunityStore();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState<string | 'All'>('All');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [sessionType, setSessionType] = useState<SessionType>('one-on-one');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');

  useEffect(() => {
    loadMentorsData();
    initializeSampleMentors();
  }, []);

  const loadMentorsData = async () => {
    try {
      await communityService.loadAllCommunityData();
    } catch (error) {
      console.error('Failed to load mentors data:', error);
      Alert.alert('Error', 'Failed to load mentors data');
    }
  };

  const initializeSampleMentors = async () => {
    // Add sample mentors if none exist
    if (mentors.length === 0) {
      const sampleMentors: Mentor[] = [
        {
          id: 'mentor_1',
          userId: 'user_mentor_1',
          name: 'Dr. Sarah Johnson',
          title: 'Senior Software Engineer',
          company: 'Google',
          expertise: ['JavaScript', 'React', 'Node.js', 'System Design', 'Career Guidance'],
          bio: 'Experienced software engineer with 8+ years in tech. Passionate about mentoring and helping others grow in their careers.',
          experience: 8,
          rating: 4.9,
          totalSessions: 156,
          languages: ['English', 'Spanish'],
          timezone: 'PST',
          availability: [
            { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', timezone: 'PST' },
            { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', timezone: 'PST' },
            { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', timezone: 'PST' }
          ],
          pricing: {
            currency: 'USD',
            hourlyRate: 75,
            sessionRate: 50
          },
          isVerified: true,
          isActive: true,
          joinedAt: new Date().toISOString()
        },
        {
          id: 'mentor_2',
          userId: 'user_mentor_2',
          name: 'Michael Chen',
          title: 'Product Manager',
          company: 'Microsoft',
          expertise: ['Product Management', 'Strategy', 'Leadership', 'Data Analysis'],
          bio: 'Product leader with experience building products used by millions. Love helping aspiring PMs break into tech.',
          experience: 6,
          rating: 4.8,
          totalSessions: 89,
          languages: ['English', 'Mandarin'],
          timezone: 'PST',
          availability: [
            { dayOfWeek: 2, startTime: '18:00', endTime: '21:00', timezone: 'PST' },
            { dayOfWeek: 4, startTime: '18:00', endTime: '21:00', timezone: 'PST' },
            { dayOfWeek: 6, startTime: '10:00', endTime: '16:00', timezone: 'PST' }
          ],
          pricing: {
            currency: 'USD',
            hourlyRate: 60,
            sessionRate: 40
          },
          isVerified: true,
          isActive: true,
          joinedAt: new Date().toISOString()
        },
        {
          id: 'mentor_3',
          userId: 'user_mentor_3',
          name: 'Emily Rodriguez',
          title: 'UX Design Lead',
          company: 'Airbnb',
          expertise: ['UX Design', 'UI Design', 'Design Systems', 'User Research'],
          bio: 'Design leader passionate about creating user-centered experiences. Mentor to designers at all levels.',
          experience: 7,
          rating: 4.9,
          totalSessions: 134,
          languages: ['English', 'Spanish'],
          timezone: 'PST',
          availability: [
            { dayOfWeek: 1, startTime: '19:00', endTime: '22:00', timezone: 'PST' },
            { dayOfWeek: 3, startTime: '19:00', endTime: '22:00', timezone: 'PST' },
            { dayOfWeek: 0, startTime: '14:00', endTime: '18:00', timezone: 'PST' }
          ],
          pricing: {
            currency: 'USD',
            hourlyRate: 70,
            sessionRate: 45
          },
          isVerified: true,
          isActive: true,
          joinedAt: new Date().toISOString()
        }
      ];

      // Add sample mentors to store
      const store = useCommunityStore.getState();
      store.setMentors(sampleMentors);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMentorsData();
    setRefreshing(false);
  };

  const handleBookSession = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedMentor || !sessionTitle.trim() || !sessionDescription.trim() || !sessionDate || !sessionTime) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'Please sign in to book sessions');
      return;
    }

    try {
      const scheduledDateTime = new Date(`${sessionDate}T${sessionTime}`).toISOString();
      
      await communityService.bookMentorSession(selectedMentor.id, {
        title: sessionTitle.trim(),
        description: sessionDescription.trim(),
        type: sessionType,
        scheduledAt: scheduledDateTime,
        duration: 60 // Default 1 hour
      });

      setShowBookingModal(false);
      setSelectedMentor(null);
      setSessionTitle('');
      setSessionDescription('');
      setSessionDate('');
      setSessionTime('');
      Alert.alert('Success', 'Session booked successfully!');
    } catch (error) {
      console.error('Failed to book session:', error);
      Alert.alert('Error', 'Failed to book session');
    }
  };

  const getAllExpertise = () => {
    const allExpertise = mentors.flatMap(mentor => mentor.expertise);
    return [...new Set(allExpertise)].sort();
  };

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = searchQuery === '' || 
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.expertise.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesExpertise = selectedExpertise === 'All' || 
      mentor.expertise.includes(selectedExpertise);
    
    return matchesSearch && matchesExpertise && mentor.isActive;
  });

  const userSessions = currentUser ? getSessionsByStudent(currentUser.id) : [];

  const renderMentorCard = (mentor: Mentor) => (
    <View key={mentor.id} style={styles.mentorCard}>
      <View style={styles.mentorHeader}>
        <View style={styles.mentorInfo}>
          <View style={styles.mentorNameRow}>
            <Text style={styles.mentorName}>{mentor.name}</Text>
            {mentor.isVerified && (
              <MaterialIcons name="verified" size={16} color="#4CAF50" />
            )}
          </View>
          <Text style={styles.mentorTitle}>{mentor.title}</Text>
          {mentor.company && (
            <Text style={styles.mentorCompany}>@ {mentor.company}</Text>
          )}
          <Text style={styles.mentorBio} numberOfLines={2}>
            {mentor.bio}
          </Text>
        </View>
        <View style={styles.mentorStats}>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{mentor.rating}</Text>
          </View>
          <Text style={styles.sessionsCount}>
            {mentor.totalSessions} sessions
          </Text>
        </View>
      </View>

      <View style={styles.expertiseContainer}>
        <Text style={styles.expertiseLabel}>Expertise:</Text>
        <View style={styles.expertiseTags}>
          {mentor.expertise.slice(0, 4).map((skill, index) => (
            <View key={index} style={styles.expertiseTag}>
              <Text style={styles.expertiseText}>{skill}</Text>
            </View>
          ))}
          {mentor.expertise.length > 4 && (
            <Text style={styles.moreExpertise}>+{mentor.expertise.length - 4} more</Text>
          )}
        </View>
      </View>

      <View style={styles.mentorFooter}>
        <View style={styles.pricingInfo}>
          <Text style={styles.pricingText}>
            ${mentor.pricing.sessionRate || mentor.pricing.hourlyRate}/session
          </Text>
          <Text style={styles.experienceText}>
            {mentor.experience} years exp.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => handleBookSession(mentor)}
        >
          <MaterialIcons name="event" size={16} color="white" />
          <Text style={styles.bookButtonText}>Book Session</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Find Mentors</Text>
          <Text style={styles.subtitle}>
            Connect with experienced professionals for guidance
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color={Colors.light.tabIconDefault} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search mentors..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.light.tabIconDefault}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons name="clear" size={20} color={Colors.light.tabIconDefault} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{mentors.filter(m => m.isActive).length}</Text>
            <Text style={styles.statLabel}>Active Mentors</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userSessions.length}</Text>
            <Text style={styles.statLabel}>My Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{getAllExpertise().length}</Text>
            <Text style={styles.statLabel}>Expertise Areas</Text>
          </View>
        </View>

        {/* Expertise Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filter by Expertise</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.expertiseFilter}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedExpertise === 'All' && styles.selectedFilterButton
                ]}
                onPress={() => setSelectedExpertise('All')}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedExpertise === 'All' && styles.selectedFilterText
                ]}>
                  All ({mentors.filter(m => m.isActive).length})
                </Text>
              </TouchableOpacity>
              {getAllExpertise().map((expertise) => {
                const count = mentors.filter(m => m.isActive && m.expertise.includes(expertise)).length;
                
                return (
                  <TouchableOpacity
                    key={expertise}
                    style={[
                      styles.filterButton,
                      selectedExpertise === expertise && styles.selectedFilterButton
                    ]}
                    onPress={() => setSelectedExpertise(expertise)}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      selectedExpertise === expertise && styles.selectedFilterText
                    ]}>
                      {expertise} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Mentors List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Available Mentors ({filteredMentors.length})
          </Text>
          {filteredMentors.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="supervisor-account" size={64} color={Colors.light.tabIconDefault} />
              <Text style={styles.emptyStateText}>No mentors found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            <View style={styles.mentorsList}>
              {filteredMentors.map(renderMentorCard)}
            </View>
          )}
        </View>

        {/* My Sessions Preview */}
        {userSessions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Sessions</Text>
              <TouchableOpacity onPress={() => router.push('/community/mentors/my-sessions')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sessionsPreview}>
              {userSessions.slice(0, 3).map((session) => {
                const mentor = mentors.find(m => m.id === session.mentorId);
                return (
                  <View key={session.id} style={styles.sessionPreviewCard}>
                    <View style={styles.sessionHeader}>
                      <Text style={styles.sessionTitle} numberOfLines={1}>
                        {session.title}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(session.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(session.status) }]}>
                          {session.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.sessionMentor}>
                      with {mentor?.name || 'Unknown Mentor'}
                    </Text>
                    <Text style={styles.sessionDate}>
                      {new Date(session.scheduledAt).toLocaleDateString()}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowBookingModal(false)}>
              <MaterialIcons name="close" size={24} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Book Session</Text>
            <TouchableOpacity
              onPress={handleConfirmBooking}
              disabled={!sessionTitle.trim() || !sessionDescription.trim() || !sessionDate || !sessionTime}
            >
              <Text style={[
                styles.bookText,
                (!sessionTitle.trim() || !sessionDescription.trim() || !sessionDate || !sessionTime) && styles.disabledText
              ]}>
                Book
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedMentor && (
              <View style={styles.mentorPreview}>
                <Text style={styles.mentorPreviewName}>{selectedMentor.name}</Text>
                <Text style={styles.mentorPreviewTitle}>{selectedMentor.title}</Text>
                <Text style={styles.mentorPreviewPrice}>
                  ${selectedMentor.pricing.sessionRate || selectedMentor.pricing.hourlyRate}/session
                </Text>
              </View>
            )}

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Session Title *</Text>
              <TextInput
                style={styles.textInput}
                value={sessionTitle}
                onChangeText={setSessionTitle}
                placeholder="What would you like to discuss?"
                placeholderTextColor={Colors.light.tabIconDefault}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={sessionDescription}
                onChangeText={setSessionDescription}
                placeholder="Describe what you'd like to cover in this session"
                placeholderTextColor={Colors.light.tabIconDefault}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Session Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.typePicker}>
                  {sessionTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeOption,
                        sessionType === type && styles.selectedType
                      ]}
                      onPress={() => setSessionType(type)}
                    >
                      <Text style={[
                        styles.typeOptionText,
                        sessionType === type && styles.selectedTypeText
                      ]}>
                        {type.replace('-', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Preferred Date *</Text>
              <TextInput
                style={styles.textInput}
                value={sessionDate}
                onChangeText={setSessionDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.light.tabIconDefault}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Preferred Time *</Text>
              <TextInput
                style={styles.textInput}
                value={sessionTime}
                onChangeText={setSessionTime}
                placeholder="HH:MM (24-hour format)"
                placeholderTextColor={Colors.light.tabIconDefault}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled': return '#FF9800';
    case 'confirmed': return '#4CAF50';
    case 'in-progress': return '#2196F3';
    case 'completed': return '#4CAF50';
    case 'cancelled': return '#f44336';
    case 'no-show': return '#9E9E9E';
    default: return Colors.light.tabIconDefault;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
    lineHeight: 22,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: '500',
  },
  expertiseFilter: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.tabIconDefault + '40',
  },
  selectedFilterButton: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    fontWeight: '500',
  },
  selectedFilterText: {
    color: 'white',
  },
  mentorsList: {
    gap: 16,
  },
  mentorCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  mentorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  mentorInfo: {
    flex: 1,
    marginRight: 16,
  },
  mentorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  mentorName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  mentorTitle: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: '500',
    marginBottom: 2,
  },
  mentorCompany: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginBottom: 8,
  },
  mentorBio: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    lineHeight: 20,
  },
  mentorStats: {
    alignItems: 'flex-end',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  sessionsCount: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
  expertiseContainer: {
    marginBottom: 16,
  },
  expertiseLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 8,
  },
  expertiseTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  expertiseTag: {
    backgroundColor: Colors.light.tint + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  expertiseText: {
    fontSize: 10,
    color: Colors.light.tint,
    fontWeight: '500',
  },
  moreExpertise: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    fontStyle: 'italic',
  },
  mentorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pricingInfo: {
    flex: 1,
  },
  pricingText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  experienceText: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginTop: 2,
  },
  bookButton: {
    backgroundColor: Colors.light.tint,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  sessionsPreview: {
    gap: 12,
  },
  sessionPreviewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  sessionMentor: {
    fontSize: 12,
    color: Colors.light.tint,
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.light.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.tabIconDefault + '20',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  bookText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  disabledText: {
    color: Colors.light.tabIconDefault,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  mentorPreview: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  mentorPreviewName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  mentorPreviewTitle: {
    fontSize: 14,
    color: Colors.light.tint,
    marginTop: 4,
  },
  mentorPreviewPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 8,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.light.tabIconDefault + '40',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typePicker: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.tabIconDefault + '40',
  },
  selectedType: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  typeOptionText: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  selectedTypeText: {
    color: 'white',
  },
  bottomSpacing: {
    height: 20,
  },
});
