import '../lib/i18n';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
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
  return <Stack screenOptions={{ headerStyle: { backgroundColor: colors.paper }, headerTintColor: colors.primary, headerTitleStyle: { fontFamily: 'Inter', fontSize: 16, fontWeight: '600', color: colors.ink }, headerShadowVisible: false, contentStyle: { backgroundColor: colors.paper }, headerBackTitle: t('common.back') }}>
    <Stack.Protected guard={!!session}>
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
    </Stack.Protected>
    <Stack.Protected guard={!session}>
      <Stack.Screen name="sign-in" options={{ title: t('common.brand'), headerShown: false }} />
    </Stack.Protected>
  </Stack>;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Inter: require('../../assets/fonts/Inter.ttf') });
  return <SafeAreaProvider><StatusBar style="dark" />{fontsLoaded || fontError ? <AuthProvider><Navigator /></AuthProvider> : <Loading />}</SafeAreaProvider>;
}
