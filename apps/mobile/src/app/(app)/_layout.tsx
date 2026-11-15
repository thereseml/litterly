import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '../../components/ui';

export default function AppLayout() {
  const { t } = useTranslation();
  return <Stack screenOptions={{ headerStyle: { backgroundColor: colors.paper }, headerTintColor: colors.ink, headerShadowVisible: false, contentStyle: { backgroundColor: colors.paper }, headerBackTitle: t('common.back') }}>
    <Stack.Screen name="index" options={{ title: t('common.brand') }} />
    <Stack.Screen name="litters/new" options={{ title: t('litters.new') }} />
    <Stack.Screen name="litters/[id]" options={{ title: t('litters.details') }} />
  </Stack>;
}
