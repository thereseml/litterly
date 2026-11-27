import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Loading, Notice, Page, styles } from '../../../../../../components/ui';
import { api, errorKey, type Pet, type WeightMeasurement } from '../../../../../../lib/api';
import { formatDate } from '../../../../../../lib/litters';

export default function PetDetails() {
  const { id, petId } = useLocalSearchParams<{ id: string; petId: string }>();
  return <Page><Details key={`${id}:${petId}`} litterId={id} petId={petId} /></Page>;
}

function Details({ litterId, petId }: { litterId: string; petId: string }) {
  const { t, i18n } = useTranslation();
  const [pet, setPet] = useState<Pet | null>(null);
  const [measurements, setMeasurements] = useState<WeightMeasurement[]>([]);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useFocusEffect(useCallback(() => {
    let active = true;
    setError('');
    void Promise.all([
      api<{ pet: Pet }>(`/litters/${encodeURIComponent(litterId)}/pets/${encodeURIComponent(petId)}`),
      api<{ measurements: WeightMeasurement[] }>(`/litters/${encodeURIComponent(litterId)}/pets/${encodeURIComponent(petId)}/weight-measurements`),
    ]).then(([{ pet: result }, { measurements: weightHistory }]) => {
      if (active) { setPet(result); setMeasurements(weightHistory); }
    })
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
    <View style={styles.card}>
      <Text style={styles.eyebrow}>{t('weights.history')}</Text>
      {measurements.length === 0
        ? <Text style={styles.subtitle}>{t('weights.empty')}</Text>
        : measurements.map((measurement) => <View key={measurement.id} style={styles.row}>
          <Text style={styles.subtitle}>{formatDate(measurement.measured_on, i18n.language)}</Text>
          <Text style={styles.cardTitle}>{measurement.weight_grams} {t('weights.grams')}</Text>
        </View>)}
    </View>
    <Button title={t('pets.edit')} onPress={() => router.push(`/litters/${litterId}/pets/${petId}/edit`)} />
  </View>;
}
