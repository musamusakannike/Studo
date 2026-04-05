import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MotiView } from 'moti';
import { ArrowLeft, Star, Users, BookOpen, Play, Lock } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { useTheme } from '../../src/contexts/ThemeContext';
import { courseService } from '../../src/services/course.service';
import { QUERY_KEYS } from '../../src/constants/config';
import { spacing, borderRadius, fontSize, fontWeight, iconSize } from '../../src/constants/spacing';
import { Image } from 'expo-image';
import { showToast } from '../../src/hooks/useToast';

export default function CourseDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { data: courseData, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.COURSE_DETAIL, id],
    queryFn: () => courseService.getCourseById(id as string),
    enabled: !!id,
  });

  const course = courseData?.data;

  const handleEnroll = async () => {
    try {
      await courseService.enrollInCourse(id as string);
      showToast('success', 'Enrolled successfully!');
      router.push(`/course/${id}/lesson/0`);
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to enroll');
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!course) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>Course not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={iconSize.md} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: course.bannerImages[0] || 'https://placehold.co/600x400' }}
          style={styles.banner}
          contentFit="cover"
        />

        <View style={styles.content}>
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400 }}
          >
            <Text style={[styles.courseCode, { color: colors.primary }]}>
              {course.courseCode}
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>{course.title}</Text>

            <View style={styles.stats}>
              <View style={styles.stat}>
                <Star size={iconSize.sm} color={colors.accent} fill={colors.accent} />
                <Text style={[styles.statText, { color: colors.text }]}>
                  {course.averageRating.toFixed(1)}
                </Text>
              </View>
              <View style={styles.stat}>
                <Users size={iconSize.sm} color={colors.textSecondary} />
                <Text style={[styles.statText, { color: colors.text }]}>
                  {course.totalStudents} students
                </Text>
              </View>
              <View style={styles.stat}>
                <BookOpen size={iconSize.sm} color={colors.textSecondary} />
                <Text style={[styles.statText, { color: colors.text }]}>
                  {course.lessons.length} lessons
                </Text>
              </View>
            </View>

            <View style={styles.priceContainer}>
              <Text style={[styles.price, { color: colors.primary }]}>
                ₦{course.price.toLocaleString()}
              </Text>
              <Button
                title="Enroll Now"
                onPress={handleEnroll}
                size="lg"
                style={styles.enrollButton}
              />
            </View>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 200 }}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {course.description}
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 300 }}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Course Content
            </Text>
            {course.lessons.map((lesson, index) => (
              <Card
                key={index}
                style={styles.lessonCard}
                padding="md"
                onPress={() => router.push(`/course/${id}/lesson/${index}`)}
              >
                <View style={styles.lessonHeader}>
                  <View style={styles.lessonInfo}>
                    <Text style={[styles.lessonTitle, { color: colors.text }]}>
                      {lesson.title}
                    </Text>
                    <Text style={[styles.lessonDescription, { color: colors.textSecondary }]}>
                      {lesson.description}
                    </Text>
                  </View>
                  {lesson.isActive ? (
                    <Play size={iconSize.sm} color={colors.primary} />
                  ) : (
                    <Lock size={iconSize.sm} color={colors.textTertiary} />
                  )}
                </View>
              </Card>
            ))}
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 400 }}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Instructor</Text>
            <Card style={styles.tutorCard} padding="md">
              <Image
                source={{
                  uri: course.tutor.profileImage || 'https://placehold.co/100x100',
                }}
                style={styles.tutorImage}
                contentFit="cover"
              />
              <View style={styles.tutorInfo}>
                <Text style={[styles.tutorName, { color: colors.text }]}>
                  {course.tutor.fullName}
                </Text>
                <Text style={[styles.tutorRole, { color: colors.textSecondary }]}>
                  Course Instructor
                </Text>
              </View>
            </Card>
          </MotiView>
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
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: spacing.xl,
  },
  courseCode: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  price: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
  },
  enrollButton: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  description: {
    fontSize: fontSize.md,
    lineHeight: 24,
  },
  lessonCard: {
    marginBottom: spacing.sm,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  lessonTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  lessonDescription: {
    fontSize: fontSize.sm,
  },
  tutorCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tutorImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    marginRight: spacing.md,
  },
  tutorInfo: {
    flex: 1,
  },
  tutorName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  tutorRole: {
    fontSize: fontSize.sm,
  },
  errorText: {
    fontSize: fontSize.lg,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
