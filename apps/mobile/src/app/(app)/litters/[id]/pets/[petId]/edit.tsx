import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, colors, Field, Loading, Notice, Page, styles } from '../../../../../../components/ui';
import { api, errorKey, type Pet, type PetInput, type PetSex } from '../../../../../../lib/api';
import { validatePets } from '../../../../../../lib/pets';

export default function EditPet() {
  const { id, petId } = useLocalSearchParams<{ id: string; petId: string }>();
  return <Page><Editor key={`${id}:${petId}`} litterId={id} petId={petId} /></Page>;
}

function Editor({ litterId, petId }: { litterId: string; petId: string }) {
  const { t } = useTranslation();
  const [pet, setPet] = useState<Pet | null>(null);
  const [name, setName] = useState('');
  const [sex, setSex] = useState<PetSex | ''>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);

  useEffect(() => {
    let active = true;
    void api<{ pet: Pet }>(`/litters/${encodeURIComponent(litterId)}/pets/${encodeURIComponent(petId)}`)
      .then(({ pet: result }) => {
        if (active) { setPet(result); setName(result.name); setSex(result.sex); setNotes(result.notes ?? ''); }
      }).catch((cause) => { if (active) setError(errorKey(cause)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [litterId, petId]);

  async function save() {
    if (submitting.current || !pet) return;
    const input: PetInput = { name: name.trim(), sex: sex as PetSex, notes: notes.trim() || null };
    const invalid = validatePets([input]);
    if (invalid) { setError(invalid); return; }
    submitting.current = true; setBusy(true); setError('');
    try {
      await api<{ pet: Pet }>(`/litters/${encodeURIComponent(litterId)}/pets/${encodeURIComponent(petId)}`, input, 'PATCH');
      router.replace(`/litters/${litterId}/pets/${petId}`);
    } catch (cause) { setError(errorKey(cause)); }
    finally { submitting.current = false; setBusy(false); }
  }

  if (loading) return <Loading />;
  if (!pet) return <View style={styles.section}><Notice error message={t(error || 'errors.generic')} /><Button title={t('common.back')} secondary onPress={() => router.back()} /></View>;
  return <View style={styles.section}>
    <Text style={styles.title}>{t('pets.editTitle')}</Text>
    <View style={styles.card}>
      <Field label={`${t('pets.name')} *`} value={name} onChangeText={setName} maxLength={100} editable={!busy} />
      <Text style={styles.label}>{t('pets.sex')} *</Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {(['female', 'male'] as const).map((value) => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: sex === value, disabled: busy }} disabled={busy} onPress={() => setSex(value)} style={{ flex: 1, minHeight: 48, padding: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 6, borderWidth: 1, borderColor: sex === value ? colors.primary : colors.line, backgroundColor: sex === value ? '#F3EEE8' : colors.white }}><Text style={[styles.label, { color: sex === value ? colors.primary : colors.muted }]}>{t(`pets.${value}`)}</Text></Pressable>)}
      </View>
      <Field label={`${t('pets.notes')} (${t('common.optional')})`} value={notes} onChangeText={setNotes} maxLength={2000} multiline editable={!busy} />
      {!!error && <Notice error message={t(error)} />}
      <Button title={t('pets.save')} busy={busy} onPress={save} />
    </View>
  </View>;
}
