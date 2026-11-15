import type { PropsWithChildren } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export const colors = { paper: '#F8F5EE', ink: '#253D32', muted: '#70796C', line: '#DEDCD0', sage: '#E8ECDD', white: '#FFFFFF', error: '#A1372D' };
export const styles = StyleSheet.create({
  title: { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontSize: 42, lineHeight: 48, color: colors.ink, letterSpacing: -1.5 },
  subtitle: { fontSize: 16, lineHeight: 25, color: colors.muted },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 2, color: colors.muted },
  section: { gap: 18, marginBottom: 28 },
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 24, gap: 14, borderWidth: 1, borderColor: colors.line },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  label: { fontSize: 14, fontWeight: '600', color: colors.ink },
});

export function Page({ children }: PropsWithChildren) {
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={['left', 'right', 'bottom']}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 24, paddingBottom: 48, width: '100%', maxWidth: 600, alignSelf: 'center', flexGrow: 1 }}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

export function Button({ title, onPress, busy = false, secondary = false, disabled = false }: {
  title: string; onPress: () => void; busy?: boolean; secondary?: boolean; disabled?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: disabled || busy, busy }} disabled={disabled || busy} onPress={onPress}
    style={({ pressed }) => ({ minHeight: 50, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: secondary ? colors.line : colors.ink, backgroundColor: secondary ? 'transparent' : colors.ink, alignItems: 'center', justifyContent: 'center', opacity: busy || disabled ? 0.55 : pressed ? 0.75 : 1 })}>
    {busy ? <ActivityIndicator color={secondary ? colors.ink : colors.white} /> : <Text style={{ fontWeight: '600', fontSize: 15, color: secondary ? colors.ink : colors.white }}>{title}</Text>}
  </Pressable>;
}

export function Field({ label, hint, ...props }: TextInputProps & { label: string; hint?: string }) {
  return <View style={{ gap: 7 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput accessibilityLabel={label} placeholderTextColor="#8B9085" {...props}
      style={[{ minHeight: 50, borderWidth: 1, borderColor: colors.line, borderRadius: 10, backgroundColor: colors.white, padding: 14, fontSize: 16, color: colors.ink }, props.multiline && { minHeight: 120, textAlignVertical: 'top' }, props.style]} />
    {hint ? <Text style={{ color: colors.muted, fontSize: 12 }}>{hint}</Text> : null}
  </View>;
}

export function Notice({ message, error = false }: { message: string; error?: boolean }) {
  return <Text accessibilityRole={error ? 'alert' : 'text'} accessibilityLiveRegion="polite" style={{ padding: 14, borderRadius: 10, backgroundColor: error ? '#F9EAE5' : colors.sage, color: error ? colors.error : colors.ink, lineHeight: 22 }}>{message}</Text>;
}

export function Loading() {
  const { t } = useTranslation();
  return <View style={{ flex: 1, minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 14, backgroundColor: colors.paper }}><ActivityIndicator color={colors.ink} /><Text style={styles.subtitle}>{t('common.loading')}</Text></View>;
}
