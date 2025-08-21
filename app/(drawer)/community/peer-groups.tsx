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
import { PeerGroup, GroupCategory } from '../../../types/community';

const { width } = Dimensions.get('window');

const groupCategories: GroupCategory[] = [
  'Academic',
  'Career',
  'Technology',
  'Study Groups',
  'Project Teams',
  'General Discussion',
  'Help & Support',
  'Announcements'
];

export default function PeerGroupsScreen() {
  const {
    groups,
    currentUser,
    isLoading,
    error,
    getUserGroups,
    joinGroup,
    leaveGroup
  } = useCommunityStore();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<GroupCategory | 'All'>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupCategory, setNewGroupCategory] = useState<GroupCategory>('General Discussion');
  const [newGroupTopic, setNewGroupTopic] = useState('');

  useEffect(() => {
    loadGroupsData();
  }, []);

  const loadGroupsData = async () => {
    try {
      await communityService.loadAllCommunityData();
    } catch (error) {
      console.error('Failed to load groups data:', error);
      Alert.alert('Error', 'Failed to load groups data');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGroupsData();
    setRefreshing(false);
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !newGroupDescription.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await communityService.createGroup({
        name: newGroupName.trim(),
        description: newGroupDescription.trim(),
        topic: newGroupTopic.trim() || newGroupName.trim(),
        category: newGroupCategory,
        isPrivate: false,
        tags: [],
        rules: []
      });

      setShowCreateModal(false);
      setNewGroupName('');
      setNewGroupDescription('');
      setNewGroupTopic('');
      setNewGroupCategory('General Discussion');
      Alert.alert('Success', 'Group created successfully!');
    } catch (error) {
      console.error('Failed to create group:', error);
      Alert.alert('Error', 'Failed to create group');
    }
  };

  const handleJoinGroup = async (group: PeerGroup) => {
    if (!currentUser) {
      Alert.alert('Error', 'Please sign in to join groups');
      return;
    }

    const isMember = group.members.some(member => member.userId === currentUser.id);
    
    if (isMember) {
      Alert.alert(
        'Leave Group',
        `Are you sure you want to leave "${group.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => leaveGroup(group.id, currentUser.id),
          },
        ]
      );
    } else {
      joinGroup(group.id, currentUser.id);
      Alert.alert('Success', `You joined "${group.name}"!`);
    }
  };

  const handleOpenGroup = (group: PeerGroup) => {
    if (!currentUser) {
      Alert.alert('Error', 'Please sign in to access groups');
      return;
    }

    const isMember = group.members.some(member => member.userId === currentUser.id);
    
    if (!isMember) {
      Alert.alert(
        'Join Group',
        `You need to join "${group.name}" to access its discussions.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Join',
            onPress: () => {
              joinGroup(group.id, currentUser.id);
              router.push(`/community/peer-groups/${group.id}`);
            },
          },
        ]
      );
    } else {
      router.push(`/community/peer-groups/${group.id}`);
    }
  };

  const filteredGroups = groups.filter(group => {
    const matchesCategory = selectedCategory === 'All' || group.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.topic.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const userGroups = currentUser ? getUserGroups(currentUser.id) : [];

  const renderGroupCard = (group: PeerGroup) => {
    const isMember = currentUser ? group.members.some(member => member.userId === currentUser.id) : false;
    const isAdmin = currentUser ? group.members.some(member => 
      member.userId === currentUser.id && member.role === 'admin'
    ) : false;

    return (
      <View key={group.id} style={styles.groupCard}>
        <TouchableOpacity
          style={styles.groupContent}
          onPress={() => handleOpenGroup(group)}
        >
          <View style={styles.groupHeader}>
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{group.name}</Text>
              <Text style={styles.groupTopic}>{group.topic}</Text>
              <Text style={styles.groupDescription} numberOfLines={2}>
                {group.description}
              </Text>
            </View>
            <View style={styles.groupBadges}>
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(group.category) + '20' }]}>
                <Text style={[styles.categoryText, { color: getCategoryColor(group.category) }]}>
                  {group.category}
                </Text>
              </View>
              {group.isPrivate && (
                <MaterialIcons name="lock" size={16} color={Colors.light.tabIconDefault} />
              )}
            </View>
          </View>

          <View style={styles.groupStats}>
            <View style={styles.statItem}>
              <MaterialIcons name="people" size={16} color={Colors.light.tabIconDefault} />
              <Text style={styles.statText}>{group.stats.totalMembers}</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="chat" size={16} color={Colors.light.tabIconDefault} />
              <Text style={styles.statText}>{group.stats.totalMessages}</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="schedule" size={16} color={Colors.light.tabIconDefault} />
              <Text style={styles.statText}>
                {new Date(group.stats.lastActivity).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.groupActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              isMember ? styles.leaveButton : styles.joinButton
            ]}
            onPress={() => handleJoinGroup(group)}
          >
            <MaterialIcons 
              name={isMember ? "exit-to-app" : "group-add"} 
              size={16} 
              color="white" 
            />
            <Text style={styles.actionButtonText}>
              {isMember ? 'Leave' : 'Join'}
            </Text>
          </TouchableOpacity>
          
          {isAdmin && (
            <TouchableOpacity
              style={styles.manageButton}
              onPress={() => router.push(`/community/peer-groups/${group.id}/manage`)}
            >
              <MaterialIcons name="settings" size={16} color={Colors.light.tint} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const getCategoryColor = (category: GroupCategory) => {
    const colors = {
      'Academic': '#4CAF50',
      'Career': '#2196F3',
      'Technology': '#FF9800',
      'Study Groups': '#9C27B0',
      'Project Teams': '#f44336',
      'General Discussion': '#607D8B',
      'Help & Support': '#795548',
      'Announcements': '#E91E63'
    };
    return colors[category] || Colors.light.tint;
  };

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
          <Text style={styles.title}>Peer Groups</Text>
          <Text style={styles.subtitle}>
            Join topic-wise discussion groups and connect with peers
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color={Colors.light.tabIconDefault} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search groups..."
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
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <MaterialIcons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{groups.length}</Text>
            <Text style={styles.statLabel}>Total Groups</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userGroups.length}</Text>
            <Text style={styles.statLabel}>Joined</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {groupCategories.filter(cat => groups.some(g => g.category === cat)).length}
            </Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryFilter}>
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategory === 'All' && styles.selectedCategoryButton
                ]}
                onPress={() => setSelectedCategory('All')}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === 'All' && styles.selectedCategoryText
                ]}>
                  All ({groups.length})
                </Text>
              </TouchableOpacity>
              {groupCategories.map((category) => {
                const count = groups.filter(g => g.category === category).length;
                if (count === 0) return null;
                
                return (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category && styles.selectedCategoryButton
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      selectedCategory === category && styles.selectedCategoryText
                    ]}>
                      {category} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Groups List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'All' ? 'All Groups' : `${selectedCategory} Groups`} ({filteredGroups.length})
          </Text>
          {filteredGroups.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="group" size={64} color={Colors.light.tabIconDefault} />
              <Text style={styles.emptyStateText}>No groups found</Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery 
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to create a group in this category'
                }
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  style={styles.createGroupButton}
                  onPress={() => setShowCreateModal(true)}
                >
                  <Text style={styles.createGroupButtonText}>Create Group</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.groupsList}>
              {filteredGroups.map(renderGroupCard)}
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Create Group Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <MaterialIcons name="close" size={24} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Group</Text>
            <TouchableOpacity
              onPress={handleCreateGroup}
              disabled={!newGroupName.trim() || !newGroupDescription.trim()}
            >
              <Text style={[
                styles.createText,
                (!newGroupName.trim() || !newGroupDescription.trim()) && styles.disabledText
              ]}>
                Create
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Group Name *</Text>
              <TextInput
                style={styles.textInput}
                value={newGroupName}
                onChangeText={setNewGroupName}
                placeholder="Enter group name"
                placeholderTextColor={Colors.light.tabIconDefault}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newGroupDescription}
                onChangeText={setNewGroupDescription}
                placeholder="Describe what this group is about"
                placeholderTextColor={Colors.light.tabIconDefault}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Topic (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={newGroupTopic}
                onChangeText={setNewGroupTopic}
                placeholder="Main topic or subject"
                placeholderTextColor={Colors.light.tabIconDefault}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryPicker}>
                  {groupCategories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryOption,
                        newGroupCategory === category && styles.selectedCategory
                      ]}
                      onPress={() => setNewGroupCategory(category)}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        newGroupCategory === category && styles.selectedCategoryText
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

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
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  searchBar: {
    flex: 1,
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
  createButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
  categoryFilter: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.tabIconDefault + '40',
  },
  selectedCategoryButton: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  categoryButtonText: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: 'white',
  },
  groupsList: {
    gap: 16,
  },
  groupCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  groupContent: {
    marginBottom: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  groupInfo: {
    flex: 1,
    marginRight: 12,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  groupTopic: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: '500',
    marginBottom: 6,
  },
  groupDescription: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    lineHeight: 20,
  },
  groupBadges: {
    alignItems: 'flex-end',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  groupStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
  groupActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  joinButton: {
    backgroundColor: Colors.light.tint,
  },
  leaveButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  manageButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
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
    marginBottom: 24,
  },
  createGroupButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createGroupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
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
  createText: {
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
  categoryPicker: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.tabIconDefault + '40',
  },
  selectedCategory: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  categoryOptionText: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 20,
  },
});
