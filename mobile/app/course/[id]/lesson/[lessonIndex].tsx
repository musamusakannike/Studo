import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { Video, ResizeMode } from 'expo-video';
import RenderHtml from 'react-native-render-html';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/styles/hljs';
import { Button } from '../../../../src/components/ui/Button';
import { LoadingSpinner } from '../../../../src/components/ui/LoadingSpinner';
import { useTheme } from '../../../../src/contexts/ThemeContext';
import { courseService } from '../../../../src/services/course.service';
import { CourseContent } from '../../../../src/types';
import { QUERY_KEYS } from '../../../../src/constants/config';
import { spacing, fontSize, fontWeight, iconSize, borderRadius } from '../../../../src/constants/spacing';
import { Image } from 'expo-image';
import { showToast } from '../../../../src/hooks/useToast';

export default function LessonScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { id, lessonIndex } = useLocalSearchParams();
  const [currentContentIndex, setCurrentContentIndex] = useState(0);

  const { data: courseData, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.COURSE_DETAIL, id],
    queryFn: () => courseService.getCourseById(id as string),
    enabled: !!id,
  });

  const course = courseData?.data;
  const lesson = course?.lessons[parseInt(lessonIndex as string)];
  const sortedContents = lesson?.contents.sort((a, b) => a.order - b.order) || [];
  const currentContent = sortedContents[currentContentIndex];

  const handleNext = () => {
    if (currentContentIndex < sortedContents.length - 1) {
      setCurrentContentIndex(currentContentIndex + 1);
    } else if (lesson?.quiz) {
      router.push(`/course/${id}/lesson/${lessonIndex}/quiz`);
    } else {
      handleCompleteLesson();
    }
  };

  const handleCompleteLesson = async () => {
    try {
      await courseService.completeLesson(id as string, parseInt(lessonIndex as string));
      showToast('success', 'Lesson completed!');
      router.back();
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to complete lesson');
    }
  };

  const renderContent = (content: CourseContent) => {
    switch (content.type) {
      case 'text':
        return (
          <RenderHtml
            contentWidth={width - spacing.xl * 2}
            source={{ html: content.value }}
            baseStyle={{
              color: colors.text,
              fontSize: fontSize.md,
              lineHeight: 24,
            }}
          />
        );

      case 'video':
        return (
          <Video
            source={{ uri: content.value }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
          />
        );

      case 'image':
        return (
          <Image
            source={{ uri: content.value }}
            style={styles.image}
            contentFit="contain"
          />
        );

      case 'code':
        return (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <SyntaxHighlighter
              language="javascript"
              style={atomOneDark}
              customStyle={{
                padding: spacing.md,
                borderRadius: borderRadius.md,
                fontSize: fontSize.sm,
              }}
            >
              {content.value}
            </SyntaxHighlighter>
          </ScrollView>
        );

      case 'latex':
        return (
          <View style={[styles.latexContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.latexText, { color: colors.text }]}>
              {content.value}
            </Text>
          </View>
        );

      default:
        return (
          <Text style={[styles.contentText, { color: colors.text }]}>
            {content.value}
          </Text>
        );
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!lesson) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>Lesson not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={iconSize.md} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {lesson.title}
        </Text>
        <View style={{ width: iconSize.md }} />
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: colors.primary,
              width: `${((currentContentIndex + 1) / sortedContents.length) * 100}%`,
            },
          ]}
        />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {currentContent && renderContent(currentContent)}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={[styles.contentCounter, { color: colors.textSecondary }]}>
          {currentContentIndex + 1} of {sortedContents.length}
        </Text>
        <Button
          title={
            currentContentIndex < sortedContents.length - 1
              ? 'Next'
              : lesson.quiz
              ? 'Take Quiz'
              : 'Complete'
          }
          onPress={handleNext}
          icon={<ChevronRight size={iconSize.sm} color={colors.textInverse} />}
          style={styles.nextButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  progressFill: {
    height: '100%',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.xl,
  },
  video: {
    width: '100%',
    height: 250,
    borderRadius: borderRadius.md,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: borderRadius.md,
  },
  latexContainer: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
  },
  latexText: {
    fontSize: fontSize.md,
    fontFamily: 'monospace',
  },
  contentText: {
    fontSize: fontSize.md,
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  contentCounter: {
    fontSize: fontSize.sm,
  },
  nextButton: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  errorText: {
    fontSize: fontSize.lg,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
