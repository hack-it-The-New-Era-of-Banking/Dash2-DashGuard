import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Shield as ShieldIcon, TriangleAlert as AlertTriangle, MessageSquare, MapPin, Star } from 'lucide-react-native';
import { useTheme } from '../dark'; // Update with correct path
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import UserBadges from '../../components/UserBadges';
import { UserProfileService, UserProfile } from '../../services/userProfile';

export default function ProtectScreen() {
  // Use the theme context to get colors and dark mode state
  const { isDarkMode, colors } = useTheme();
  
  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const userProfileService = UserProfileService.getInstance();

  // State to manage protection status
  const [isProtectionActive, setIsProtectionActive] = useState(true);

  // Reanimated shared values for animations
  const scalePulse = useSharedValue(1); // For glowing effect
  const scaleClick = useSharedValue(1); // For click effect
  const rotate = useSharedValue(0); // For rotation effect

  // Function to toggle protection status
  const toggleProtection = () => {
    setIsProtectionActive((prev) => !prev);
  };

  // Load user profile on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await userProfileService.getProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };
    
    loadProfile();
  }, []);

  // Start pulsating and rotation animations when protection is active
  React.useEffect(() => {
    if (isProtectionActive) {
      scalePulse.value = withRepeat(
        withTiming(1.3, { duration: 1000 }), // Scale up
        -1, // Repeat infinitely
        true // Reverse direction
      );
      rotate.value = withRepeat(withTiming(360, { duration: 4000 }), -1, false); // Rotate 360 degrees
    } else {
      scalePulse.value = withTiming(1, { duration: 300 }); // Reset scale
      rotate.value = withTiming(0, { duration: 300 }); // Reset rotation
    }
  }, [isProtectionActive]);

  // Animated style for the glow effect
  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scalePulse.value }],
      opacity: 1 - (scalePulse.value - 1) / 0.3, // Fade out as it scales up
    };
  });

  // Animated style for the button (click effect)
  const animatedClickStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleClick.value }],
    };
  });

  // Animated style for the shield icon (rotation effect)
  const animatedRotationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotate.value}deg` }], // Rotate based on shared value
    };
  });

  // Handle press-in event
  const onPressIn = () => {
    scaleClick.value = withSpring(0.95); // Scale down slightly
  };

  // Handle press-out event
  const onPressOut = () => {
    scaleClick.value = withSpring(1); // Return to original size
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {userProfile ? `Hello, ${userProfile.name}!` : 'DashGuard'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {userProfile ? `Stay safe in ${userProfile.location}` : 'Your Protection Against Scams'}
        </Text>
      </View>

      {/* User Profile & Badges Section */}
      {userProfile && (
        <View style={styles.profileSection}>
          <UserBadges 
            badges={userProfile.badges}
            points={userProfile.points}
            reportsSubmitted={userProfile.reportsSubmitted}
            scamsBlocked={userProfile.scamsBlocked}
          />
        </View>
      )}

      {/* Risk Profile Section */}
      {userProfile && (
        <View style={[styles.riskSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Risk Profile</Text>
          <View style={styles.riskContent}>
            <View style={styles.riskLevel}>
              <Text style={[styles.riskLevelText, { color: colors.textSecondary }]}>
                Current Risk Level: 
              </Text>
              <Text style={[styles.riskLevelValue, { 
                color: userProfile.riskLevel === 'high' ? '#DC2626' : 
                      userProfile.riskLevel === 'medium' ? '#D97706' : '#10B981' 
              }]}>
                {userProfile.riskLevel.toUpperCase()}
              </Text>
            </View>
            <View style={styles.frequentApps}>
              <Text style={[styles.appsLabel, { color: colors.textSecondary }]}>
                Frequent Apps:
              </Text>
              <View style={styles.appsList}>
                {userProfile.frequentApps.map((app, index) => (
                  <View key={index} style={[styles.appChip, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.appChipText, { color: colors.primary }]}>{app}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Protection Toggle Section */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          onPress={toggleProtection}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={1} // Prevent default opacity animation
        >
          <Animated.View style={[styles.toggleButton, animatedClickStyle]}>
            {/* Glowing Circle */}
            <Animated.View style={[styles.glow, animatedGlowStyle]} />
            {/* Shield Icon */}
            <Animated.View style={[styles.shieldIconContainer, animatedRotationStyle]}>
              <ShieldIcon
                size={48}
                color={isProtectionActive ? '#fff' : '#6366F1'} // Color changes based on state
                fill={isProtectionActive ? '#fff' : 'none'} // Fill changes based on state
                strokeWidth={isProtectionActive ? undefined : 2} // Stroke width for hollow state
              />
            </Animated.View>
            <Text style={styles.toggleButtonText}>
              {isProtectionActive ? 'Protection Active' : 'Protection Inactive'}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <View style={[styles.statBox, { backgroundColor: isDarkMode ? '#3F3F46' : '#FEF3C7' }]}>
            <AlertTriangle size={24} color="#D97706" />
            <Text style={[styles.statNumber, { color: isDarkMode ? '#FBBF24' : '#D97706' }]}>
              {userProfile?.scamsBlocked || 6}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Threats Blocked</Text>
          </View>
        </View>
        <View style={styles.gridItem}>
          <View style={[styles.statBox, { backgroundColor: isDarkMode ? '#3F3F46' : '#E0E7FF' }]}>
            <MessageSquare size={24} color="#4F46E5" />
            <Text style={[styles.statNumber, { color: isDarkMode ? '#818CF8' : '#4F46E5' }]}>
              {userProfile?.reportsSubmitted || 1}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Messages Scanned</Text>
          </View>
        </View>
      </View>

      {/* Location-based Activity Section */}
      {userProfile && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            <MapPin size={16} color={colors.primary} /> Activity in {userProfile.location}
          </Text>
          <View style={styles.locationActivity}>
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>
              5 users in {userProfile.location} reported similar GCash scam this week
            </Text>
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>
              12 PayMaya phishing attempts blocked in your area today
            </Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
        <View style={styles.activityList}>
          {[1, 2, 3].map((item) => (
            <TouchableOpacity key={item} style={[styles.activityItem, { 
              backgroundColor: colors.surface,
              borderColor: colors.border
            }]}>
              <View style={[styles.activityIcon, { backgroundColor: colors.iconBackground }]}>
                <AlertTriangle size={20} color="#DC2626" />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityTitle, { color: colors.text }]}>
                  {userProfile ? `${userProfile.name}, suspicious GCash message blocked` : 'Suspicious Message Blocked'}
                </Text>
                <Text style={[styles.activityTime, { color: colors.textSecondary }]}>2 hours ago</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Personalized Safety Tips */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {userProfile ? `Safety Tips for ${userProfile.name}` : 'Safety Tips'}
        </Text>
        {userProfile && userProfile.frequentApps.includes('GCash') && (
          <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
            ⚠️ {userProfile.name}, always verify GCash promos in your official app, not through SMS links.
          </Text>
        )}
        {userProfile && userProfile.frequentApps.includes('PayMaya') && (
          <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
            ⚠️ {userProfile.name}, PayMaya will never ask for your PIN via SMS or calls.
          </Text>
        )}
        <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
          ⚠️ Never share your OTP or banking credentials. Legitimate banks will never ask for this information.
        </Text>
        <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
          ⚠️ Be cautious of unsolicited messages or calls asking for personal information.
        </Text>
        <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
          ⚠️ Always verify the source before clicking on links or downloading attachments.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  profileSection: {
    backgroundColor: '#F9FAFB',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
  riskSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  riskContent: {
    gap: 12,
  },
  riskLevel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskLevelText: {
    fontSize: 14,
    marginRight: 8,
  },
  riskLevelValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  frequentApps: {
    gap: 8,
  },
  appsLabel: {
    fontSize: 14,
  },
  appsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  appChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  appChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  locationActivity: {
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  toggleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  toggleButton: {
    width: 170,
    height: 170,
    borderRadius: 75, // Half of width/height for a perfect circle
    backgroundColor: '#6366F1', // Primary color for the button
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // Ensure glowing circle stays within bounds
  },
  glow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 75, // Half of width/height for a perfect circle
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Semi-transparent white
  },
  shieldIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  gridItem: {
    flex: 1,
  },
  statBox: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    marginLeft: 12,
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  activityTime: {
    marginTop: 4,
    fontSize: 14,
  },
  tipsImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  tipsText: {
    lineHeight: 24,
    marginBottom: 8,
  },
});