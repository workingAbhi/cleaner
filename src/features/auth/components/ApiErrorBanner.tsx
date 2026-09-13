import React from 'react';

import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Colors } from '../../../core/theme';

interface ApiErrorBannerProps {
  message: string | null;
  onDismiss: () => void;
}

/** Parses "Unable to create user. Detail: {\"msg\":\"...\"}" and returns the
 *  human-readable sentence only. */
function humanMessage(raw: string): string {
  const detailMatch = raw.match(/Detail:\s*(\{[\s\S]*\})/);
  if (detailMatch) {
    try {
      const parsed = JSON.parse(detailMatch[1]) as Record<string, string>;
      const human = parsed.msg ?? parsed.message ?? parsed.error ?? '';
      if (human) {
        return human;
      }
    } catch {
      // ignore parse errors — fall through
    }
  }
  // Strip any remaining "Detail: ..." suffix so raw JSON never shows
  return raw.replace(/\s*Detail:.*$/s, '').trim();
}

const ApiErrorBanner = ({ message, onDismiss }: ApiErrorBannerProps) => {
  const display = React.useMemo(
    () => (message ? humanMessage(message) : ''),
    [message],
  );

  return (
    <Modal
      visible={Boolean(message)}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}>

      <View style={styles.overlay}>

        <View style={styles.card}>

          {/* Icon */}
          <View style={styles.iconWrap}>
            <Text style={styles.iconText}>!</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Something went wrong</Text>

          {/* Message */}
          <Text style={styles.message}>{display}</Text>

          {/* Hint */}
          <View style={styles.hintRow}>
            <Text style={styles.hintIcon}>ℹ</Text>
            <Text style={styles.hint}>
              Your progress is saved. Fix the issue and try again — you won't
              need to re-verify any completed steps.
            </Text>
          </View>

          {/* Dismiss */}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Dismiss error">
            <Text style={styles.buttonText}>Got it</Text>
          </Pressable>

        </View>

      </View>

    </Modal>
  );
};

const styles = StyleSheet.create({

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },

  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },

  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  iconText: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.error,
    lineHeight: 30,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },

  message: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    width: '100%',
  },

  hintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 12,
    marginBottom: 24,
    gap: 8,
    width: '100%',
  },

  hintIcon: {
    fontSize: 14,
    color: '#16A34A',
    fontWeight: '700',
    marginTop: 1,
  },

  hint: {
    flex: 1,
    fontSize: 13,
    color: '#15803D',
    lineHeight: 19,
  },

  button: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonPressed: {
    opacity: 0.8,
  },

  buttonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

});

export default ApiErrorBanner;
