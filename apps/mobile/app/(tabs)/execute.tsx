/**
 * Execute Screen - Ring 4: Action Items
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  FlatList,
} from 'react-native';
import { useStrategyStore } from '../../stores/strategyStore';

type ActionItem = {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  category: string;
  status: 'pending' | 'in_progress' | 'completed';
};

export default function ExecuteScreen() {
  const { strategy, updateActionStatus } = useStrategyStore();
  const [filter, setFilter] = useState<'all' | 'high' | 'completed'>('all');

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
  const progress = Math.round((completedCount / actionItems.length) * 100);

  const filteredItems = actionItems.filter((item) => {
    if (filter === 'high') return item.priority === 'high';
    if (filter === 'completed') return item.status === 'completed';
    return true;
  });

  const toggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    updateActionStatus(id, newStatus);
  };

  const renderItem = ({ item }: { item: ActionItem }) => (
    <Pressable
      style={[styles.actionCard, item.status === 'completed' && styles.actionCardCompleted]}
      onPress={() => toggleStatus(item.id, item.status)}
    >
      <View style={styles.checkboxContainer}>
        <View
          style={[styles.checkbox, item.status === 'completed' && styles.checkboxChecked]}
        >
          {item.status === 'completed' && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </View>
      <View style={styles.actionContent}>
        <View style={styles.actionHeader}>
          <Text
            style={[
              styles.actionTitle,
              item.status === 'completed' && styles.actionTitleCompleted,
            ]}
          >
            {item.title}
          </Text>
          <View
            style={[
              styles.priorityDot,
              item.priority === 'high' && styles.priorityDotHigh,
              item.priority === 'medium' && styles.priorityDotMedium,
              item.priority === 'low' && styles.priorityDotLow,
            ]}
          />
        </View>
        <Text style={styles.actionDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.actionMeta}>
          <Text style={styles.actionCategory}>{item.category}</Text>
          <Text style={styles.actionEffort}>Effort: {item.effort}</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Progress Header */}
      <View style={styles.progressSection}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressPercent}>{progress}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressCount}>
          {completedCount} of {actionItems.length} completed
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <Pressable
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}
          >
            All
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterTab, filter === 'high' && styles.filterTabActive]}
          onPress={() => setFilter('high')}
        >
          <Text
            style={[styles.filterTabText, filter === 'high' && styles.filterTabTextActive]}
          >
            High Priority
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterTab, filter === 'completed' && styles.filterTabActive]}
          onPress={() => setFilter('completed')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'completed' && styles.filterTabTextActive,
            ]}
          >
            Completed
          </Text>
        </Pressable>
      </View>

      {/* Action Items List */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2D5A3D',
    borderRadius: 4,
  },
  progressCount: {
    fontSize: 13,
    color: '#666',
  },
  filterTabs: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F3EF',
  },
  filterTabActive: {
    backgroundColor: '#2D5A3D',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  actionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E4DD',
  },
  actionCardCompleted: {
    backgroundColor: '#F5F3EF',
    borderColor: '#E8E4DD',
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
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  actionContent: {
    flex: 1,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  actionTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  priorityDotHigh: {
    backgroundColor: '#C75450',
  },
  priorityDotMedium: {
    backgroundColor: '#D4A84B',
  },
  priorityDotLow: {
    backgroundColor: '#4A7C5C',
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  actionMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCategory: {
    fontSize: 12,
    color: '#4A7C5C',
    fontWeight: '500',
  },
  actionEffort: {
    fontSize: 12,
    color: '#999',
  },
});
