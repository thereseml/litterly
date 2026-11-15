import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, colors, Field, Loading, Notice, Page, styles } from '../../../../../components/ui';
import { api, errorKey, type Litter, type PetInput, type PetSex } from '../../../../../lib/api';
import { suggestedPetName, validatePets } from '../../../../../lib/pets';

type Draft = { name: string; sex: PetSex | ''; notes: string };

export default function AddPets() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Page><BulkForm key={id} litterId={id} /></Page>;
}

function BulkForm({ litterId }: { litterId: string }) {
  const { t } = useTranslation();
  const [litter, setLitter] = useState<Litter | null>(null);
  const [registered, setRegistered] = useState(0);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const submitting = useRef(false);

  useEffect(() => {
    let active = true;
    void Promise.all([
      api<{ litter: Litter }>(`/litters/${encodeURIComponent(litterId)}`),
      api<{ pets: { id: string }[] }>(`/litters/${encodeURIComponent(litterId)}/pets`),
    ]).then(([{ litter: nextLitter }, { pets }]) => {
      if (!active) return;
      setLitter(nextLitter);
      setRegistered(pets.length);
      const count = Math.min(30, Math.max(1, nextLitter.count - pets.length));
      setDrafts(Array.from({ length: count }, (_, index) => ({
        name: suggestedPetName(nextLitter.species, pets.length + index + 1), sex: '', notes: '',
      })));
    }).catch((cause) => { if (active) setError(errorKey(cause)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [litterId, revision]);

  function change(index: number, patch: Partial<Draft>) {
    setDrafts((current) => current.map((draft, position) => position === index ? { ...draft, ...patch } : draft));
    setError('');
  }

  async function save() {
    if (submitting.current || !litter) return;
    const pets: PetInput[] = drafts.map(({ name, sex, notes }) => ({ name: name.trim(), sex: sex as PetSex, notes: notes.trim() || null }));
    const invalid = validatePets(pets);
    if (invalid) { setError(invalid); return; }
    submitting.current = true;
    setBusy(true); setError('');
    try {
      await api<{ pets: { id: string }[] }>(`/litters/${encodeURIComponent(litterId)}/pets`, { pets });
      router.replace(`/litters/${litterId}`);
    } catch (cause) { setError(errorKey(cause)); }
    finally { submitting.current = false; setBusy(false); }
  }

  if (loading) return <Loading />;
  if (!litter) return <View style={styles.section}><Notice error message={t(error || 'errors.generic')} /><Button title={t('common.retry')} secondary onPress={() => { setError(''); setLoading(true); setRevision((value) => value + 1); }} /></View>;
  const plural = litter.species === 'cat' ? 'pets.kittens' : 'pets.puppies';

  return <>
    <View style={styles.section}>
      <Text style={styles.eyebrow}>{litter.name}</Text>
      <Text style={styles.title}>{t('pets.addTitle', { kind: t(plural).toLocaleLowerCase() })}</Text>
      <Text style={styles.subtitle}>{t('pets.addIntro', { count: drafts.length, registered, total: litter.count })}</Text>
      <Text style={{ fontFamily: 'Inter', color: colors.muted, fontSize: 12 }}>{t('common.required')}</Text>
    </View>
    {drafts.map((draft, index) => <View key={index} style={[styles.card, styles.section]}>
      <View style={styles.row}><Text style={styles.eyebrow}>{t('pets.animalNumber', { number: index + 1 })}</Text>
        {drafts.length > 1 && <Pressable accessibilityRole="button" accessibilityLabel={t('pets.remove')} disabled={busy} onPress={() => setDrafts((current) => current.filter((_, position) => position !== index))}><Text style={{ color: colors.primary, fontFamily: 'Inter', fontSize: 14 }}>{t('pets.remove')}</Text></Pressable>}
      </View>
      <Field label={`${t('pets.name')} *`} value={draft.name} onChangeText={(name) => change(index, { name })} maxLength={100} editable={!busy} />
      <Text style={styles.label}>{t('pets.sex')} *</Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {(['female', 'male'] as const).map((sex) => <Pressable key={sex} accessibilityRole="radio" accessibilityState={{ checked: draft.sex === sex, disabled: busy }} disabled={busy} onPress={() => change(index, { sex })} style={{ flex: 1, minHeight: 48, padding: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 6, borderWidth: 1, borderColor: draft.sex === sex ? colors.primary : colors.line, backgroundColor: draft.sex === sex ? '#F3EEE8' : colors.white }}><Text style={[styles.label, { color: draft.sex === sex ? colors.primary : colors.muted }]}>{t(`pets.${sex}`)}</Text></Pressable>)}
      </View>
      <Field label={`${t('pets.notes')} (${t('common.optional')})`} value={draft.notes} onChangeText={(notes) => change(index, { notes })} maxLength={2000} multiline editable={!busy} />
    </View>)}
    {drafts.length < 30 && <Button title={t('pets.addAnother')} secondary disabled={busy} onPress={() => setDrafts((current) => [...current, { name: suggestedPetName(litter.species, registered + current.length + 1), sex: '', notes: '' }])} />}
    {!!error && <View style={{ marginTop: 16 }}><Notice error message={t(error)} /></View>}
    <View style={{ marginTop: 16 }}><Button title={t('pets.saveCount', { count: drafts.length, kind: t(plural).toLocaleLowerCase() })} busy={busy} disabled={drafts.length === 0} onPress={save} /></View>
  </>;
}
