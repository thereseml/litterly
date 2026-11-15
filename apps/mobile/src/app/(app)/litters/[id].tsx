import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { api, errorKey, type Litter } from '../../../lib/api';
import { formatDate } from '../../../lib/litters';
import { Button, Loading, Notice, Page, styles } from '../../../components/ui';

export default function LitterDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Page><Details key={id} id={id} /></Page>;
}

function Details({ id }: { id: string }) {
  const { t, i18n } = useTranslation();
  const [litter, setLitter] = useState<Litter | null>(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    void api<{ litter: Litter }>(`/litters/${encodeURIComponent(id)}`).then(({ litter }) => { if (active) setLitter(litter); })
      .catch((error) => { if (active) setError(errorKey(error)); });
    return () => { active = false; };
  }, [id, revision]);
  return <>{error ? <View style={styles.section}><Notice error message={t(error)} /><Button title={t('common.retry')} secondary onPress={() => { setError(''); setLitter(null); setRevision(revision + 1); }} /></View> : !litter ? <Loading /> : <>
    <View style={styles.section}>
      <Text style={styles.eyebrow}>{t(`litters.${litter.species}`).toLocaleUpperCase(i18n.language)}</Text>
      <Text style={styles.title}>{litter.name}</Text>
      <Text style={styles.subtitle}>{t('litters.born', { date: formatDate(litter.born_on, i18n.language) })}</Text>
      <Text style={[styles.title, { fontSize: 28, lineHeight: 36 }]}>{t(`litters.${litter.species}Count`, { count: litter.count })}</Text>
    </View>
    <View style={[styles.card, { marginBottom: 24 }]}>
      <Text style={styles.eyebrow}>{t('litters.parents')}</Text>
      <Text style={styles.label}>{t('litters.mother')}</Text><Text style={styles.subtitle}>{litter.mother_name || t('litters.noParent')}</Text>
      <Text style={styles.label}>{t('litters.father')}</Text><Text style={styles.subtitle}>{litter.father_name || t('litters.noParent')}</Text>
    </View>
    {!!litter.notes && <View style={styles.card}><Text style={styles.eyebrow}>{t('litters.notes')}</Text><Text style={styles.subtitle}>{litter.notes}</Text></View>}
  </>}</>;
}
