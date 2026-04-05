import React, { useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, FlatList, ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { BookOpen, GraduationCap, Wallet, TrendingUp } from 'lucide-react-native';
import { OnboardingSlide } from '../../src/components/auth/OnboardingSlide';
import { Button } from '../../src/components/ui/Button';
import { useTheme } from '../../src/contexts/ThemeContext';
import { spacing, iconSize } from '../../src/constants/spacing';
import { STORAGE_KEYS } from '../../src/constants/config';
import { storageUtils } from '../../src/utils/storage';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Learn Smarter',
    description: 'Access high-quality courses created by expert tutors tailored to your academic level',
    icon: <BookOpen size={iconSize.xl * 2} color="#3B82F6" />,
  },
  {
    id: '2',
    title: 'Practice & Excel',
    description: 'Master your exams with comprehensive past questions and real-time leaderboards',
    icon: <GraduationCap size={iconSize.xl * 2} color="#10B981" />,
  },
  {
    id: '3',
    title: 'Earn & Grow',
    description: 'Share your knowledge as a tutor and earn from your expertise',
    icon: <TrendingUp size={iconSize.xl * 2} color="#F59E0B" />,
  },
  {
    id: '4',
    title: 'Secure Wallet',
    description: 'Manage your earnings and payments seamlessly with our integrated wallet system',
    icon: <Wallet size={iconSize.xl * 2} color="#8B5CF6" />,
  },
];

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = () => {
    storageUtils.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    router.replace('/(auth)/role-selection');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={({ item }) => (
          <OnboardingSlide
            title={item.title}
            description={item.description}
            icon={item.icon}
          />
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <MotiView
              key={index}
              animate={{
                width: currentIndex === index ? 24 : 8,
                backgroundColor: currentIndex === index ? colors.primary : colors.textTertiary,
              }}
              transition={{ type: 'timing', duration: 300 }}
              style={styles.dot}
            />
          ))}
        </View>

        <View style={styles.buttons}>
          {currentIndex < slides.length - 1 && (
            <Button
              title="Skip"
              onPress={handleSkip}
              variant="ghost"
              style={styles.skipButton}
            />
          )}
          <Button
            title={currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
            fullWidth={currentIndex === slides.length - 1}
            style={styles.nextButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  skipButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});
