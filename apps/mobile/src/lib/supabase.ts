import 'react-native-url-polyfill/auto';
import { createClient, processLock } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
export const configured = Boolean(url && key && apiUrl && !key.includes('your-'));

const storage = {
  getItem: (name: string) => Platform.OS === 'web'
    ? Promise.resolve(typeof localStorage === 'undefined' ? null : localStorage.getItem(name))
    : SecureStore.getItemAsync(name),
  setItem: (name: string, value: string) => Platform.OS === 'web'
    ? Promise.resolve(localStorage.setItem(name, value))
    : SecureStore.setItemAsync(name, value),
  removeItem: (name: string) => Platform.OS === 'web'
    ? Promise.resolve(localStorage.removeItem(name))
    : SecureStore.deleteItemAsync(name),
};

export const supabase = createClient(url || 'http://127.0.0.1:55421', key || 'not-configured', {
  auth: { storage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false, lock: processLock },
});
