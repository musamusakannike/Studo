import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useHaptics } from '../../hooks/useHaptics';
import { spacing, borderRadius, fontSize, fontWeight } from '../../constants/spacing';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
}) => {
  const { colors } = useTheme();
  const { trigger } = useHaptics();

  const handlePress = () => {
    if (!disabled && !loading) {
      trigger('light');
      onPress();
    }
  };

  const getBackgroundColor = () => {
    if (disabled) return colors.disabled;
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.secondary;
      case 'outline':
        return 'transparent';
      case 'ghost':
        return 'transparent';
      case 'danger':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.disabledText;
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return colors.textInverse;
      case 'outline':
        return colors.primary;
      case 'ghost':
        return colors.text;
      default:
        return colors.textInverse;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: spacing.sm, paddingHorizontal: spacing.md };
      case 'md':
        return { paddingVertical: spacing.md, paddingHorizontal: spacing.lg };
      case 'lg':
        return { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return fontSize.sm;
      case 'md':
        return fontSize.md;
      case 'lg':
        return fontSize.lg;
    }
  };

  return (
    <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.7}
        style={[
          styles.button,
          {
            backgroundColor: getBackgroundColor(),
            borderWidth: variant === 'outline' ? 1 : 0,
            borderColor: variant === 'outline' ? colors.primary : 'transparent',
            ...getPadding(),
            width: fullWidth ? '100%' : 'auto',
          },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={getTextColor()} />
        ) : (
          <>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text
              style={[
                styles.text,
                {
                  color: getTextColor(),
                  fontSize: getFontSize(),
                },
                textStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
});
