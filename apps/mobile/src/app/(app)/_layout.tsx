import { router, Stack } from 'expo-router';
import { Image, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../components/ui';

export default function AppLayout() {
  const { t } = useTranslation();
  return <Stack screenOptions={{ headerStyle: { backgroundColor: colors.paper }, headerTintColor: colors.primary, headerTitleStyle: { fontFamily: 'Inter', fontSize: 16, fontWeight: '600', color: colors.ink }, headerShadowVisible: false, contentStyle: { backgroundColor: colors.paper }, headerBackTitle: t('common.back'), headerRight: () => <Pressable accessibilityRole="button" accessibilityLabel={t('profile.open')} onPress={() => router.push('/profile')} hitSlop={8} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}><View style={{ width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', gap: 2 }}><View style={{ width: 7, height: 7, borderRadius: 4, borderWidth: 1.2, borderColor: colors.primary }} /><View style={{ width: 14, height: 7, borderTopLeftRadius: 8, borderTopRightRadius: 8, borderWidth: 1.2, borderBottomWidth: 0, borderColor: colors.primary }} /></View></Pressable> }}>
    <Stack.Screen name="index" options={{ title: t('common.brand'), headerTitle: () => <Image source={require('../../../assets/litterly-logo.png')} accessibilityLabel={t('common.brand')} resizeMode="contain" style={{ width: 116, height: 38 }} /> }} />
    <Stack.Screen name="profile" options={{ title: t('profile.title'), headerRight: () => null }} />
    <Stack.Screen name="litters/new" options={{ title: t('litters.new') }} />
    <Stack.Screen name="litters/[id]" options={{ title: t('litters.details') }} />
    <Stack.Screen name="litters/[id]/pets/new" options={{ title: t('pets.addTitleShort') }} />
    <Stack.Screen name="litters/[id]/pets/[petId]/index" options={{ title: t('pets.details') }} />
    <Stack.Screen name="litters/[id]/pets/[petId]/edit" options={{ title: t('pets.edit') }} />
  </Stack>;
}
