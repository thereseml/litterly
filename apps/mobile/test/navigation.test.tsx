import { fireEvent, renderRouter, screen, testRouter } from 'expo-router/testing-library';
import { userEvent } from '@testing-library/react-native';
import type { ComponentType } from 'react';
import { Text } from 'react-native';
import AppLayout from '../src/app/(app)/_layout';
import ProfileScreen from '../src/app/(app)/profile';

const mockSignOut = jest.fn();
const mockApi = jest.fn();

jest.mock('../src/lib/api', () => ({
  api: (...args: unknown[]) => mockApi(...args),
  errorKey: () => 'errors.generic',
}));

jest.mock('../src/lib/auth', () => ({
  useAuth: () => ({ session: { user: { email: 'breeder@example.com' } } }),
}));

jest.mock('../src/lib/supabase', () => ({
  supabase: { auth: { signOut: (...args: unknown[]) => mockSignOut(...args) } },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const EmptyRoute = () => null;

const routes: Record<string, ComponentType> = {
  '(app)/_layout': AppLayout,
  '(app)/index': () => <Text>Litter list</Text>,
  '(app)/litters/new': EmptyRoute,
  '(app)/litters/[id]': () => <Text>Litter details</Text>,
  '(app)/litters/[id]/pets/new': EmptyRoute,
  '(app)/litters/[id]/pets/[petId]/index': EmptyRoute,
  '(app)/litters/[id]/pets/[petId]/edit': EmptyRoute,
  '(app)/profile': ProfileScreen,
  'sign-in': () => <Text>Sign in</Text>,
};

beforeEach(() => {
  mockSignOut.mockReset().mockResolvedValue({ error: null });
  mockApi.mockReset().mockResolvedValue({ profile: { kennel_name: null } });
});

test('opens the profile from a nested screen and returns with back navigation', async () => {
  await renderRouter(routes, { initialUrl: '/litters/litter-id' });
  await screen.findByText('Litter details');
  await fireEvent.press(screen.getByRole('button', { name: 'profile.open' }));

  expect(screen).toHavePathname('/profile');
  await testRouter.back('/litters/litter-id');
  expect(screen.getByText('Litter details')).toBeOnTheScreen();
});

test('signs out locally from the profile and replaces the route with sign-in', async () => {
  await renderRouter(routes, { initialUrl: '/profile' });
  await screen.findByText('profile.title');
  await fireEvent.press(screen.getByRole('button', { name: 'common.signOut' }));

  expect(mockSignOut).toHaveBeenCalledWith({ scope: 'local' });
  expect(screen).toHavePathname('/sign-in');
});

test('saves the optional kennel name using a mocked signed-in session', async () => {
  await renderRouter(routes, { initialUrl: '/profile' });
  await screen.findByText('profile.empty');
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('profile.kennelName'), 'Solsken');
  await user.press(screen.getByRole('button', { name: 'profile.save' }));

  expect(mockApi).toHaveBeenCalledWith('/profile', { kennel_name: 'Solsken' }, 'PATCH');
  expect(await screen.findByText('profile.saved')).toBeOnTheScreen();
});
