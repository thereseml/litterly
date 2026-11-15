import { useState, type PropsWithChildren } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export const colors = {
  paper: '#FAF8F5',
  white: '#FFFFFF',
  ink: '#3D3632',
  muted: '#6B6058',
  subtle: '#9A8F85',
  line: '#E8E2DC',
  primary: '#8B7355',
  primaryLight: '#A68B6A',
  primaryDark: '#6B5344',
  secondary: '#D4C4B5',
  secondaryLight: '#E8DDD3',
  success: '#7DA87B',
  warning: '#D4A574',
  error: '#C97B7B',
  info: '#7BA8C9',
};

export const styles = StyleSheet.create({
  title: { fontFamily: 'Inter', fontSize: 24, lineHeight: 31, fontWeight: '700', color: colors.ink },
  cardTitle: { fontFamily: 'Inter', fontSize: 18, lineHeight: 25, fontWeight: '600', color: colors.ink },
  subtitle: { fontFamily: 'Inter', fontSize: 15, lineHeight: 24, color: colors.muted },
  eyebrow: { fontFamily: 'Inter', fontSize: 12, lineHeight: 18, fontWeight: '500', color: colors.muted },
  section: { gap: 16, marginBottom: 24 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  authCard: { width: '100%', maxWidth: 400, alignSelf: 'center', padding: 24 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  label: { fontFamily: 'Inter', fontSize: 14, lineHeight: 20, fontWeight: '500', color: colors.muted },
});

export function Page({ children }: PropsWithChildren) {
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={['left', 'right', 'bottom']}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingBottom: 40, width: '100%', maxWidth: 600, alignSelf: 'center', flexGrow: 1 }}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

export function Button({ title, onPress, busy = false, secondary = false, disabled = false }: {
  title: string; onPress: () => void; busy?: boolean; secondary?: boolean; disabled?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: disabled || busy, busy }} disabled={disabled || busy} onPress={onPress}
    style={({ pressed }) => ({ minHeight: 48, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 6, borderWidth: 1, borderColor: secondary ? colors.line : colors.primary, backgroundColor: secondary ? colors.white : colors.primary, alignItems: 'center', justifyContent: 'center', opacity: busy || disabled ? 0.6 : pressed ? 0.85 : 1 })}>
    {busy ? <ActivityIndicator color={secondary ? colors.primary : colors.white} /> : <Text style={{ fontFamily: 'Inter', fontWeight: '500', fontSize: 14, color: secondary ? colors.primary : colors.white }}>{title}</Text>}
  </Pressable>;
}

export function Field({ label, hint, ...props }: TextInputProps & { label: string; hint?: string }) {
  const [focused, setFocused] = useState(false);
  return <View style={{ gap: 6 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput accessibilityLabel={label} placeholderTextColor={colors.subtle} {...props}
      onFocus={(event) => { setFocused(true); props.onFocus?.(event); }}
      onBlur={(event) => { setFocused(false); props.onBlur?.(event); }}
      style={[{ minHeight: 48, borderWidth: 1, borderColor: focused ? colors.primary : colors.line, borderRadius: 6, backgroundColor: colors.white, paddingHorizontal: 16, paddingVertical: 10, fontFamily: 'Inter', fontSize: 15, color: colors.ink }, props.multiline && { minHeight: 120, textAlignVertical: 'top' }, props.style]} />
    {hint ? <Text style={{ fontFamily: 'Inter', color: colors.muted, fontSize: 12, lineHeight: 18 }}>{hint}</Text> : null}
  </View>;
}

export function Notice({ message, error = false }: { message: string; error?: boolean }) {
  const tint = error ? colors.error : colors.success;
  return <Text accessibilityRole={error ? 'alert' : 'text'} accessibilityLiveRegion="polite" style={{ padding: 14, borderRadius: 6, backgroundColor: error ? '#F9EEEE' : '#EFF5EE', color: error ? '#A95D5D' : '#5F8A5D', borderWidth: 1, borderColor: tint + '35', fontFamily: 'Inter', fontSize: 14, lineHeight: 22 }}>{message}</Text>;
}

export function Loading() {
  const { t } = useTranslation();
  return <View style={{ flex: 1, minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 14, backgroundColor: colors.paper }}><ActivityIndicator color={colors.primary} /><Text style={styles.subtitle}>{t('common.loading')}</Text></View>;
}
