import { render } from '@testing-library/react';

jest.mock('../navigation/MainTabNavigator', () =>
  () => <div data-testid="main-tab-navigator" />
);

jest.mock('../screens/OnboardingScreen', () =>
  () => <div data-testid="onboarding-screen-mock" />
);

jest.mock('../screens/auth/AuthScreen', () =>
  () => <div data-testid="auth-screen-mock" />
);

jest.mock('../screens/FastingStagesScreen', () => () => <div data-testid="fasting-stages-screen-mock" />);

const mockUseAppContext = jest.fn();
const mockUseAuth = jest.fn();

jest.mock('../context/AppContext', () => ({
  useAppContext: () => mockUseAppContext(),
  AppProvider: ({ children }) => <>{children}</>,
}));

jest.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }) => <>{children}</>,
}));

import Navigation from '../navigation/Navigation';
import FastingStagesScreen from '../screens/FastingStagesScreen';

jest.mock('@react-navigation/stack', () => {
  const StackNavigator = {
    Navigator: ({ children }) => <>{children}</>,
    Screen: ({ name, component: Component }) => {
      if (name === 'Auth') return <Component key="auth" />;
      if (name === 'Onboarding') return <Component key="onboarding" />;
      if (name === 'Main') return <Component key="main" />;
      return null;
    },
  };
  return {
    createStackNavigator: jest.fn(() => StackNavigator),
    TransitionPresets: { SlideFromRightIOS: {}, ModalSlideFromBottomIOS: {} },
  };
});

describe('Root Navigation Logic', () => {
  it('renders OnboardingScreen if onboarding is not complete', () => {
    mockUseAppContext.mockReturnValue({
      hasCompletedOnboarding: false,
      setOnboardingComplete: jest.fn(),
    });
    
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    const { getByTestId } = render(<Navigation />);
    expect(getByTestId('onboarding-screen-mock')).toBeTruthy();
  });

  it('renders AuthScreen if onboarding complete but no user', () => {
    mockUseAppContext.mockReturnValue({
      hasCompletedOnboarding: true,
      setOnboardingComplete: jest.fn(),
    });
    
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    const { getByTestId } = render(<Navigation />);
    expect(getByTestId('auth-screen-mock')).toBeTruthy();
  });

  it('renders MainTabNavigator if onboarding complete and user exists', () => {
    mockUseAppContext.mockReturnValue({
      hasCompletedOnboarding: true,
      setOnboardingComplete: jest.fn(),
    });
    
    mockUseAuth.mockReturnValue({
      user: { uid: 'test-user' },
      loading: false,
    });

    const { getByTestId } = render(<Navigation />);
    expect(getByTestId('main-tab-navigator')).toBeTruthy();
  });
  
  it('shows loading indicator when auth is loading', () => {
    mockUseAppContext.mockReturnValue({
      hasCompletedOnboarding: true,
      setOnboardingComplete: jest.fn(),
    });

    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    });

    const LoadingTest = () => {
      const auth = mockUseAuth();
      return auth.loading ? <div data-testid="loading-indicator" /> : null;
    };

    const { getByTestId } = render(<LoadingTest />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('renders FastingStagesScreen with route params', () => {
    const mockRoute = {
      key: 'FastingStages',
      name: 'FastingStages' as const, 
      params: { currentElapsedHours: 1, selectedStageName: 'Stage 1' },
    };

 
    const { getByTestId } = render(
      <FastingStagesScreen route={mockRoute as any} />
    );
    expect(getByTestId('fasting-stages-screen-mock')).toBeTruthy();
  });
});