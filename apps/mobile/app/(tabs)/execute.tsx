/**
 * Execute Screen - Ring 4: Action Items
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  FlatList,
  Animated,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { useStrategyStore } from '../../stores/strategyStore';
import { ActionStatus } from '../../services/api';

type ActionItem = {
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'small' | 'medium' | 'large';
  category?: string;
  status: ActionStatus;
  dueDate?: string;
  expectedImpact?: string;
};

type FilterType = 'all' | 'high' | 'pending' | 'in_progress' | 'completed';
type GroupByType = 'none' | 'category' | 'priority';

export default function ExecuteScreen() {
  const { strategy, updateActionStatus, error } = useStrategyStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [groupBy, setGroupBy] = useState<GroupByType>('none');
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [notes, setNotes] = useState('');
  const progressAnim = useRef(new Animated.Value(0)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;

  // Animate progress bar
  useEffect(() => {
    if (strategy?.actionItems?.length) {
      const completedCount = strategy.actionItems.filter((a) => a.status === 'completed').length;
      const progress = (completedCount / strategy.actionItems.length) * 100;
      Animated.spring(progressAnim, {
        toValue: progress,
        useNativeDriver: false,
        tension: 40,
        friction: 8,
      }).start();
    }
  }, [strategy?.actionItems]);

  // Celebration animation when all complete
  const triggerCelebration = useCallback(() => {
    Animated.sequence([
      Animated.timing(celebrationAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(celebrationAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  if (!strategy || !strategy.actionItems?.length) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>✅</Text>
          <Text style={styles.emptyTitle}>No Actions Yet</Text>
          <Text style={styles.emptyText}>
            Generate a strategy in the Plan tab to get your action items.
          </Text>
        </View>
      </View>
    );
  }

  const actionItems = strategy.actionItems as ActionItem[];
  const completedCount = actionItems.filter((a) => a.status === 'completed').length;
  const inProgressCount = actionItems.filter((a) => a.status === 'in_progress').length;
  const pendingCount = actionItems.filter((a) => a.status === 'pending').length;
  const progress = Math.round((completedCount / actionItems.length) * 100);

  const filteredItems = actionItems.filter((item) => {
    if (filter === 'high') return item.priority === 'high';
    if (filter === 'pending') return item.status === 'pending';
    if (filter === 'in_progress') return item.status === 'in_progress';
    if (filter === 'completed') return item.status === 'completed';
    return true;
  });

  // Group items if groupBy is set
  const groupedItems = groupBy === 'none'
    ? [{ title: '', data: filteredItems }]
    : groupBy === 'category'
    ? Object.entries(
        filteredItems.reduce((acc, item) => {
          const key = item.category || 'Other';
          if (!acc[key]) acc[key] = [];
          acc[key].push(item);
          return acc;
        }, {} as Record<string, ActionItem[]>)
      ).map(([title, data]) => ({ title, data }))
    : Object.entries(
        filteredItems.reduce((acc, item) => {
          const key = item.priority.charAt(0).toUpperCase() + item.priority.slice(1);
          if (!acc[key]) acc[key] = [];
          acc[key].push(item);
          return acc;
        }, {} as Record<string, ActionItem[]>)
      ).map(([title, data]) => ({ title, data }));

  const handleStatusChange = async (id: string, newStatus: ActionStatus) => {
    await updateActionStatus(id, newStatus);
    if (newStatus === 'completed') {
      const newCompletedCount = actionItems.filter(
        (a) => a.status === 'completed' || a.id === id
      ).length;
      if (newCompletedCount === actionItems.length) {
        triggerCelebration();
      }
    }
  };

  const cycleStatus = (current: ActionStatus): ActionStatus => {
    const statusOrder: ActionStatus[] = ['pending', 'in_progress', 'completed'];
    const currentIndex = statusOrder.indexOf(current);
    return statusOrder[(currentIndex + 1) % statusOrder.length];
  };

  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Overdue', color: '#C75450' };
    if (diffDays === 0) return { text: 'Today', color: '#D4A84B' };
    if (diffDays === 1) return { text: 'Tomorrow', color: '#D4A84B' };
    if (diffDays <= 7) return { text: `${diffDays} days`, color: '#4A7C5C' };
    return { text: date.toLocaleDateString(), color: '#666' };
  };

  const openDetail = (item: ActionItem) => {
    setSelectedAction(item);
    setNotes('');
    setShowDetailModal(true);
  };

  const renderItem = ({ item }: { item: ActionItem }) => {
    const dueInfo = formatDueDate(item.dueDate);

    return (
      <Pressable
        style={[
          styles.actionCard,
          item.status === 'completed' && styles.actionCardCompleted,
          item.status === 'in_progress' && styles.actionCardInProgress,
        ]}
        onPress={() => openDetail(item)}
        onLongPress={() => handleStatusChange(item.id, cycleStatus(item.status))}
      >
        <Pressable
          style={styles.checkboxContainer}
          onPress={() => handleStatusChange(item.id, cycleStatus(item.status))}
        >
          <View
            style={[
              styles.checkbox,
              item.status === 'completed' && styles.checkboxChecked,
              item.status === 'in_progress' && styles.checkboxInProgress,
            ]}
          >
            {item.status === 'completed' && <Text style={styles.checkmark}>✓</Text>}
            {item.status === 'in_progress' && <Text style={styles.checkmarkInProgress}>●</Text>}
          </View>
        </Pressable>
        <View style={styles.actionContent}>
          <View style={styles.actionHeader}>
            <Text
              style={[
                styles.actionTitle,
                item.status === 'completed' && styles.actionTitleCompleted,
              ]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <View
              style={[
                styles.priorityBadge,
                item.priority === 'high' && styles.priorityBadgeHigh,
                item.priority === 'medium' && styles.priorityBadgeMedium,
                item.priority === 'low' && styles.priorityBadgeLow,
              ]}
            >
              <Text style={styles.priorityBadgeText}>
                {item.priority.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
          {item.description && (
            <Text style={styles.actionDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          <View style={styles.actionMeta}>
            {item.category && <Text style={styles.actionCategory}>{item.category}</Text>}
            <Text style={styles.actionEffort}>{item.effort}</Text>
            {dueInfo && (
              <Text style={[styles.actionDue, { color: dueInfo.color }]}>
                {dueInfo.text}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  const renderSectionHeader = (title: string) => {
    if (!title) return null;
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{title}</Text>
      </View>
    );
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Celebration Overlay */}
      {progress === 100 && (
        <Animated.View
          style={[
            styles.celebration,
            {
              opacity: celebrationAnim,
              transform: [{ scale: celebrationAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1.2],
              })}],
            },
          ]}
        >
          <Text style={styles.celebrationEmoji}>🎉</Text>
        </Animated.View>
      )}

      {/* Progress Header */}
      <View style={styles.progressSection}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressPercent}>{progress}%</Text>
        </View>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        <View style={styles.statusCounts}>
          <View style={styles.statusCount}>
            <View style={[styles.statusDot, { backgroundColor: '#666' }]} />
            <Text style={styles.statusCountText}>{pendingCount} pending</Text>
          </View>
          <View style={styles.statusCount}>
            <View style={[styles.statusDot, { backgroundColor: '#D4A84B' }]} />
            <Text style={styles.statusCountText}>{inProgressCount} in progress</Text>
          </View>
          <View style={styles.statusCount}>
            <View style={[styles.statusDot, { backgroundColor: '#2D7D46' }]} />
            <Text style={styles.statusCountText}>{completedCount} done</Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { key: 'all', label: 'All', count: actionItems.length },
            { key: 'high', label: 'High', count: actionItems.filter((a) => a.priority === 'high').length },
            { key: 'pending', label: 'Pending', count: pendingCount },
            { key: 'in_progress', label: 'Active', count: inProgressCount },
            { key: 'completed', label: 'Done', count: completedCount },
          ]}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.filterTab, filter === item.key && styles.filterTabActive]}
              onPress={() => setFilter(item.key as FilterType)}
            >
              <Text style={[styles.filterTabText, filter === item.key && styles.filterTabTextActive]}>
                {item.label} ({item.count})
              </Text>
            </Pressable>
          )}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filterTabs}
        />
      </View>

      {/* Group By Toggle */}
      <View style={styles.groupByContainer}>
        <Text style={styles.groupByLabel}>Group:</Text>
        {(['none', 'category', 'priority'] as GroupByType[]).map((g) => (
          <Pressable
            key={g}
            style={[styles.groupByOption, groupBy === g && styles.groupByOptionActive]}
            onPress={() => setGroupBy(g)}
          >
            <Text style={[styles.groupByText, groupBy === g && styles.groupByTextActive]}>
              {g === 'none' ? 'None' : g.charAt(0).toUpperCase() + g.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Action Items List */}
      <FlatList
        data={groupedItems}
        renderItem={({ item: group }) => (
          <View>
            {renderSectionHeader(group.title)}
            {group.data.map((item) => (
              <View key={item.id}>{renderItem({ item })}</View>
            ))}
          </View>
        )}
        keyExtractor={(item, index) => item.title + index}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Action Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}
      >
        {selectedAction && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setShowDetailModal(false)}>
                <Text style={styles.modalClose}>Close</Text>
              </Pressable>
              <Text style={styles.modalTitle}>Action Details</Text>
              <View style={{ width: 50 }} />
            </View>

            <View style={styles.modalContent}>
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>{selectedAction.title}</Text>
                <View style={styles.modalMeta}>
                  <View style={[styles.priorityBadge, styles[`priorityBadge${selectedAction.priority.charAt(0).toUpperCase() + selectedAction.priority.slice(1)}` as keyof typeof styles]]}>
                    <Text style={styles.priorityBadgeText}>{selectedAction.priority}</Text>
                  </View>
                  <Text style={styles.modalEffort}>Effort: {selectedAction.effort}</Text>
                </View>
              </View>

              {selectedAction.description && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Description</Text>
                  <Text style={styles.modalText}>{selectedAction.description}</Text>
                </View>
              )}

              {selectedAction.expectedImpact && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Expected Impact</Text>
                  <Text style={styles.modalText}>{selectedAction.expectedImpact}</Text>
                </View>
              )}

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Status</Text>
                <View style={styles.statusButtons}>
                  {(['pending', 'in_progress', 'completed'] as ActionStatus[]).map((status) => (
                    <Pressable
                      key={status}
                      style={[
                        styles.statusButton,
                        selectedAction.status === status && styles.statusButtonActive,
                      ]}
                      onPress={() => {
                        handleStatusChange(selectedAction.id, status);
                        setSelectedAction({ ...selectedAction, status });
                      }}
                    >
                      <Text
                        style={[
                          styles.statusButtonText,
                          selectedAction.status === status && styles.statusButtonTextActive,
                        ]}
                      >
                        {status === 'pending' ? 'To Do' : status === 'in_progress' ? 'In Progress' : 'Done'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Notes</Text>
                <TextInput
                  style={styles.notesInput}
                  multiline
                  placeholder="Add notes about this task..."
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  celebration: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    marginLeft: -50,
    zIndex: 100,
  },
  celebrationEmoji: {
    fontSize: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  progressSection: {
    padding: 24,
    backgroundColor: '#F5F3EF',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D5A3D',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E8E4DD',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2D5A3D',
    borderRadius: 4,
  },
  statusCounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusCountText: {
    fontSize: 12,
    color: '#666',
  },
  filterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4DD',
  },
  filterTabs: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F3EF',
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: '#2D5A3D',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  groupByContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: '#FAFAFA',
  },
  groupByLabel: {
    fontSize: 13,
    color: '#666',
    marginRight: 4,
  },
  groupByOption: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  groupByOptionActive: {
    backgroundColor: '#E8E4DD',
  },
  groupByText: {
    fontSize: 12,
    color: '#999',
  },
  groupByTextActive: {
    color: '#1A1A1A',
    fontWeight: '500',
  },
  sectionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D5A3D',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  actionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E4DD',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  actionCardCompleted: {
    backgroundColor: '#F8F8F8',
    borderColor: '#E8E4DD',
    opacity: 0.8,
  },
  actionCardInProgress: {
    borderColor: '#D4A84B',
    borderLeftWidth: 3,
  },
  checkboxContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D4C4A8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2D7D46',
    borderColor: '#2D7D46',
  },
  checkboxInProgress: {
    borderColor: '#D4A84B',
    backgroundColor: '#FFF9E6',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  checkmarkInProgress: {
    color: '#D4A84B',
    fontSize: 10,
  },
  actionContent: {
    flex: 1,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    lineHeight: 20,
  },
  actionTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  priorityBadgeHigh: {
    backgroundColor: '#FDEAEA',
  },
  priorityBadgeMedium: {
    backgroundColor: '#FFF9E6',
  },
  priorityBadgeLow: {
    backgroundColor: '#E8F5E9',
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
  },
  actionDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  actionMeta: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  actionCategory: {
    fontSize: 11,
    color: '#4A7C5C',
    fontWeight: '600',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  actionEffort: {
    fontSize: 11,
    color: '#666',
    backgroundColor: '#F5F3EF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  actionDue: {
    fontSize: 11,
    fontWeight: '500',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4DD',
  },
  modalClose: {
    fontSize: 16,
    color: '#2D5A3D',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  modalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalEffort: {
    fontSize: 14,
    color: '#666',
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F5F3EF',
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: '#2D5A3D',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  statusButtonTextActive: {
    color: '#FFFFFF',
  },
  notesInput: {
    backgroundColor: '#F5F3EF',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1A1A1A',
    minHeight: 120,
    textAlignVertical: 'top',
  },
});
