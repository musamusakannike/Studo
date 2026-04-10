import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Search, BookOpen, FileQuestion, Star, Plus } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../src/components/ui/Card';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { useTheme } from '../../src/contexts/ThemeContext';
import { courseService } from '../../src/services/course.service';
import { pastQuestionService } from '../../src/services/pastquestion.service';
import { Course, PastQuestion, CourseLevel } from '../../src/types';
import { QUERY_KEYS } from '../../src/constants/config';
import { spacing, borderRadius, fontSize, fontWeight, iconSize } from '../../src/constants/spacing';
import { Image } from 'expo-image';

type TabType = 'courses' | 'pastQuestions';

const levels: CourseLevel[] = ['100', '200', '300', '400', '500'];

export default function ExploreScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('courses');
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: coursesData, isLoading: loadingCourses } = useQuery({
    queryKey: [QUERY_KEYS.COURSES, selectedLevel, searchQuery],
    queryFn: () => courseService.getCourses({ 
      level: selectedLevel || undefined,
      search: searchQuery || undefined,
    }),
  });

  const { data: pastQuestionsData, isLoading: loadingPastQuestions } = useQuery({
    queryKey: [QUERY_KEYS.PAST_QUESTIONS, selectedLevel, searchQuery],
    queryFn: () => pastQuestionService.getPastQuestions({
      level: selectedLevel || undefined,
      search: searchQuery || undefined,
    }),
  });

  const courses = coursesData?.data?.docs || [];
  const pastQuestions = pastQuestionsData?.data?.docs || [];

  const renderCourseItem = ({ item: course }: { item: Course }) => (
    <Card
      onPress={() => router.push(`/course/${course._id}`)}
      style={styles.itemCard}
      padding="md"
    >
      <Image
        source={{ uri: course.bannerImages[0] || 'https://placehold.co/600x400' }}
        style={styles.itemImage}
        contentFit="cover"
      />
      <View style={styles.itemInfo}>
        <View style={styles.itemHeader}>
          <Text style={[styles.itemCode, { color: colors.primary }]}>
            {course.courseCode}
          </Text>
          <View style={[styles.levelBadge, { backgroundColor: colors.primaryMuted }]}>
            <Text style={[styles.levelText, { color: colors.primary }]}>
              {course.level}L
            </Text>
          </View>
        </View>
        <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={2}>
          {course.title}
        </Text>
        <Text style={[styles.itemDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {course.description}
        </Text>
        <View style={styles.itemFooter}>
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
          <Text style={[styles.price, { color: colors.primary }]}>
            ₦{course.price.toLocaleString()}
          </Text>
        </View>
      </View>
    </Card>
  );

  const renderPastQuestionItem = ({ item: pastQuestion }: { item: PastQuestion }) => (
    <Card
      onPress={() => router.push(`/past-question/${pastQuestion._id}`)}
      style={styles.itemCard}
      padding="md"
    >
      <View style={[styles.pqIcon, { backgroundColor: colors.secondaryMuted }]}>
        <FileQuestion size={iconSize.lg} color={colors.secondary} />
      </View>
      <View style={styles.itemInfo}>
        <View style={styles.itemHeader}>
          <View style={[styles.levelBadge, { backgroundColor: colors.primaryMuted }]}>
            <Text style={[styles.levelText, { color: colors.primary }]}>
              {pastQuestion.level}L
            </Text>
          </View>
          {pastQuestion.isFree && (
            <View style={[styles.freeBadge, { backgroundColor: colors.successMuted }]}>
              <Text style={[styles.freeText, { color: colors.success }]}>FREE</Text>
            </View>
          )}
        </View>
        <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={2}>
          {pastQuestion.title}
        </Text>
        <Text style={[styles.itemDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {pastQuestion.description}
        </Text>
        <View style={styles.itemFooter}>
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {pastQuestion.questions.length} questions
          </Text>
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {pastQuestion.timeLimit} mins
          </Text>
          {!pastQuestion.isFree && (
            <Text style={[styles.price, { color: colors.primary }]}>
              ₦{pastQuestion.price.toLocaleString()}
            </Text>
          )}
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Explore</Text>
        
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={iconSize.sm} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            onPress={() => setActiveTab('courses')}
            style={[
              styles.tab,
              activeTab === 'courses' && { borderBottomColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'courses' ? colors.primary : colors.textSecondary },
              ]}
            >
              Courses
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('pastQuestions')}
            style={[
              styles.tab,
              activeTab === 'pastQuestions' && { borderBottomColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'pastQuestions' ? colors.primary : colors.textSecondary },
              ]}
            >
              Past Questions
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filters}>
          <TouchableOpacity
            onPress={() => setSelectedLevel(null)}
            style={[
              styles.filterChip,
              {
                backgroundColor: selectedLevel === null ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: selectedLevel === null ? colors.textInverse : colors.text },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {levels.map((level) => (
            <TouchableOpacity
              key={level}
              onPress={() => setSelectedLevel(level)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: selectedLevel === level ? colors.primary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: selectedLevel === level ? colors.textInverse : colors.text },
                ]}
              >
                {level}L
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {activeTab === 'courses' ? (
        loadingCourses ? (
          <LoadingSpinner />
        ) : (
          <FlashList
            data={courses}
            renderItem={renderCourseItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : loadingPastQuestions ? (
        <LoadingSpinner />
      ) : (
        <FlashList
          data={pastQuestions}
          renderItem={renderPastQuestionItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {activeTab === 'pastQuestions' && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/past-question/create' as any)}
        >
          <Plus size={iconSize.lg} color={colors.textInverse} />
        </TouchableOpacity>
      )}
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
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    alignItems: 'center',
  },
  tabText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  filterText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  itemCard: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  itemImage: {
    width: 100,
    height: 120,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  pqIcon: {
    width: 100,
    height: 120,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  itemCode: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  levelBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  levelText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  freeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  freeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  itemTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.xs,
  },
  itemDescription: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
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
  price: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    marginLeft: 'auto',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
