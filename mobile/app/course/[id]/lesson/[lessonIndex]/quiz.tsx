import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MotiView } from 'moti';
import { Clock, CheckCircle, XCircle } from 'lucide-react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card } from '../../../../../src/components/ui/Card';
import { Button } from '../../../../../src/components/ui/Button';
import { LoadingSpinner } from '../../../../../src/components/ui/LoadingSpinner';
import { useTheme } from '../../../../../src/contexts/ThemeContext';
import { courseService } from '../../../../../src/services/course.service';
import { QUERY_KEYS } from '../../../../../src/constants/config';
import { spacing, borderRadius, fontSize, fontWeight, iconSize } from '../../../../../src/constants/spacing';
import { showToast } from '../../../../../src/hooks/useToast';

export default function QuizScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id, lessonIndex } = useLocalSearchParams();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);

  const { data: courseData, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.COURSE_DETAIL, id],
    queryFn: () => courseService.getCourseById(id as string),
    enabled: !!id,
  });

  const submitQuizMutation = useMutation({
    mutationFn: (data: { answers: number[]; timeSpent: number }) =>
      courseService.submitQuiz(id as string, parseInt(lessonIndex as string), data),
    onSuccess: (response) => {
      setQuizResult(response.data);
      setQuizCompleted(true);
      showToast('success', 'Quiz submitted successfully!');
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to submit quiz');
    },
  });

  const course = courseData?.data;
  const lesson = course?.lessons[parseInt(lessonIndex as string)];
  const quiz = lesson?.quiz;
  const questions = quiz?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (quiz && quizStarted && !quizCompleted) {
      setTimeLeft(quiz.timeLimit * 60);
    }
  }, [quiz, quizStarted, quizCompleted]);

  useEffect(() => {
    if (timeLeft > 0 && quizStarted && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quizStarted && !quizCompleted) {
      handleSubmitQuiz();
    }
  }, [timeLeft, quizStarted, quizCompleted]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setSelectedAnswers(new Array(questions.length).fill(-1));
  };

  const handleSelectAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = React.useCallback(() => {
    if (!quiz) return;
    const timeSpent = (quiz.timeLimit * 60 - timeLeft) / 60;
    submitQuizMutation.mutate({
      answers: selectedAnswers,
      timeSpent,
    });
  }, [quiz, timeLeft, selectedAnswers, submitQuizMutation]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!quiz) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>Quiz not found</Text>
      </SafeAreaView>
    );
  }

  if (!quizStarted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <View style={styles.startContainer}>
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 400 }}
          >
            <Text style={[styles.startTitle, { color: colors.text }]}>Ready for the Quiz?</Text>
            <Card style={styles.infoCard} padding="lg">
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Questions
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {questions.length}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Time Limit
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {quiz.timeLimit} minutes
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Pass Mark
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {quiz.passMark}%
                </Text>
              </View>
            </Card>
            <Button
              title="Start Quiz"
              onPress={handleStartQuiz}
              fullWidth
              size="lg"
              style={styles.startButton}
            />
          </MotiView>
        </View>
      </SafeAreaView>
    );
  }

  if (quizCompleted && quizResult) {
    const passed = quizResult.passed;
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <View style={styles.resultContainer}>
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 500 }}
            style={styles.resultContent}
          >
            {passed ? (
              <CheckCircle size={iconSize.xl * 2} color={colors.success} />
            ) : (
              <XCircle size={iconSize.xl * 2} color={colors.error} />
            )}
            <Text style={[styles.resultTitle, { color: colors.text }]}>
              {passed ? 'Congratulations!' : 'Keep Trying!'}
            </Text>
            <Text style={[styles.resultSubtitle, { color: colors.textSecondary }]}>
              {passed ? 'You passed the quiz' : 'You did not pass this time'}
            </Text>
            <Card style={styles.scoreCard} padding="xl">
              <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>
                Your Score
              </Text>
              <Text
                style={[
                  styles.scoreValue,
                  { color: passed ? colors.success : colors.error },
                ]}
              >
                {quizResult.score}%
              </Text>
              <Text style={[styles.correctAnswers, { color: colors.textSecondary }]}>
                {quizResult.correctAnswers.length} of {questions.length} correct
              </Text>
            </Card>
            <View style={styles.resultButtons}>
              <Button
                title="Review Answers"
                onPress={() => {}}
                variant="outline"
                style={styles.resultButton}
              />
              <Button
                title="Continue"
                onPress={() => router.back()}
                style={styles.resultButton}
              />
            </View>
          </MotiView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.quizHeader}>
        <View style={styles.timerContainer}>
          <Clock size={iconSize.sm} color={timeLeft < 60 ? colors.error : colors.primary} />
          <Text
            style={[
              styles.timer,
              { color: timeLeft < 60 ? colors.error : colors.text },
            ]}
          >
            {formatTime(timeLeft)}
          </Text>
        </View>
        <Text style={[styles.questionCounter, { color: colors.textSecondary }]}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </Text>
      </View>

      <ScrollView style={styles.quizContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.questionText, { color: colors.text }]}>
          {currentQuestion.questionText}
        </Text>

        <View style={styles.options}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestionIndex] === index;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleSelectAnswer(index)}
                activeOpacity={0.7}
              >
                <MotiView
                  animate={{
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? colors.primaryMuted : colors.surface,
                  }}
                  transition={{ type: 'timing', duration: 200 }}
                  style={styles.option}
                >
                  <View
                    style={[
                      styles.optionRadio,
                      {
                        borderColor: isSelected ? colors.primary : colors.border,
                        backgroundColor: isSelected ? colors.primary : 'transparent',
                      },
                    ]}
                  />
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    {option}
                  </Text>
                </MotiView>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.quizFooter}>
        <Button
          title="Previous"
          onPress={handlePrevious}
          variant="outline"
          disabled={currentQuestionIndex === 0}
          style={styles.footerButton}
        />
        {currentQuestionIndex === questions.length - 1 ? (
          <Button
            title="Submit"
            onPress={handleSubmitQuiz}
            loading={submitQuizMutation.isPending}
            style={styles.footerButton}
          />
        ) : (
          <Button
            title="Next"
            onPress={handleNext}
            style={styles.footerButton}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  startTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  infoCard: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: fontSize.md,
  },
  infoValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  startButton: {
    marginTop: spacing.md,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timer: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  questionCounter: {
    fontSize: fontSize.sm,
  },
  quizContent: {
    flex: 1,
    padding: spacing.xl,
  },
  questionText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xl,
    lineHeight: 28,
  },
  options: {
    gap: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 2,
  },
  optionRadio: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    marginRight: spacing.md,
  },
  optionText: {
    flex: 1,
    fontSize: fontSize.md,
  },
  quizFooter: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  footerButton: {
    flex: 1,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  resultContent: {
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  resultSubtitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.xl,
  },
  scoreCard: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  scoreLabel: {
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
  },
  scoreValue: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  correctAnswers: {
    fontSize: fontSize.sm,
  },
  resultButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  resultButton: {
    flex: 1,
  },
  errorText: {
    fontSize: fontSize.lg,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
