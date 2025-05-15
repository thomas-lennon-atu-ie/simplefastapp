jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: (obj) => obj.ios ?? obj.default ?? obj.android,
  Version: 123,
  isTesting: true,
}));

jest.mock('react-native/Libraries/Components/View/View', () => 'View');
jest.mock('react-native/Libraries/Text/Text', () => 'Text');
jest.mock('react-native/Libraries/Image/Image', () => 'Image');
jest.mock('react-native/Libraries/Components/TextInput/TextInput', () => 'TextInput');
jest.mock('react-native/Libraries/Components/Pressable/Pressable', () => 'Pressable');
jest.mock('react-native/Libraries/Components/Touchable/TouchableOpacity', () => 'TouchableOpacity');
jest.mock('react-native/Libraries/Components/Touchable/TouchableHighlight', () => 'TouchableHighlight');
jest.mock('react-native/Libraries/Components/Touchable/TouchableWithoutFeedback', () => 'TouchableWithoutFeedback');
jest.mock('react-native/Libraries/Components/ScrollView/ScrollView', () => 'ScrollView');
jest.mock('react-native/Libraries/Modal/Modal', () => 'Modal');

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
    setOptions: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  NavigationContainer: ({ children }) => children,
  DefaultTheme: { colors: { background: '#fff' } },
  DarkTheme: { colors: { background: '#000' } },
  createNavigationContainerRef: jest.fn(() => ({
    current: null,
    navigate: jest.fn(),
  })),
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    signIn: jest.fn(() => Promise.resolve({ idToken: 'mock-id-token', user: { email: 'test@google.com', id: 'google-test-id'} })),
    signOut: jest.fn(() => Promise.resolve()),
    isSignedIn: jest.fn(() => Promise.resolve(false)),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  },
}));
