import { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { api, errorKey, type Litter, type LitterInput } from '../../../lib/api';
import { validateLitter } from '../../../lib/litters';
import { Button, colors, Field, Notice, Page, styles } from '../../../components/ui';

export default function NewLitter() {
  const { t } = useTranslation();
  const [species, setSpecies] = useState<'cat' | 'dog'>('cat');
  const [name, setName] = useState('');
  const [bornOn, setBornOn] = useState('');
  const [count, setCount] = useState('');
  const [mother, setMother] = useState('');
  const [father, setFather] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const [error, setError] = useState('');
  async function save() {
    if (submitting.current) return;
    const input: LitterInput = { species, name: name.trim(), born_on: bornOn.trim(), count: /^\d+$/.test(count) ? Number(count) : NaN, mother_name: mother.trim() || null, father_name: father.trim() || null, notes: notes.trim() || null };
    const invalid = validateLitter(input);
    if (invalid) { setError(invalid); return; }
    submitting.current = true;
    setBusy(true); setError('');
    try {
      const { litter } = await api<{ litter: Litter }>('/litters', input);
      router.replace(`/litters/${litter.id}`);
    } catch (error) { setError(errorKey(error)); }
    finally { submitting.current = false; setBusy(false); }
  }
  return <Page><View style={styles.section}>
    <Text style={styles.title}>{t('litters.formTitle')}</Text>
    <Text style={styles.subtitle}>{t('litters.formIntro')}</Text>
    <Text style={{ color: colors.muted, fontSize: 12 }}>{t('common.required')}</Text>
  </View><View style={styles.section}>
    <Text style={styles.label}>{t('litters.species')} *</Text>
    <View style={{ flexDirection: 'row', gap: 12 }}>
      {(['cat', 'dog'] as const).map((value) => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: species === value, disabled: busy }} disabled={busy} onPress={() => setSpecies(value)} style={{ flex: 1, padding: 18, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: species === value ? colors.ink : colors.line, backgroundColor: species === value ? colors.sage : colors.white }}><Text style={styles.label}>{t(`litters.${value}`)}</Text></Pressable>)}
    </View>
    <Field label={`${t('litters.name')} *`} value={name} onChangeText={setName} placeholder={t('litters.namePlaceholder')} maxLength={100} editable={!busy} />
    <Field label={`${t('litters.bornOn')} *`} value={bornOn} onChangeText={setBornOn} placeholder={t('litters.dateHint')} hint={t('litters.dateHint')} maxLength={10} autoCapitalize="none" keyboardType="numbers-and-punctuation" editable={!busy} />
    <Field label={`${t('litters.count')} *`} value={count} onChangeText={setCount} keyboardType="number-pad" maxLength={2} editable={!busy} />
    <Field label={`${t('litters.mother')} (${t('common.optional')})`} value={mother} onChangeText={setMother} maxLength={100} editable={!busy} />
    <Field label={`${t('litters.father')} (${t('common.optional')})`} value={father} onChangeText={setFather} maxLength={100} editable={!busy} />
    <Field label={`${t('litters.notes')} (${t('common.optional')})`} value={notes} onChangeText={setNotes} placeholder={t('litters.notesPlaceholder')} maxLength={2000} multiline editable={!busy} />
    {!!error && <Notice error message={t(error)} />}
    <Button title={t('common.save')} busy={busy} onPress={save} />
  </View></Page>;
}
