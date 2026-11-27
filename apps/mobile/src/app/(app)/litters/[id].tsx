import { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Modal, PanResponder, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { api, errorKey, type Litter, type Pet } from '../../../lib/api';
import { formatDate } from '../../../lib/litters';
import { Button, colors, Field, Loading, Notice, Page, styles } from '../../../components/ui';
import { validateWeightMeasurements, weightMeasurementEntries, type WeightDraft } from '../../../lib/weights';

export default function LitterDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Page><Details key={id} id={id} /></Page>;
}

function Details({ id }: { id: string }) {
  const { t, i18n } = useTranslation();
  const [litter, setLitter] = useState<Litter | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [weightDate, setWeightDate] = useState('');
  const [weightDrafts, setWeightDrafts] = useState<WeightDraft[]>([]);
  const [weightError, setWeightError] = useState('');
  const [weightBusy, setWeightBusy] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const submittingWeight = useRef(false);
  const [sheetDragY] = useState(() => new Animated.Value(0));
  const weightPanResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
    onPanResponderTerminationRequest: () => false,
    onPanResponderMove: (_, gesture) => sheetDragY.setValue(Math.max(0, gesture.dy)),
    onPanResponderRelease: (_, gesture) => {
      if (!weightBusy && (gesture.dy > 110 || gesture.vy > 0.9)) {
        setWeightModalVisible(false);
      } else {
        Animated.spring(sheetDragY, { toValue: 0, useNativeDriver: false }).start();
      }
    },
    onPanResponderTerminate: () => Animated.spring(sheetDragY, { toValue: 0, useNativeDriver: false }).start(),
  }), [sheetDragY, weightBusy]);
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

  function openWeightModal() {
    sheetDragY.setValue(0);
    setWeightDate(new Date().toISOString().slice(0, 10));
    setWeightDrafts(pets.map(({ id: petId }) => ({ pet_id: petId, value: '' })));
    setWeightError('');
    setWeightModalVisible(true);
  }

  function closeWeightModal() {
    if (submittingWeight.current) return;
    sheetDragY.setValue(0);
    setWeightModalVisible(false);
  }

  async function saveWeights() {
    if (submittingWeight.current) return;
    const invalid = validateWeightMeasurements(weightDate.trim(), weightDrafts);
    if (invalid) { setWeightError(invalid); return; }
    submittingWeight.current = true;
    setWeightBusy(true); setWeightError('');
    try {
      await api(`/litters/${encodeURIComponent(id)}/weight-measurements`, {
        measured_on: weightDate.trim(), measurements: weightMeasurementEntries(weightDrafts),
      });
      sheetDragY.setValue(0);
      setWeightModalVisible(false);
    } catch (cause) { setWeightError(errorKey(cause)); }
    finally { submittingWeight.current = false; setWeightBusy(false); }
  }

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
      {pets.length > 0 && <Button title={t('weights.addButton')} secondary onPress={openWeightModal} />}
    </View>
    <Modal visible={weightModalVisible} transparent animationType="slide" onRequestClose={closeWeightModal}>
      <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000066', padding: 16 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View style={{ width: '100%', maxWidth: 560, maxHeight: '92%', alignSelf: 'center', borderRadius: 12, padding: 20, backgroundColor: colors.paper, transform: [{ translateY: sheetDragY }] }}>
          <View {...weightPanResponder.panHandlers} accessible accessibilityRole="button" accessibilityLabel={t('weights.swipeToClose')} accessibilityActions={[{ name: 'activate', label: t('common.close') }]} onAccessibilityAction={closeWeightModal} onAccessibilityTap={closeWeightModal} style={{ height: 44, alignItems: 'center', justifyContent: 'center', marginTop: -8 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.secondary }} />
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 14 }}>
            <View style={styles.row}>
              <Text style={styles.title}>{t('weights.modalTitle')}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel={t('common.close')} disabled={weightBusy} onPress={closeWeightModal} hitSlop={10}>
                <Text style={[styles.label, { color: colors.primary }]}>{t('common.close')}</Text>
              </Pressable>
            </View>
            <Text style={styles.subtitle}>{t('weights.modalIntro')}</Text>
            <Field label={`${t('weights.date')} *`} value={weightDate} onChangeText={(value) => { setWeightDate(value); setWeightError(''); }} placeholder="ÅÅÅÅ-MM-DD" editable={!weightBusy} />
            {pets.map((pet, index) => <View key={pet.id} style={[styles.card, { padding: 14 }]}>
              <Text style={styles.cardTitle}>{pet.name}</Text>
              <Field label={`${pet.name} · ${t('weights.value')} (${t('weights.grams')})`} value={weightDrafts[index]?.value ?? ''} onChangeText={(value) => {
                setWeightDrafts((current) => current.map((draft) => draft.pet_id === pet.id ? { ...draft, value } : draft));
                setWeightError('');
              }} keyboardType="number-pad" inputMode="numeric" editable={!weightBusy} />
            </View>)}
            {!!weightError && <Notice error message={t(weightError)} />}
            <Button title={t('weights.save')} busy={weightBusy} onPress={saveWeights} />
            <Button title={t('common.cancel')} secondary disabled={weightBusy} onPress={closeWeightModal} />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  </>}</>;
}
