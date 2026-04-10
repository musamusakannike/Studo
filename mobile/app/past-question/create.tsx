import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { ArrowLeft, BookOpen, FileText, Plus, Trash2, CheckCircle } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Card } from '../../src/components/ui/Card';
import { useTheme } from '../../src/contexts/ThemeContext';
import { pastQuestionService } from '../../src/services/pastquestion.service';
import { showToast } from '../../src/hooks/useToast';
import { spacing, fontSize, fontWeight, iconSize, borderRadius } from '../../src/constants/spacing';

type Question = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
};

type PastQuestionFormData = {
  title: string;
  subject: string;
  year: string;
  institution: string;
  questions: Question[];
};

const SUBJECTS = [
  'Mathematics',
  'English',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Government',
  'Literature',
  'Commerce',
  'Accounting',
];

export default function CreatePastQuestionScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PastQuestionFormData>({
    title: '',
    subject: '',
    year: '',
    institution: '',
    questions: [],
  });
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
  });
  const [errors, setErrors] = useState<any>({});

  const createPastQuestionMutation = useMutation({
    mutationFn: (data: any) => pastQuestionService.createPastQuestion(data),
    onSuccess: () => {
      showToast('success', 'Past question created successfully!');
      router.back();
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to create past question');
    },
  });

  const validateStep = (step: number): boolean => {
    const newErrors: any = {};

    if (step === 1) {
      if (!formData.title.trim()) {
        newErrors.title = 'Title is required';
      }
      if (!formData.subject) {
        newErrors.subject = 'Please select a subject';
      }
      if (!formData.year.trim()) {
        newErrors.year = 'Year is required';
      } else if (isNaN(Number(formData.year)) || Number(formData.year) < 1900 || Number(formData.year) > new Date().getFullYear()) {
        newErrors.year = 'Please enter a valid year';
      }
      if (!formData.institution.trim()) {
        newErrors.institution = 'Institution is required';
      }
    }

    if (step === 2 && formData.questions.length === 0) {
      showToast('error', 'Please add at least one question');
      return false;
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
    const pastQuestionData = {
      title: formData.title,
      subject: formData.subject,
      year: Number(formData.year),
      institution: formData.institution,
      questions: formData.questions,
      totalQuestions: formData.questions.length,
    };

    createPastQuestionMutation.mutate(pastQuestionData);
  };

  const updateFormData = (field: keyof PastQuestionFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const updateCurrentQuestion = (field: keyof Question, value: any) => {
    setCurrentQuestion({ ...currentQuestion, [field]: value });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const addQuestion = () => {
    if (!currentQuestion.question.trim()) {
      showToast('error', 'Please enter a question');
      return;
    }

    if (currentQuestion.options.some(opt => !opt.trim())) {
      showToast('error', 'Please fill all options');
      return;
    }

    setFormData({
      ...formData,
      questions: [...formData.questions, currentQuestion],
    });

    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
    });

    showToast('success', 'Question added!');
  };

  const removeQuestion = (index: number) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
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
      <Text style={[styles.stepTitle, { color: colors.text }]}>Basic Information</Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        Provide details about the past question
      </Text>

      <Input
        label="Title"
        placeholder="e.g., JAMB 2023 Mathematics"
        value={formData.title}
        onChangeText={(text) => updateFormData('title', text)}
        error={errors.title}
        leftIcon={<BookOpen size={iconSize.sm} color={colors.textTertiary} />}
      />

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Subject</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {SUBJECTS.map((subject) => (
            <TouchableOpacity
              key={subject}
              onPress={() => updateFormData('subject', subject)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor:
                    formData.subject === subject ? colors.primary : colors.surface,
                  borderColor: formData.subject === subject ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  {
                    color: formData.subject === subject ? colors.textInverse : colors.text,
                  },
                ]}
              >
                {subject}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {errors.subject && (
          <Text style={[styles.errorText, { color: colors.error }]}>{errors.subject}</Text>
        )}
      </View>

      <Input
        label="Year"
        placeholder="2023"
        value={formData.year}
        onChangeText={(text) => updateFormData('year', text)}
        error={errors.year}
        keyboardType="numeric"
      />

      <Input
        label="Institution"
        placeholder="e.g., JAMB, WAEC, NECO"
        value={formData.institution}
        onChangeText={(text) => updateFormData('institution', text)}
        error={errors.institution}
      />
    </MotiView>
  );

  const renderStep2 = () => (
    <MotiView
      from={{ opacity: 0, translateX: 20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      <Text style={[styles.stepTitle, { color: colors.text }]}>Add Questions</Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        Create questions for this past question set ({formData.questions.length} added)
      </Text>

      <Card style={styles.questionCard} padding="lg">
        <Input
          label="Question"
          placeholder="Enter your question"
          value={currentQuestion.question}
          onChangeText={(text) => updateCurrentQuestion('question', text)}
          multiline
          numberOfLines={3}
          leftIcon={<FileText size={iconSize.sm} color={colors.textTertiary} />}
        />

        <Text style={[styles.optionsLabel, { color: colors.text }]}>Options</Text>
        {currentQuestion.options.map((option, index) => (
          <View key={index} style={styles.optionRow}>
            <TouchableOpacity
              onPress={() => updateCurrentQuestion('correctAnswer', index)}
              style={[
                styles.optionRadio,
                {
                  borderColor: currentQuestion.correctAnswer === index ? colors.success : colors.border,
                  backgroundColor: currentQuestion.correctAnswer === index ? colors.successMuted : 'transparent',
                },
              ]}
            >
              {currentQuestion.correctAnswer === index && (
                <CheckCircle size={iconSize.sm} color={colors.success} />
              )}
            </TouchableOpacity>
            <Input
              placeholder={`Option ${String.fromCharCode(65 + index)}`}
              value={option}
              onChangeText={(text) => updateOption(index, text)}
              style={styles.optionInput}
            />
          </View>
        ))}

        <Input
          label="Explanation (Optional)"
          placeholder="Explain the correct answer"
          value={currentQuestion.explanation}
          onChangeText={(text) => updateCurrentQuestion('explanation', text)}
          multiline
          numberOfLines={2}
        />

        <Button
          title="Add Question"
          onPress={addQuestion}
          variant="outline"
          style={styles.addButton}
        />
      </Card>

      {formData.questions.length > 0 && (
        <View style={styles.questionsList}>
          <Text style={[styles.questionsListTitle, { color: colors.text }]}>
            Added Questions ({formData.questions.length})
          </Text>
          {formData.questions.map((q, index) => (
            <Card key={index} style={styles.questionItem} padding="md">
              <View style={styles.questionItemHeader}>
                <Text style={[styles.questionItemNumber, { color: colors.textSecondary }]}>
                  Q{index + 1}
                </Text>
                <TouchableOpacity onPress={() => removeQuestion(index)}>
                  <Trash2 size={iconSize.sm} color={colors.error} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.questionItemText, { color: colors.text }]} numberOfLines={2}>
                {q.question}
              </Text>
            </Card>
          ))}
        </View>
      )}
    </MotiView>
  );

  const renderStep3 = () => (
    <MotiView
      from={{ opacity: 0, translateX: 20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      <Text style={[styles.stepTitle, { color: colors.text }]}>Review & Submit</Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        Review your past question before submitting
      </Text>

      <Card style={styles.reviewCard} padding="lg">
        <View style={styles.reviewRow}>
          <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Title</Text>
          <Text style={[styles.reviewValue, { color: colors.text }]}>{formData.title}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Subject</Text>
          <Text style={[styles.reviewValue, { color: colors.text }]}>{formData.subject}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Year</Text>
          <Text style={[styles.reviewValue, { color: colors.text }]}>{formData.year}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Institution</Text>
          <Text style={[styles.reviewValue, { color: colors.text }]}>{formData.institution}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Total Questions</Text>
          <Text style={[styles.reviewValue, { color: colors.primary }]}>
            {formData.questions.length}
          </Text>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Create Past Question</Text>
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
            title={currentStep === 3 ? 'Submit Past Question' : 'Next'}
            onPress={handleNext}
            loading={createPastQuestionMutation.isPending}
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
  questionCard: {
    marginBottom: spacing.lg,
  },
  optionsLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  optionRadio: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionInput: {
    flex: 1,
  },
  addButton: {
    marginTop: spacing.md,
  },
  questionsList: {
    marginTop: spacing.lg,
  },
  questionsListTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  questionItem: {
    marginBottom: spacing.sm,
  },
  questionItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  questionItemNumber: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  questionItemText: {
    fontSize: fontSize.sm,
  },
  reviewCard: {
    marginTop: spacing.md,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  reviewLabel: {
    fontSize: fontSize.sm,
  },
  reviewValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  footer: {
    padding: spacing.xl,
    paddingBottom: spacing.md,
  },
});
