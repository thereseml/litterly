import { fireEvent, renderRouter, screen, testRouter, waitFor } from 'expo-router/testing-library';
import { userEvent } from '@testing-library/react-native';
import type { ComponentType } from 'react';
import { Text } from 'react-native';
import AppLayout from '../src/app/(app)/_layout';
import ProfileScreen from '../src/app/(app)/profile';
import LitterDetails from '../src/app/(app)/litters/[id]';
import PetDetails from '../src/app/(app)/litters/[id]/pets/[petId]/index';

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
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'sv' } }),
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

const weightRoutes = {
  ...routes,
  '(app)/litters/[id]': LitterDetails,
  '(app)/litters/[id]/pets/[petId]/index': PetDetails,
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

test('records only entered weights from the shared-date litter modal', async () => {
  const litter = { id: 'litter-id', species: 'cat', name: 'Vårkullen', born_on: '2024-03-01', count: 2, owner_id: 'owner-id', created_at: '2024-03-01T00:00:00Z', mother_name: null, father_name: null, notes: null };
  const pets = [
    { id: 'pet-1', litter_id: 'litter-id', name: 'Kattunge 1', sex: 'female', notes: null, created_at: '2024-03-01T00:00:00Z', updated_at: '2024-03-01T00:00:00Z' },
    { id: 'pet-2', litter_id: 'litter-id', name: 'Kattunge 2', sex: 'male', notes: null, created_at: '2024-03-01T00:00:00Z', updated_at: '2024-03-01T00:00:00Z' },
  ];
  mockApi.mockImplementation((path: string) => path === '/litters/litter-id'
    ? Promise.resolve({ litter })
    : path === '/litters/litter-id/pets'
      ? Promise.resolve({ pets })
      : Promise.resolve({ measurements: [] }));
  await renderRouter(weightRoutes, { initialUrl: '/litters/litter-id' });
  await fireEvent.press(await screen.findByRole('button', { name: 'weights.addButton' }));
  await screen.findByLabelText('weights.date *');
  expect(screen.getByRole('button', { name: 'weights.swipeToClose' })).toBeOnTheScreen();
  await fireEvent.changeText(screen.getByLabelText('weights.date *'), '2024-03-02');
  await fireEvent.changeText(screen.getByLabelText('Kattunge 1 · weights.value (weights.grams)'), '125');
  await fireEvent.press(screen.getByRole('button', { name: 'weights.save' }));

  await waitFor(() => expect(mockApi).toHaveBeenCalledWith('/litters/litter-id/weight-measurements', {
    measured_on: '2024-03-02', measurements: [{ pet_id: 'pet-1', weight_grams: 125 }],
  }));
});

test('cancels the unsaved weight sheet without creating measurements', async () => {
  const litter = { id: 'litter-id', species: 'cat', name: 'Vårkullen', born_on: '2024-03-01', count: 1, owner_id: 'owner-id', created_at: '2024-03-01T00:00:00Z', mother_name: null, father_name: null, notes: null };
  const pets = [{ id: 'pet-1', litter_id: 'litter-id', name: 'Kattunge 1', sex: 'female', notes: null, created_at: '2024-03-01T00:00:00Z', updated_at: '2024-03-01T00:00:00Z' }];
  mockApi.mockImplementation((path: string) => path === '/litters/litter-id'
    ? Promise.resolve({ litter })
    : path === '/litters/litter-id/pets'
      ? Promise.resolve({ pets })
      : Promise.resolve({ measurements: [] }));
  await renderRouter(weightRoutes, { initialUrl: '/litters/litter-id' });
  await fireEvent.press(await screen.findByRole('button', { name: 'weights.addButton' }));
  await screen.findByLabelText('weights.date *');
  await fireEvent.press(screen.getByRole('button', { name: 'common.cancel' }));
  expect(screen.queryByLabelText('weights.date *')).toBeNull();
  expect(mockApi).not.toHaveBeenCalledWith('/litters/litter-id/weight-measurements', expect.anything());
});

test('shows a translated error when saving weights fails', async () => {
  const litter = { id: 'litter-id', species: 'cat', name: 'Vårkullen', born_on: '2024-03-01', count: 1, owner_id: 'owner-id', created_at: '2024-03-01T00:00:00Z', mother_name: null, father_name: null, notes: null };
  const pets = [{ id: 'pet-1', litter_id: 'litter-id', name: 'Kattunge 1', sex: 'female', notes: null, created_at: '2024-03-01T00:00:00Z', updated_at: '2024-03-01T00:00:00Z' }];
  mockApi.mockImplementation((path: string) => path === '/litters/litter-id'
    ? Promise.resolve({ litter })
    : path === '/litters/litter-id/pets'
      ? Promise.resolve({ pets })
      : Promise.reject(new Error('network')));
  await renderRouter(weightRoutes, { initialUrl: '/litters/litter-id' });
  await fireEvent.press(await screen.findByRole('button', { name: 'weights.addButton' }));
  await fireEvent.changeText(await screen.findByLabelText('Kattunge 1 · weights.value (weights.grams)'), '125');
  await fireEvent.press(screen.getByRole('button', { name: 'weights.save' }));
  expect(await screen.findByText('errors.generic')).toBeOnTheScreen();
});

test('shows chronological weight history including multiple entries on one date', async () => {
  const pet = { id: 'pet-1', litter_id: 'litter-id', name: 'Kattunge 1', sex: 'female', notes: null, created_at: '2024-03-01T00:00:00Z', updated_at: '2024-03-01T00:00:00Z' };
  const measurements = [
    { id: 'weight-1', pet_id: 'pet-1', weight_grams: 120, measured_on: '2024-03-01', created_at: '2024-03-01T10:00:00Z' },
    { id: 'weight-2', pet_id: 'pet-1', weight_grams: 125, measured_on: '2024-03-01', created_at: '2024-03-01T11:00:00Z' },
  ];
  mockApi.mockImplementation((path: string) => path.endsWith('/weight-measurements')
    ? Promise.resolve({ measurements }) : Promise.resolve({ pet }));
  await renderRouter(weightRoutes, { initialUrl: '/litters/litter-id/pets/pet-1' });
  expect(await screen.findByText('120 weights.grams')).toBeOnTheScreen();
  expect(screen.getByText('125 weights.grams')).toBeOnTheScreen();
});

test('shows an empty state when an offspring has no weight history', async () => {
  const pet = { id: 'pet-1', litter_id: 'litter-id', name: 'Kattunge 1', sex: 'female', notes: null, created_at: '2024-03-01T00:00:00Z', updated_at: '2024-03-01T00:00:00Z' };
  mockApi.mockImplementation((path: string) => path.endsWith('/weight-measurements')
    ? Promise.resolve({ measurements: [] }) : Promise.resolve({ pet }));
  await renderRouter(weightRoutes, { initialUrl: '/litters/litter-id/pets/pet-1' });
  expect(await screen.findByText('weights.empty')).toBeOnTheScreen();
});
