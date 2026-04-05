import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import {
  User as UserIcon,
  Settings,
  Moon,
  Sun,
  Bell,
  Lock,
  Download,
  HelpCircle,
  LogOut,
  ChevronRight,
  Award,
} from 'lucide-react-native';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { showToast } from '../../src/hooks/useToast';
import { spacing, borderRadius, fontSize, fontWeight, iconSize } from '../../src/constants/spacing';
import { Image } from 'expo-image';

export default function ProfileScreen() {
  const { colors, isDark, setThemeMode } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    showToast('success', 'Logged out successfully');
    router.replace('/(auth)/login');
  };

  const handleToggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  const menuItems = [
    {
      icon: UserIcon,
      title: 'Edit Profile',
      onPress: () => router.push('/profile/edit'),
    },
    {
      icon: Bell,
      title: 'Notifications',
      onPress: () => router.push('/profile/notifications'),
    },
    {
      icon: Lock,
      title: 'Security',
      onPress: () => router.push('/profile/security'),
    },
    {
      icon: Download,
      title: 'My Downloads',
      onPress: () => router.push('/profile/downloads'),
    },
    {
      icon: HelpCircle,
      title: 'Help & Support',
      onPress: () => router.push('/profile/help'),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
          <TouchableOpacity onPress={() => router.push('/profile/settings')}>
            <Settings size={iconSize.md} color={colors.text} />
          </TouchableOpacity>
        </View>

        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 400 }}
        >
          <Card style={styles.profileCard} padding="lg">
            <View style={styles.profileHeader}>
              <Image
                source={{ uri: user?.profileImage || 'https://placehold.co/100x100' }}
                style={styles.avatar}
                contentFit="cover"
              />
              <View style={styles.profileInfo}>
                <Text style={[styles.userName, { color: colors.text }]}>
                  {user?.fullName}
                </Text>
                <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                  {user?.email}
                </Text>
                <View
                  style={[
                    styles.roleBadge,
                    {
                      backgroundColor:
                        user?.role === 'tutor' ? colors.primaryMuted : colors.secondaryMuted,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.roleText,
                      {
                        color: user?.role === 'tutor' ? colors.primary : colors.secondary,
                      },
                    ]}
                  >
                    {user?.role === 'tutor' ? 'Tutor' : 'Student'}
                  </Text>
                </View>
              </View>
            </View>

            {user?.role === 'user' && user?.tutorApplicationStatus !== 'approved' && (
              <Button
                title="Become a Tutor"
                onPress={() => router.push('/tutor/apply')}
                variant="primary"
                size="sm"
                icon={<Award size={iconSize.xs} color={colors.textInverse} />}
                style={styles.tutorButton}
              />
            )}
          </Card>
        </MotiView>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Preferences
          </Text>
          <Card padding="none">
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                {isDark ? (
                  <Moon size={iconSize.sm} color={colors.text} />
                ) : (
                  <Sun size={iconSize.sm} color={colors.text} />
                )}
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={handleToggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.textInverse}
              />
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Account
          </Text>
          <Card style={styles.menuCard}>
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={item.title}
                  onPress={item.onPress}
                  style={[
                    styles.menuItem,
                    index !== menuItems.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.menuItemLeft}>
                    <Icon size={iconSize.sm} color={colors.text} />
                    <Text style={[styles.menuItemText, { color: colors.text }]}>
                      {item.title}
                    </Text>
                  </View>
                  <ChevronRight size={iconSize.sm} color={colors.textTertiary} />
                </TouchableOpacity>
              );
            })}
          </Card>
        </View>

        <View style={styles.section}>
          <Button
            title="Log Out"
            onPress={handleLogout}
            variant="danger"
            icon={<LogOut size={iconSize.sm} color={colors.textInverse} />}
            fullWidth
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.version, { color: colors.textTertiary }]}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
  },
  profileCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  roleText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  tutorButton: {
    marginTop: spacing.sm,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuItemText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  version: {
    fontSize: fontSize.xs,
  },
  preferenceCard: {
    padding: 0,
  },
  menuCard: {
    padding: 0,
  },
});
