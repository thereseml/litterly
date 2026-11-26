import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Field, Loading, Notice, Page, styles } from '../../components/ui';
import { api, errorKey } from '../../lib/api';
import type { BreederProfile } from '../../lib/api-client';
import { useAuth } from '../../lib/auth';
import { profileInput } from '../../lib/profile';
import { supabase } from '../../lib/supabase';

export default function Profile() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const [kennelName, setKennelName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [revision, setRevision] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError('');
    setSaved(false);
    setLoadFailed(false);
    void api<{ profile: BreederProfile }>('/profile').then(({ profile }) => {
      if (!active) return;
      setKennelName(profile.kennel_name ?? '');
    }).catch((requestError) => {
      if (active) {
        setError(errorKey(requestError));
        setLoadFailed(true);
      }
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  // Retrying replaces the focused request and its cancellation guard.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revision]));

  async function save() {
    const input = profileInput(kennelName);
    if (!input) {
      setError('profile.lengthError');
      setSaved(false);
      return;
    }
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const { profile } = await api<{ profile: BreederProfile }>('/profile', input, 'PATCH');
      setKennelName(profile.kennel_name ?? '');
      setSaved(true);
    } catch (requestError) {
      setError(errorKey(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    setSigningOut(true);
    setError('');
    try {
      const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' });
      if (signOutError) throw signOutError;
      router.replace('/sign-in');
    } catch (signOutError) {
      setError(errorKey(signOutError));
      setSigningOut(false);
    }
  }

  return <Page>
    <View style={[styles.section, { marginTop: 16 }]}>
      <Text style={styles.eyebrow}>{t('profile.eyebrow')}</Text>
      <Text style={styles.title}>{t('profile.title')}</Text>
      <Text style={styles.subtitle}>{t('profile.intro')}</Text>
    </View>
    {loading ? <Loading /> : loadFailed ? <View style={styles.section}>
      <Notice error message={t(error)} />
      <Button title={t('common.retry')} onPress={() => setRevision(revision + 1)} secondary />
    </View> : <View style={styles.section}>
      <Field label={t('profile.email')} value={session?.user.email ?? ''} editable={false} keyboardType="email-address" />
      {!kennelName && <Text style={styles.subtitle}>{t('profile.empty')}</Text>}
      <Field label={t('profile.kennelName')} value={kennelName} onChangeText={(value) => { setKennelName(value); setSaved(false); }} maxLength={101} editable={!saving && !signingOut} returnKeyType="done" />
      {!!error && <Notice error message={t(error)} />}
      {saved && <Notice message={t('profile.saved')} />}
      <Button title={t('profile.save')} onPress={save} busy={saving} disabled={signingOut} />
    </View>}
    <View style={{ marginTop: 8 }}>
      <Button title={t('common.signOut')} onPress={signOut} busy={signingOut} secondary disabled={loading || saving} />
    </View>
  </Page>;
}
