import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { ArrowLeft, BookOpen, FileText, DollarSign, Tag, Upload } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Card } from '../../src/components/ui/Card';
import { useTheme } from '../../src/contexts/ThemeContext';
import { courseService } from '../../src/services/course.service';
import { showToast } from '../../src/hooks/useToast';
import { spacing, fontSize, fontWeight, iconSize, borderRadius } from '../../src/constants/spacing';

type CourseFormData = {
  title: string;
  description: string;
  category: string;
  price: string;
  thumbnail: string;
};

const CATEGORIES = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Engineering',
  'Business',
  'Languages',
  'Arts',
  'Social Sciences',
];

export default function CreateCourseScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    category: '',
    price: '',
    thumbnail: '',
  });
  const [errors, setErrors] = useState<Partial<CourseFormData>>({});

  const createCourseMutation = useMutation({
    mutationFn: (data: any) => courseService.createCourse(data),
    onSuccess: () => {
      showToast('success', 'Course created successfully!');
      router.back();
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to create course');
    },
  });

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<CourseFormData> = {};

    if (step === 1) {
      if (!formData.title.trim()) {
        newErrors.title = 'Course title is required';
      }
      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
      }
    }

    if (step === 2) {
      if (!formData.category) {
        newErrors.category = 'Please select a category';
      }
      if (!formData.price.trim()) {
        newErrors.price = 'Price is required';
      } else if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
        newErrors.price = 'Please enter a valid price';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = () => {
    const courseData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      price: Number(formData.price),
      thumbnail: formData.thumbnail || 'https://via.placeholder.com/400x300',
    };

    createCourseMutation.mutate(courseData);
  };

  const updateFormData = (field: keyof CourseFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((step) => (
        <View key={step} style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              {
                backgroundColor: step <= currentStep ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                { color: step <= currentStep ? colors.textInverse : colors.textSecondary },
              ]}
            >
              {step}
            </Text>
          </View>
          {step < 3 && (
            <View
              style={[
                styles.stepLine,
                {
                  backgroundColor: step < currentStep ? colors.primary : colors.border,
                },
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <MotiView
      from={{ opacity: 0, translateX: 20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      <Text style={[styles.stepTitle, { color: colors.text }]}>Course Details</Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        Provide basic information about your course
      </Text>

      <Input
        label="Course Title"
        placeholder="e.g., Introduction to React Native"
        value={formData.title}
        onChangeText={(text) => updateFormData('title', text)}
        error={errors.title}
        leftIcon={<BookOpen size={iconSize.sm} color={colors.textTertiary} />}
      />

      <Input
        label="Description"
        placeholder="Describe what students will learn"
        value={formData.description}
        onChangeText={(text) => updateFormData('description', text)}
        error={errors.description}
        multiline
        numberOfLines={4}
        leftIcon={<FileText size={iconSize.sm} color={colors.textTertiary} />}
        style={styles.textArea}
      />
    </MotiView>
  );

  const renderStep2 = () => (
    <MotiView
      from={{ opacity: 0, translateX: 20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      <Text style={[styles.stepTitle, { color: colors.text }]}>Category & Pricing</Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        Set the category and price for your course
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => updateFormData('category', category)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor:
                    formData.category === category ? colors.primary : colors.surface,
                  borderColor: formData.category === category ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  {
                    color:
                      formData.category === category ? colors.textInverse : colors.text,
                  },
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {errors.category && (
          <Text style={[styles.errorText, { color: colors.error }]}>{errors.category}</Text>
        )}
      </View>

      <Input
        label="Price (₦)"
        placeholder="0"
        value={formData.price}
        onChangeText={(text) => updateFormData('price', text)}
        error={errors.price}
        keyboardType="numeric"
        leftIcon={<DollarSign size={iconSize.sm} color={colors.textTertiary} />}
      />
    </MotiView>
  );

  const renderStep3 = () => (
    <MotiView
      from={{ opacity: 0, translateX: 20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      <Text style={[styles.stepTitle, { color: colors.text }]}>Course Thumbnail</Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        Add a thumbnail image for your course (optional)
      </Text>

      <Input
        label="Thumbnail URL"
        placeholder="https://example.com/image.jpg"
        value={formData.thumbnail}
        onChangeText={(text) => updateFormData('thumbnail', text)}
        leftIcon={<Upload size={iconSize.sm} color={colors.textTertiary} />}
      />

      <Card style={styles.previewCard} padding="lg">
        <Text style={[styles.previewTitle, { color: colors.text }]}>Preview</Text>
        <View style={styles.previewContent}>
          <View style={[styles.previewImage, { backgroundColor: colors.border }]}>
            <Upload size={iconSize.xl} color={colors.textTertiary} />
          </View>
          <View style={styles.previewDetails}>
            <Text style={[styles.previewCourseTitle, { color: colors.text }]} numberOfLines={2}>
              {formData.title || 'Course Title'}
            </Text>
            <Text style={[styles.previewCategory, { color: colors.textSecondary }]}>
              {formData.category || 'Category'}
            </Text>
            <Text style={[styles.previewPrice, { color: colors.primary }]}>
              ₦{formData.price || '0'}
            </Text>
          </View>
        </View>
      </Card>
    </MotiView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <ArrowLeft size={iconSize.md} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Create Course</Text>
        <View style={{ width: iconSize.md }} />
      </View>

      {renderStepIndicator()}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={currentStep === 3 ? 'Create Course' : 'Next'}
            onPress={handleNext}
            loading={createCourseMutation.isPending}
            fullWidth
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>
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
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  stepLine: {
    width: 60,
    height: 2,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  stepTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.xl,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
  },
  categoryScroll: {
    marginBottom: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  categoryText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  errorText: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  previewCard: {
    marginTop: spacing.lg,
  },
  previewTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  previewContent: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  previewImage: {
    width: 100,
    height: 75,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  previewCourseTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  previewCategory: {
    fontSize: fontSize.sm,
  },
  previewPrice: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  footer: {
    padding: spacing.xl,
    paddingBottom: spacing.md,
  },
});
