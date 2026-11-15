import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { api, errorKey, type Litter } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../lib/litters';
import { Button, colors, Loading, Notice, Page, styles } from '../../components/ui';

export default function LitterList() {
  const { t, i18n } = useTranslation();
  const [litters, setLitters] = useState<Litter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [signingOut, setSigningOut] = useState(false);
  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true); setError('');
    void api<{ litters: Litter[] }>('/litters').then(({ litters }) => {
      if (active) setLitters(litters);
    }).catch((error) => { if (active) setError(errorKey(error)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  // Retrying must replace the focused request, including its cancellation guard.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revision]));

  async function signOut() {
    setSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
    } catch (error) { setError(errorKey(error)); }
    finally { setSigningOut(false); }
  }
  return <Page>
    <View style={[styles.section, { marginTop: 16 }]}>
      <Text style={styles.eyebrow}>{t('litters.eyebrow')}</Text>
      <Text style={styles.title}>{t('litters.title')}</Text>
      <Text style={styles.subtitle}>{t('litters.intro')}</Text>
    </View>
    {loading ? <Loading /> : error ? <View style={styles.section}><Notice error message={t(error)} /><Button title={t('common.retry')} onPress={() => setRevision(revision + 1)} secondary /></View> : litters.length === 0 ? <View style={[styles.card, { paddingVertical: 32, marginBottom: 24, backgroundColor: '#F3EEE8', borderColor: colors.secondary }]}>
      <Text style={styles.eyebrow}>{t('litters.emptyLabel')}</Text>
      <Text style={styles.cardTitle}>{t('litters.emptyTitle')}</Text>
      <Text style={styles.subtitle}>{t('litters.emptyBody')}</Text>
    </View> : <View style={styles.section}>
      {litters.map((litter) => <Pressable key={litter.id} accessibilityRole="button" accessibilityLabel={litter.name} onPress={() => router.push(`/litters/${litter.id}`)} style={({ pressed }) => [styles.card, { opacity: pressed ? 0.7 : 1 }]}>
        <Text style={styles.eyebrow}>{t(`litters.${litter.species}`).toLocaleUpperCase(i18n.language)}</Text>
        <Text style={styles.cardTitle}>{litter.name}</Text>
        <Text style={styles.subtitle}>{t('litters.born', { date: formatDate(litter.born_on, i18n.language) })}</Text>
        <View style={styles.row}><Text style={styles.label}>{t(`litters.${litter.species}Count`, { count: litter.count })}</Text><Text style={{ color: colors.primary }} aria-hidden>→</Text></View>
      </Pressable>)}
      {litters.length === 100 && <Text style={styles.subtitle}>{t('litters.limit')}</Text>}
    </View>}
    <View style={{ gap: 12, marginTop: 8 }}>
      <Button title={t('litters.new')} onPress={() => router.push('/litters/new')} disabled={signingOut} />
      <Button title={t('common.signOut')} onPress={signOut} busy={signingOut} secondary />
    </View>
  </Page>;
}
