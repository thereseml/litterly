import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { api, errorKey, type Litter, type Pet } from '../../../lib/api';
import { formatDate } from '../../../lib/litters';
import { Button, Loading, Notice, Page, styles } from '../../../components/ui';

export default function LitterDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Page><Details key={id} id={id} /></Page>;
}

function Details({ id }: { id: string }) {
  const { t, i18n } = useTranslation();
  const [litter, setLitter] = useState<Litter | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useFocusEffect(useCallback(() => {
    let active = true;
    setError('');
    void Promise.all([
      api<{ litter: Litter }>(`/litters/${encodeURIComponent(id)}`),
      api<{ pets: Pet[] }>(`/litters/${encodeURIComponent(id)}/pets`),
    ]).then(([{ litter }, { pets: nextPets }]) => {
      if (active) { setLitter(litter); setPets(nextPets); }
    }).catch((cause) => { if (active) setError(errorKey(cause)); });
    return () => { active = false; };
  // Retry replaces the focused request and its cancellation guard.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, revision]));
  return <>{error ? <View style={styles.section}><Notice error message={t(error)} /><Button title={t('common.retry')} secondary onPress={() => { setError(''); setLitter(null); setRevision(revision + 1); }} /></View> : !litter ? <Loading /> : <>
    <View style={styles.section}>
      <Text style={styles.eyebrow}>{t(`litters.${litter.species}`).toLocaleUpperCase(i18n.language)}</Text>
      <Text style={styles.title}>{litter.name}</Text>
      <Text style={styles.subtitle}>{t('litters.born', { date: formatDate(litter.born_on, i18n.language) })}</Text>
      <Text style={styles.cardTitle}>{t(`litters.${litter.species}Count`, { count: litter.count })}</Text>
    </View>
    <View style={[styles.card, { marginBottom: 24 }]}>
      <Text style={styles.eyebrow}>{t('litters.parents')}</Text>
      <Text style={styles.label}>{t('litters.mother')}</Text><Text style={styles.subtitle}>{litter.mother_name || t('litters.noParent')}</Text>
      <Text style={styles.label}>{t('litters.father')}</Text><Text style={styles.subtitle}>{litter.father_name || t('litters.noParent')}</Text>
    </View>
    {!!litter.notes && <View style={styles.card}><Text style={styles.eyebrow}>{t('litters.notes')}</Text><Text style={styles.subtitle}>{litter.notes}</Text></View>}
    <View style={[styles.section, { marginTop: 24 }]}>
      <View style={styles.row}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.eyebrow}>{t('pets.section')}</Text>
          <Text style={styles.cardTitle}>{t('pets.registeredCount', { registered: pets.length, total: litter.count, kind: t(litter.species === 'cat' ? 'pets.kittens' : 'pets.puppies').toLocaleLowerCase() })}</Text>
        </View>
      </View>
      {pets.length === 0 ? <Text style={styles.subtitle}>{t('pets.empty')}</Text> : pets.map((pet) => <Pressable key={pet.id} accessibilityRole="button" onPress={() => router.push(`/litters/${litter.id}/pets/${pet.id}`)} style={({ pressed }) => [styles.card, { opacity: pressed ? 0.75 : 1 }]}>
        <View style={styles.row}><Text style={styles.cardTitle}>{pet.name}</Text><Text style={styles.label}>{t(`pets.${pet.sex}`)}</Text></View>
      </Pressable>)}
      <Button title={t('pets.addButton', { kind: t(litter.species === 'cat' ? 'pets.kittens' : 'pets.puppies').toLocaleLowerCase() })} onPress={() => router.push(`/litters/${litter.id}/pets/new`)} />
    </View>
  </>}</>;
}
