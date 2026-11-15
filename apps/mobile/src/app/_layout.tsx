import '../lib/i18n';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from '../lib/auth';
import { configured } from '../lib/supabase';
import { colors, Loading, Notice, Page, styles } from '../components/ui';
import { Text } from 'react-native';

function Navigator() {
  const { session, loading } = useAuth();
  const { t } = useTranslation();
  if (!configured) return <Page><Text style={styles.title}>{t('errors.setupTitle')}</Text><Notice message={t('errors.setupBody')} /></Page>;
  if (loading) return <Loading />;
  return <Stack screenOptions={{ headerStyle: { backgroundColor: colors.paper }, headerTintColor: colors.ink, headerShadowVisible: false, contentStyle: { backgroundColor: colors.paper }, headerBackTitle: t('common.back') }}>
    <Stack.Protected guard={!!session}>
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
    </Stack.Protected>
    <Stack.Protected guard={!session}>
      <Stack.Screen name="sign-in" options={{ title: t('common.brand') }} />
    </Stack.Protected>
  </Stack>;
}

export default function RootLayout() {
  return <SafeAreaProvider><AuthProvider><StatusBar style="dark" /><Navigator /></AuthProvider></SafeAreaProvider>;
}
