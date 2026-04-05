import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { Award } from 'lucide-react-native';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { authService } from '../../src/services/auth.service';
import { showToast } from '../../src/hooks/useToast';
import { spacing, fontSize, fontWeight, iconSize, borderRadius } from '../../src/constants/spacing';

export default function TutorApplicationScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { updateUser } = useAuth();

  const [formData, setFormData] = useState({
    bio: '',
    expertise: '',
    qualifications: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required';
    } else if (formData.bio.length < 50) {
      newErrors.bio = 'Bio must be at least 50 characters';
    }

    if (!formData.expertise.trim()) {
      newErrors.expertise = 'Expertise is required';
    }

    if (!formData.qualifications.trim()) {
      newErrors.qualifications = 'Qualifications are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authService.applyForTutor({
        bio: formData.bio,
        expertise: formData.expertise.split(',').map((e) => e.trim()),
        qualifications: formData.qualifications,
      });

      if (response.success) {
        updateUser(response.data);
        showToast('success', 'Application submitted successfully!');
        router.back();
      }
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 400 }}
            style={styles.header}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.primaryMuted }]}>
              <Award size={iconSize.xl} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Become a Tutor</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Share your knowledge and earn money by teaching students
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 200 }}
          >
            <Input
              label="Bio"
              placeholder="Tell us about yourself and your teaching experience"
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              error={errors.bio}
              multiline
              numberOfLines={4}
              style={styles.textArea}
            />

            <Input
              label="Areas of Expertise"
              placeholder="e.g., Mathematics, Physics, Chemistry (comma separated)"
              value={formData.expertise}
              onChangeText={(text) => setFormData({ ...formData, expertise: text })}
              error={errors.expertise}
            />

            <Input
              label="Qualifications"
              placeholder="Your educational background and certifications"
              value={formData.qualifications}
              onChangeText={(text) => setFormData({ ...formData, qualifications: text })}
              error={errors.qualifications}
              multiline
              numberOfLines={3}
              style={styles.textArea}
            />

            <View style={[styles.infoBox, { backgroundColor: colors.infoMuted }]}>
              <Text style={[styles.infoText, { color: colors.info }]}>
                Your application will be reviewed by our team. You'll receive a notification once it's approved.
              </Text>
            </View>

            <Button
              title="Submit Application"
              onPress={handleSubmit}
              loading={loading}
              fullWidth
              size="lg"
              style={styles.submitButton}
            />
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  infoBox: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  infoText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  submitButton: {
    marginTop: spacing.md,
  },
});
