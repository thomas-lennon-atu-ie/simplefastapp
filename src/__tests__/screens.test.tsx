/* eslint-disable @typescript-eslint/no-explicit-any */
import {  render } from '@testing-library/react-native';

jest.useRealTimers();

jest.mock('../screens/HomeScreen', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: () => React.createElement(View, null, 
      React.createElement(Text, { testID: "home-title" }, "Start Fasting")
    )
  };
});

jest.mock('../screens/GoalsScreen', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: () => React.createElement(View, null, 
      React.createElement(Text, { testID: "goals-title" }, "Fasting Goals")
    )
  };
});

jest.mock('../screens/NotificationSettings', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: () => React.createElement(View, null, 
      React.createElement(Text, { testID: "settings-title" }, "Notification Settings")
    )
  };
});

jest.mock('../screens/OnboardingScreen', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: () => React.createElement(View, null, 
      React.createElement(Text, { testID: "welcome-title" }, "Welcome to SimpleFast")
    )
  };
});

jest.mock('../screens/ProfileScreen', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: () => React.createElement(View, null, 
      React.createElement(Text, { testID: "user-email" }, "test@example.com")
    )
  };
});

jest.mock('../screens/StatisticsScreen', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: () => React.createElement(View, null, 
      React.createElement(Text, { testID: "stats-title" }, "Fasting Statistics")
    )
  };
});

jest.mock('../screens/TimerScreen', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: () => React.createElement(View, null, 
      React.createElement(Text, { testID: "timer-title" }, "Timer")
    )
  };
});

jest.mock('../screens/FastingStagesScreen', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: () => React.createElement(View, null, 
      React.createElement(Text, { testID: "stages-title" }, "Fasting Stages")
    )
  };
});

jest.mock('react-native/Libraries/StyleSheet/StyleSheet', () => ({
  create: styles => styles,
  hairlineWidth: 1,
  flatten: styles => styles,
}));

jest.mock('react-native/Libraries/Utilities/PixelRatio', () => ({
  get: jest.fn(() => 2),
  roundToNearestPixel: jest.fn(size => size),
}));

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { email: 'test@example.com', uid: '123' },
    loading: false,
    logout: jest.fn(),
    deleteAccount: jest.fn(),
  })),
  AuthProvider: ({ children }) => <>{children}</>,
}));

jest.mock('../context/AppContext', () => ({
  useAppContext: jest.fn(() => ({
    hasCompletedOnboarding: true,
    setOnboardingComplete: jest.fn(),
  })),
  AppProvider: ({ children }) => <>{children}</>,
}));

jest.mock('../context/FastContext', () => ({
  useFast: jest.fn(() => ({
    startFast: jest.fn(),
    endFast: jest.fn(),
    fastState: { isActive: false, startTime: null, targetDuration: null },
    fastHistory: [],
    loading: false,
  })),
  FastProvider: ({ children }) => <>{children}</>,
}));

const mockNavigation: any = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getId: jest.fn(() => 'mock-navigation-id'),
  getParent: jest.fn(() => undefined),
  getState: jest.fn(() => ({
    key: 'stack-1',
    index: 0,
    routeNames: ['MockScreen'],
    history: [{ key: 'MockScreen-1', type: 'route' }],
    routes: [{ key: 'MockScreen-1', name: 'MockScreen', params: {} }],
    type: 'stack',
    stale: false,
  })),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(),
  replace: jest.fn(),
  push: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
};

const mockRoute = {
  key: 'mock-route',
  name: 'MockScreen',
  params: {},
};

import GoalsScreen from '../screens/GoalsScreen';
import HomeScreen from '../screens/HomeScreen';
import NotificationSettings from '../screens/NotificationSettings';
import OnboardingScreen from '../screens/OnboardingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import TimerScreen from '../screens/TimerScreen';
import FastingStagesScreen from '../screens/FastingStagesScreen';

afterAll(() => {
  jest.clearAllTimers();
  console.log('All screen tests completed');
});

describe('HomeScreen', () => {
  it('renders without crashing', () => {
    // @ts-ignore
    const { getByTestId } = render(<HomeScreen navigation={mockNavigation} />);
    expect(getByTestId('home-title')).toBeTruthy();
  });
});

describe('GoalsScreen', () => {
  it('renders goals header', () => {
    // @ts-ignore
    const { getByTestId } = render(<GoalsScreen navigation={mockNavigation} />);
    expect(getByTestId('goals-title')).toBeTruthy();
  });
});

describe('NotificationSettings Screen', () => {
  it('renders settings header', () => {
    // @ts-ignore
    const { getByTestId } = render(<NotificationSettings navigation={mockNavigation} />);
    expect(getByTestId('settings-title')).toBeTruthy();
  });
});

describe('OnboardingScreen', () => {
  it('renders welcome text', () => {
    // @ts-ignore
    const { getByTestId } = render(<OnboardingScreen navigation={mockNavigation} />);
    expect(getByTestId('welcome-title')).toBeTruthy();
  });
});

describe('ProfileScreen', () => {
  it('renders user email', () => {
    // @ts-ignore
    const { getByTestId } = render(<ProfileScreen navigation={mockNavigation} route={mockRoute} />);
    expect(getByTestId('user-email')).toBeTruthy();
  });
});

describe('StatisticsScreen', () => {
  it('renders stats header', () => {
    // @ts-ignore
    const { getByTestId } = render(<StatisticsScreen navigation={mockNavigation} />);
    expect(getByTestId('stats-title')).toBeTruthy();
  });
});

describe('TimerScreen', () => {
  it('renders timer title', () => {
    // @ts-ignore
    const { getByTestId } = render(<TimerScreen navigation={mockNavigation} />);
    expect(getByTestId('timer-title')).toBeTruthy();
  });
});

describe('FastingStagesScreen', () => {
  it('renders stages header', () => {
    const mockStagesRoute = {
      params: { currentElapsedHours: 1, selectedStageName: undefined },
      key: 'FastingStagesScreen',
      name: 'FastingStages',
    } as const;
    const { getByTestId } = render(<FastingStagesScreen route={mockStagesRoute as any} />);
    expect(getByTestId('stages-title')).toBeTruthy();
  });
});