import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { MotiView } from 'moti';
import { Search, Filter, BookOpen, Star } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../src/components/ui/Card';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { courseService } from '../../src/services/course.service';
import { Course } from '../../src/types';
import { QUERY_KEYS } from '../../src/constants/config';
import { spacing, borderRadius, fontSize, fontWeight, iconSize } from '../../src/constants/spacing';
import { Image } from 'expo-image';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: myCoursesData, isLoading: loadingMyCourses } = useQuery({
    queryKey: [QUERY_KEYS.MY_COURSES],
    queryFn: () => courseService.getMyCourses(),
  });

  const { data: coursesData, isLoading: loadingCourses } = useQuery({
    queryKey: [QUERY_KEYS.COURSES],
    queryFn: () => courseService.getCourses({ limit: 10 }),
  });

  const myCourses = myCoursesData?.data || [];
  const recommendedCourses = coursesData?.data?.docs || [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const renderCourseCard = ({ item: course }: { item: Course }) => (
    <Card
      onPress={() => router.push(`/course/${course._id}`)}
      style={styles.courseCard}
      padding="md"
    >
      <Image
        source={{ uri: course.bannerImages[0] || 'https://placehold.co/600x400' }}
        style={styles.courseImage}
        contentFit="cover"
      />
      <View style={styles.courseInfo}>
        <Text style={[styles.courseCode, { color: colors.primary }]}>
          {course.courseCode}
        </Text>
        <Text style={[styles.courseTitle, { color: colors.text }]} numberOfLines={2}>
          {course.title}
        </Text>
        <View style={styles.courseStats}>
          <View style={styles.stat}>
            <Star size={iconSize.xs} color={colors.accent} fill={colors.accent} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {course.averageRating.toFixed(1)}
            </Text>
          </View>
          <View style={styles.stat}>
            <BookOpen size={iconSize.xs} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {course.lessons.length} lessons
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );

  const renderContinueLearningCard = ({ item: course }: { item: Course }) => (
    <Card
      onPress={() => router.push(`/course/${course._id}`)}
      style={styles.continueCard}
      padding="md"
    >
      <Image
        source={{ uri: course.bannerImages[0] || 'https://placehold.co/600x400' }}
        style={styles.continueImage}
        contentFit="cover"
      />
      <View style={styles.continueInfo}>
        <Text style={[styles.continueTitle, { color: colors.text }]} numberOfLines={1}>
          {course.title}
        </Text>
        <Text style={[styles.continueCode, { color: colors.textSecondary }]}>
          {course.courseCode}
        </Text>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: colors.primary, width: '45%' },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>45%</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400 }}
          >
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              {getGreeting()},
            </Text>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.fullName || 'Student'}
            </Text>
          </MotiView>
        </View>

        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 100 }}
          style={styles.searchContainer}
        >
          <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Search size={iconSize.sm} color={colors.textTertiary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search courses, past questions..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.primary }]}>
              <Filter size={iconSize.sm} color={colors.textInverse} />
            </TouchableOpacity>
          </View>
        </MotiView>

        {loadingMyCourses ? (
          <LoadingSpinner />
        ) : myCourses.length > 0 ? (
          <MotiView
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 200 }}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Continue Learning
              </Text>
              <TouchableOpacity>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlashList
              data={myCourses}
              renderItem={renderContinueLearningCard}
              horizontal
              showsHorizontalScrollIndicator={false}
              estimatedItemSize={200}
              contentContainerStyle={styles.horizontalList}
            />
          </MotiView>
        ) : null}

        <MotiView
          from={{ opacity: 0, translateX: -20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 300 }}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recommended for You
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>

          {loadingCourses ? (
            <LoadingSpinner />
          ) : (
            <View style={styles.coursesGrid}>
              {recommendedCourses.map((course) => (
                <View key={course._id} style={styles.gridItem}>
                  {renderCourseCard({ item: course })}
                </View>
              ))}
            </View>
          )}
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  greeting: {
    fontSize: fontSize.md,
  },
  userName: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    marginTop: spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
  },
  filterButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  seeAll: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  horizontalList: {
    paddingHorizontal: spacing.xl,
  },
  continueCard: {
    width: 200,
    marginRight: spacing.md,
  },
  continueImage: {
    width: '100%',
    height: 100,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  continueInfo: {
    gap: spacing.xs,
  },
  continueTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  continueCode: {
    fontSize: fontSize.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  coursesGrid: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  gridItem: {
    marginBottom: spacing.md,
  },
  courseCard: {
    flexDirection: 'row',
  },
  courseImage: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  courseInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  courseCode: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  courseTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.xs,
  },
  courseStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: fontSize.xs,
  },
});
