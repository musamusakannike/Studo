import * as Haptics from 'expo-haptics';
import { HAPTIC_FEEDBACK } from '../constants/config';

export const useHaptics = () => {
  const trigger = (type: keyof typeof HAPTIC_FEEDBACK = 'light') => {
    const feedbackType = HAPTIC_FEEDBACK[type];
    
    switch (feedbackType) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'notificationSuccess':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'notificationWarning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'notificationError':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  };

  return { trigger };
};
