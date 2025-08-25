import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Shield, Award, Star, Trophy } from 'lucide-react-native';

interface UserBadgesProps {
  badges: string[];
  points: number;
  reportsSubmitted: number;
  scamsBlocked: number;
}

export default function UserBadges({ badges, points, reportsSubmitted, scamsBlocked }: UserBadgesProps) {
  const getBadgeInfo = (badge: string) => {
    switch (badge) {
      case 'Community Protector':
        return { icon: Shield, color: '#10B981', description: 'Earned 50+ points protecting the community' };
      case 'First Reporter':
        return { icon: Star, color: '#F59E0B', description: 'Submitted your first scam report' };
      case 'Scam Hunter':
        return { icon: Trophy, color: '#EF4444', description: 'Earned 200+ points hunting scams' };
      case 'Vigilant Reporter':
        return { icon: Award, color: '#8B5CF6', description: 'Submitted 10+ scam reports' };
      case 'Shield Guardian':
        return { icon: Shield, color: '#3B82F6', description: 'Blocked 25+ scam attempts' };
      default:
        return { icon: Award, color: '#6B7280', description: 'Special achievement unlocked' };
    }
  };

  const getNextBadgeProgress = () => {
    if (points < 50) {
      return { next: 'Community Protector', needed: 50 - points, total: 50 };
    }
    if (points < 200) {
      return { next: 'Scam Hunter', needed: 200 - points, total: 200 };
    }
    if (reportsSubmitted < 10) {
      return { next: 'Vigilant Reporter', needed: 10 - reportsSubmitted, total: 10, type: 'reports' };
    }
    if (scamsBlocked < 25) {
      return { next: 'Shield Guardian', needed: 25 - scamsBlocked, total: 25, type: 'blocks' };
    }
    return null;
  };

  const nextBadge = getNextBadgeProgress();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Achievements</Text>
        <View style={styles.pointsContainer}>
          <Text style={styles.points}>{points}</Text>
          <Text style={styles.pointsLabel}>points</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesContainer}>
        {badges.map((badge, index) => {
          const badgeInfo = getBadgeInfo(badge);
          const IconComponent = badgeInfo.icon;
          
          return (
            <View key={index} style={[styles.badge, { borderColor: badgeInfo.color }]}>
              <View style={[styles.badgeIcon, { backgroundColor: badgeInfo.color + '20' }]}>
                <IconComponent size={24} color={badgeInfo.color} />
              </View>
              <Text style={styles.badgeName}>{badge}</Text>
              <Text style={styles.badgeDescription}>{badgeInfo.description}</Text>
            </View>
          );
        })}
      </ScrollView>

      {nextBadge && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressTitle}>Next Achievement</Text>
          <View style={styles.progressCard}>
            <Text style={styles.nextBadgeName}>{nextBadge.next}</Text>
            <Text style={styles.progressText}>
              {nextBadge.type === 'reports' 
                ? `${nextBadge.needed} more reports needed`
                : nextBadge.type === 'blocks'
                ? `${nextBadge.needed} more blocks needed`
                : `${nextBadge.needed} more points needed`
              }
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${((nextBadge.total - nextBadge.needed) / nextBadge.total) * 100}%`,
                    backgroundColor: '#3B82F6'
                  }
                ]} 
              />
            </View>
          </View>
        </View>
      )}

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{reportsSubmitted}</Text>
          <Text style={styles.statLabel}>Reports Submitted</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{scamsBlocked}</Text>
          <Text style={styles.statLabel}>Scams Blocked</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  pointsContainer: {
    alignItems: 'center',
  },
  points: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  badgesContainer: {
    marginBottom: 16,
  },
  badge: {
    width: 120,
    padding: 12,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1F2937',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 12,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  progressCard: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
  },
  nextBadgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});
