import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MotiView } from 'moti';
import { ArrowLeft, Trophy, Clock, FileQuestion } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { useTheme } from '../../src/contexts/ThemeContext';
import { pastQuestionService } from '../../src/services/pastquestion.service';
import { QUERY_KEYS } from '../../src/constants/config';
import { spacing, borderRadius, fontSize, fontWeight, iconSize } from '../../src/constants/spacing';
import { showToast } from '../../src/hooks/useToast';

export default function PastQuestionDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { data: pastQuestionData, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.PAST_QUESTION_DETAIL, id],
    queryFn: () => pastQuestionService.getPastQuestionById(id as string),
    enabled: !!id,
  });

  const { data: leaderboardData } = useQuery({
    queryKey: [QUERY_KEYS.LEADERBOARD, id],
    queryFn: () => pastQuestionService.getLeaderboard(id as string),
    enabled: !!id,
  });

  const pastQuestion = pastQuestionData?.data;
  const leaderboard = leaderboardData?.data || [];

  const handleStart = async () => {
    if (!pastQuestion?.isFree) {
      try {
        await pastQuestionService.purchasePastQuestion(id as string);
        showToast('success', 'Purchase successful!');
        router.push(`/past-question/${id}/quiz`);
      } catch (error: any) {
        showToast('error', error.response?.data?.message || 'Failed to purchase');
      }
    } else {
      router.push(`/past-question/${id}/quiz`);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!pastQuestion) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>Past question not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={iconSize.md} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400 }}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.secondaryMuted }]}>
              <FileQuestion size={iconSize.xl} color={colors.secondary} />
            </View>

            <Text style={[styles.title, { color: colors.text }]}>{pastQuestion.title}</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {pastQuestion.description}
            </Text>

            <Card style={styles.infoCard} padding="lg">
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <FileQuestion size={iconSize.sm} color={colors.primary} />
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Questions
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {pastQuestion.questions.length}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Clock size={iconSize.sm} color={colors.primary} />
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Time
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {pastQuestion.timeLimit} min
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Trophy size={iconSize.sm} color={colors.primary} />
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Pass Mark
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {pastQuestion.passMark}%
                  </Text>
                </View>
              </View>
            </Card>

            <View style={styles.priceContainer}>
              {pastQuestion.isFree ? (
                <View style={[styles.freeBadge, { backgroundColor: colors.successMuted }]}>
                  <Text style={[styles.freeText, { color: colors.success }]}>FREE</Text>
                </View>
              ) : (
                <Text style={[styles.price, { color: colors.primary }]}>
                  ₦{pastQuestion.price.toLocaleString()}
                </Text>
              )}
              <Button
                title={pastQuestion.isFree ? 'Start Now' : 'Purchase & Start'}
                onPress={handleStart}
                size="lg"
                style={styles.startButton}
              />
            </View>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 200 }}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Leaderboard</Text>
            {leaderboard.length === 0 ? (
              <Card style={styles.emptyCard} padding="xl">
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No attempts yet. Be the first!
                </Text>
              </Card>
            ) : (
              leaderboard.slice(0, 10).map((entry, index) => (
                <Card key={index} style={styles.leaderboardCard} padding="md">
                  <View style={styles.leaderboardContent}>
                    <View style={styles.leaderboardLeft}>
                      <View
                        style={[
                          styles.rank,
                          {
                            backgroundColor:
                              index === 0
                                ? colors.accent
                                : index === 1
                                ? colors.textSecondary
                                : index === 2
                                ? colors.warning
                                : colors.surface,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.rankText,
                            {
                              color: index < 3 ? colors.textInverse : colors.text,
                            },
                          ]}
                        >
                          {index + 1}
                        </Text>
                      </View>
                      <Text style={[styles.userName, { color: colors.text }]}>
                        {entry.user.fullName}
                      </Text>
                    </View>
                    <View style={styles.leaderboardRight}>
                      <Text style={[styles.score, { color: colors.primary }]}>
                        {entry.score}%
                      </Text>
                      <Text style={[styles.time, { color: colors.textSecondary }]}>
                        {entry.timeToComplete}m
                      </Text>
                    </View>
                  </View>
                </Card>
              ))
            )}
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  content: {
    padding: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  infoCard: {
    marginBottom: spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoLabel: {
    fontSize: fontSize.xs,
  },
  infoValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  freeBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  freeText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  price: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
  },
  startButton: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.md,
  },
  leaderboardCard: {
    marginBottom: spacing.sm,
  },
  leaderboardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leaderboardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rank: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  userName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  leaderboardRight: {
    alignItems: 'flex-end',
  },
  score: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  time: {
    fontSize: fontSize.xs,
  },
  errorText: {
    fontSize: fontSize.lg,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
