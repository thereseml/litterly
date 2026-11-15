import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Loading, Notice, Page, styles } from '../../../../../../components/ui';
import { api, errorKey, type Pet } from '../../../../../../lib/api';

export default function PetDetails() {
  const { id, petId } = useLocalSearchParams<{ id: string; petId: string }>();
  return <Page><Details key={`${id}:${petId}`} litterId={id} petId={petId} /></Page>;
}

function Details({ litterId, petId }: { litterId: string; petId: string }) {
  const { t } = useTranslation();
  const [pet, setPet] = useState<Pet | null>(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useFocusEffect(useCallback(() => {
    let active = true;
    setError('');
    void api<{ pet: Pet }>(`/litters/${encodeURIComponent(litterId)}/pets/${encodeURIComponent(petId)}`)
      .then(({ pet: result }) => { if (active) setPet(result); })
      .catch((cause) => { if (active) setError(errorKey(cause)); });
    return () => { active = false; };
  // Retry increments revision to refresh the focused screen.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [litterId, petId, revision]));
  if (error) return <View style={styles.section}><Notice error message={t(error)} /><Button title={t('common.retry')} secondary onPress={() => { setPet(null); setRevision((value) => value + 1); }} /></View>;
  if (!pet) return <Loading />;
  return <View style={styles.section}>
    <Text style={styles.eyebrow}>{t('pets.detailsEyebrow')}</Text>
    <Text style={styles.title}>{pet.name}</Text>
    <View style={styles.card}>
      <Text style={styles.label}>{t('pets.sex')}</Text><Text style={styles.subtitle}>{t(`pets.${pet.sex}`)}</Text>
      {pet.notes ? <><Text style={styles.label}>{t('pets.notes')}</Text><Text style={styles.subtitle}>{pet.notes}</Text></> : null}
    </View>
    <Button title={t('pets.edit')} onPress={() => router.push(`/litters/${litterId}/pets/${petId}/edit`)} />
  </View>;
}
