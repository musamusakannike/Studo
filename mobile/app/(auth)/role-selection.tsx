import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { User, UserCheck } from 'lucide-react-native';
import { Button } from '../../src/components/ui/Button';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useHaptics } from '../../src/hooks/useHaptics';
import { spacing, borderRadius, fontSize, fontWeight, iconSize } from '../../src/constants/spacing';

type Role = 'user' | 'tutor';

export default function RoleSelectionScreen() {
  const { colors } = useTheme();
  const { trigger } = useHaptics();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role>('user');

  const handleRoleSelect = (role: Role) => {
    trigger('light');
    setSelectedRole(role);
  };

  const handleContinue = () => {
    trigger('medium');
    router.push({
      pathname: '/(auth)/signup',
      params: { role: selectedRole },
    });
  };

  const roles = [
    {
      id: 'user' as Role,
      title: 'Student',
      description: 'Learn from expert tutors and ace your exams',
      icon: User,
    },
    {
      id: 'tutor' as Role,
      title: 'Tutor',
      description: 'Share your knowledge and earn money',
      icon: UserCheck,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500 }}
        style={styles.header}
      >
        <Text style={[styles.title, { color: colors.text }]}>Join Studo</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Choose how you want to get started
        </Text>
      </MotiView>

      <View style={styles.rolesContainer}>
        {roles.map((role, index) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;

          return (
            <MotiView
              key={role.id}
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'timing', duration: 400, delay: index * 100 }}
            >
              <TouchableOpacity
                onPress={() => handleRoleSelect(role.id)}
                activeOpacity={0.8}
              >
                <MotiView
                  animate={{
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? colors.primaryMuted : colors.surface,
                  }}
                  transition={{ type: 'timing', duration: 200 }}
                  style={[styles.roleCard]}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.background,
                      },
                    ]}
                  >
                    <Icon
                      size={iconSize.lg}
                      color={isSelected ? colors.textInverse : colors.primary}
                    />
                  </View>
                  <Text style={[styles.roleTitle, { color: colors.text }]}>
                    {role.title}
                  </Text>
                  <Text style={[styles.roleDescription, { color: colors.textSecondary }]}>
                    {role.description}
                  </Text>
                </MotiView>
              </TouchableOpacity>
            </MotiView>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Button title="Continue" onPress={handleContinue} fullWidth />
        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          style={styles.loginLink}
        >
          <Text style={[styles.loginText, { color: colors.textSecondary }]}>
            Already have an account?{' '}
            <Text style={{ color: colors.primary, fontWeight: fontWeight.semibold }}>
              Log in
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  rolesContainer: {
    flex: 1,
    gap: spacing.lg,
  },
  roleCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  roleTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  roleDescription: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  footer: {
    paddingBottom: spacing.lg,
  },
  loginLink: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  loginText: {
    fontSize: fontSize.sm,
  },
});
