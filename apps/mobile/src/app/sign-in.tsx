import { useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Field, Notice, Page, styles } from '../components/ui';
import { supabase } from '../lib/supabase';
import { errorKey } from '../lib/api';
import { isValidOtp, normalizeOtp, otpLength } from '../lib/otp';

export default function SignIn() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function sendCode() {
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('errors.email'); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
      if (error) throw error;
      setSent(true);
      setCode('');
    } catch (error) { setError(errorKey(error)); }
    finally { setBusy(false); }
  }

  async function verifyCode() {
    setError('');
    if (!isValidOtp(code.trim())) { setError('errors.code'); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' });
      if (error) throw error;
    } catch (error) { setError(errorKey(error)); }
    finally { setBusy(false); }
  }

  return <Page>
    <View style={[styles.section, { marginTop: 24, marginBottom: 36 }]}>
      <Text style={styles.eyebrow}>{t('auth.eyebrow')}</Text>
      <Text style={[styles.title, { fontSize: 52, lineHeight: 57 }]}>{t('auth.title')}</Text>
      <Text style={styles.subtitle}>{t('auth.intro')}</Text>
    </View>
    <View style={styles.section}>
      <Field label={t('auth.email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" editable={!busy && !sent} />
      {sent && <><Notice message={t('auth.codeSent', { email })} /><Field label={t('auth.code')} value={code} onChangeText={(value) => setCode(normalizeOtp(value))} keyboardType="number-pad" autoComplete="one-time-code" textContentType="oneTimeCode" maxLength={otpLength} editable={!busy} /></>}
      {!!error && <Notice error message={t(error)} />}
      {!sent ? <Button title={t('auth.sendCode')} onPress={sendCode} busy={busy} /> : <><Button title={t('auth.verifyCode')} onPress={verifyCode} busy={busy} /><Button title={t('auth.resend')} onPress={sendCode} busy={busy} secondary /><Button title={t('auth.changeEmail')} onPress={() => { setSent(false); setCode(''); setError(''); }} busy={busy} secondary /></>}
    </View>
  </Page>;
}
