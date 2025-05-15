import { render, fireEvent } from '@testing-library/react-native';
import { act, renderHook } from '@testing-library/react-hooks';
import { Text, TouchableOpacity, View } from 'react-native';

import { AppProvider, useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useFast } from '../context/FastContext';

const mockUseAuth = jest.fn();
const mockUseFast = jest.fn();
const mockUseAppContext = jest.fn();

jest.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }) => <>{children}</>,
  useAuth: () => mockUseAuth(),
}));

jest.mock('../context/FastContext', () => ({
  FastProvider: ({ children }) => <>{children}</>,
  useFast: () => mockUseFast(),
}));

jest.mock('../context/AppContext', () => ({
  AppProvider: ({ children }) => <>{children}</>,
  useAppContext: () => mockUseAppContext(),
}));

const Button = ({ title, onPress, testID }) => (
  <TouchableOpacity onPress={onPress} testID={testID}>
    <Text>{title}</Text>
  </TouchableOpacity>
);

describe('AppContext', () => {
  it('provides default onboarding status and allows completion', async () => {
    mockUseAppContext.mockReturnValue({
      hasCompletedOnboarding: false,
      setOnboardingComplete: jest.fn().mockImplementation(() => {
        mockUseAppContext.mockReturnValue({
          hasCompletedOnboarding: true,
          setOnboardingComplete: jest.fn(),
        });
        return Promise.resolve();
      }),
    });

    const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>;
    const { result, rerender } = renderHook(() => useAppContext(), { wrapper });

    expect(result.current.hasCompletedOnboarding).toBe(false);

    await act(async () => {
      await result.current.setOnboardingComplete();
    });

    rerender();
    expect(result.current.hasCompletedOnboarding).toBe(true);
  });
});

describe('AuthContext', () => {
  it('initializes with no user and loading false', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    const authState = useAuth();
    expect(authState.user).toBeNull();
    expect(authState.loading).toBe(false);
  });

  it('renders user email and logout button', () => {
    const mockUser = { email: 'test@example.com', uid: '123' };
    const mockLogout = jest.fn();
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
      deleteAccount: jest.fn(),
      loading: false,
    });

    const TestComponent = () => {
      const { user, logout } = useAuth();
      return (
        <>
          {user && <Text testID="email-text">{user.email}</Text>}
          <Button title="Log Out" onPress={logout} testID="logout-btn" />
        </>
      );
    };

    const { getByTestId } = render(<TestComponent />);
    expect(getByTestId('email-text')).toBeTruthy();
    expect(getByTestId('logout-btn')).toBeTruthy();
  });
});

describe('FastContext', () => {
  it('provides initial fast state', () => {
    mockUseFast.mockReturnValue({
      fastState: { isActive: false, startTime: null, targetDuration: null },
      fastHistory: [],
      loading: false,
    });

    const fastState = useFast();
    expect(fastState.fastState.isActive).toBe(false);
    expect(fastState.fastHistory).toEqual([]);
    expect(fastState.loading).toBe(false);
  });

  it('allows starting and ending a fast', async () => {
    const mockStartFast = jest.fn(() => Promise.resolve());
    const mockEndFast = jest.fn(() => Promise.resolve());
    
    mockUseFast.mockReturnValue({
      fastState: { isActive: false, startTime: null, targetDuration: null },
      startFast: mockStartFast,
      endFast: mockEndFast,
      loading: false,
    });

    const TestComponent = () => {
      const { startFast, endFast, fastState } = useFast();
      return (
        <View>
          <TouchableOpacity onPress={() => startFast()} testID="start-btn">
            <Text>Start</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => endFast()} testID="end-btn">
            <Text>End</Text>
          </TouchableOpacity>
          <Text testID="fastStatus">{fastState.isActive ? 'Active' : 'Inactive'}</Text>
        </View>
      );
    };

    const { getByTestId } = render(<TestComponent />);
    
    fireEvent.press(getByTestId('start-btn'));
    expect(mockStartFast).toHaveBeenCalledTimes(1);
    
    fireEvent.press(getByTestId('end-btn'));
    expect(mockEndFast).toHaveBeenCalledTimes(1);
  });
});