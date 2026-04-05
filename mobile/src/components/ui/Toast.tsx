import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView, AnimatePresence } from 'moti';
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast, Toast as ToastType } from '../../hooks/useToast';
import { spacing, borderRadius, fontSize, fontWeight, iconSize } from '../../constants/spacing';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();
  const { colors } = useTheme();

  const getToastConfig = (type: ToastType['type']) => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: colors.success,
          icon: <CheckCircle size={iconSize.sm} color={colors.textInverse} />,
        };
      case 'error':
        return {
          backgroundColor: colors.error,
          icon: <AlertCircle size={iconSize.sm} color={colors.textInverse} />,
        };
      case 'warning':
        return {
          backgroundColor: colors.warning,
          icon: <AlertTriangle size={iconSize.sm} color={colors.textInverse} />,
        };
      case 'info':
        return {
          backgroundColor: colors.info,
          icon: <Info size={iconSize.sm} color={colors.textInverse} />,
        };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']} pointerEvents="box-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = getToastConfig(toast.type);
          return (
            <MotiView
              key={toast.id}
              from={{ opacity: 0, translateY: -50 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -50 }}
              transition={{ type: 'timing', duration: 300 }}
              style={[
                styles.toast,
                { backgroundColor: config.backgroundColor },
              ]}
            >
              {config.icon}
              <Text style={[styles.message, { color: colors.textInverse }]}>
                {toast.message}
              </Text>
            </MotiView>
          );
        })}
      </AnimatePresence>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: spacing.md,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  message: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginLeft: spacing.sm,
    flex: 1,
  },
});
