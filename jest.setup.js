/* eslint-disable react/prop-types */
import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native/Libraries/NativeModules/specs/NativeSourceCode', () => ({
  getConstants: () => ({
    scriptURL: 'http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false',
  }),
}), { virtual: true });

jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  get: jest.fn(() => null),
  getEnforcing: jest.fn((name) => {
    if (name === 'SourceCode') {
      return {
        getConstants: () => ({
          scriptURL: 'http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false',
        }),
      };
    }
    return null;
  }),
}), { virtual: true });

jest.mock('expo/src/winter/ImportMetaRegistry', () => ({
  getImportMetaEntriesForURL: jest.fn(() => ({})),
  registerImportMetaEntry: jest.fn(),
  getImportMetaEntriesForSourceMap: jest.fn(() => ({})),
  getImportMetaForURL: jest.fn(() => ({})),
}), { virtual: true });

jest.mock('expo/src/utils/getBundleUrl.native', () => ({
  getBundleUrl: jest.fn(() => 'http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false'),
}), { virtual: true });

jest.mock('react-native', () => {
  const React = require('react');
  
  const sanitizeProps = (props) => {
    const {
      onPress, onChangeText, onEndEditing, onSubmitEditing, onFocus, onBlur,
      placeholderTextColor, keyboardType, secureTextEntry, editable,
      autoCapitalize, autoCorrect, autoComplete, maxLength,
      ...safeProps
    } = props;

    return {
      ...safeProps,
      onClick: onPress,
      onChange: onChangeText ? (e) => onChangeText(e.target.value) : undefined,
      onBlur: onBlur,
      onFocus: onFocus,
      type: secureTextEntry ? 'password' : 'text',
      disabled: editable === false,
      readOnly: props.value && !onChangeText ? true : undefined,
      ...(props.value && !onChangeText ? { defaultValue: props.value } : {}),
    };
  };

  return {
    // Platform info
    Platform: {
      OS: 'ios',
      Version: 123,
      select: obj => obj.ios ?? obj.default,
      isPad: false,
      isTVOS: false,
      isTV: false,
    },
    
    
    Dimensions: {
      get: () => ({ width: 360, height: 640, scale: 2, fontScale: 2 }),
    },
    StyleSheet: {
      create: styles => styles,
      flatten: styles => (styles || {}),
      hairlineWidth: 1,
      absoluteFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    },
    

    useColorScheme: () => 'light',
    useWindowDimensions: () => ({ width: 360, height: 640, scale: 2, fontScale: 2 }),
    Animated: {
      Value: function (v) { 
        this.value = v; 
        this.setValue = (nv) => { this.value = nv; }; 
        this.interpolate = jest.fn(config => {
 
          return (value) => {
            const inputRange = config.inputRange || [0, 1];
            const outputRange = config.outputRange || [0, 1];
  
            const percent = (value - inputRange[0]) / (inputRange[1] - inputRange[0]);
            return outputRange[0] + percent * (outputRange[1] - outputRange[0]);
          };
        });
      },
      timing: jest.fn(() => ({ start: jest.fn() })),
      spring: jest.fn(() => ({ start: jest.fn() })),
      decay: jest.fn(() => ({ start: jest.fn() })),
      add: jest.fn(),
      multiply: jest.fn(),
      sequence: jest.fn(),
      parallel: jest.fn(),
      event: jest.fn(),
      createAnimatedComponent: jest.fn(Component => {
        const AnimatedComponent = props => <Component {...props} />;
        return AnimatedComponent;
      }),
    },
    
    View: (props) => React.createElement('div', { 
      'data-testid': props.testID, 
      ...sanitizeProps(props) 
    }, props.children),
    
    Text: (props) => React.createElement('span', { 
      'data-testid': props.testID, 
      ...sanitizeProps(props) 
    }, props.children),
    
    Image: (props) => React.createElement('img', { 
      'data-testid': props.testID, 
      src: props.source?.uri || '',
      alt: props.accessibilityLabel || 'image',
      ...sanitizeProps(props) 
    }),
    
    TextInput: (props) => React.createElement('input', { 
      'data-testid': props.testID,
      placeholder: props.placeholder,
      ...sanitizeProps(props) 
    }),
    
    Pressable: (props) => React.createElement('button', { 
      'data-testid': props.testID, 
      type: 'button',
      ...sanitizeProps(props)
    }, typeof props.children === 'function' ? props.children({}) : props.children),
    
    TouchableOpacity: (props) => React.createElement('button', { 
      'data-testid': props.testID, 
      type: 'button',
      ...sanitizeProps(props)
    }, props.children),
    
    TouchableHighlight: (props) => React.createElement('button', { 
      'data-testid': props.testID, 
      type: 'button',
      ...sanitizeProps(props)
    }, props.children),
    
    Button: (props) => React.createElement('button', { 
      onClick: props.onPress, 
      'data-testid': props.testID,
      type: 'button',
      disabled: props.disabled,
    }, props.title),
    
    ScrollView: (props) => React.createElement('div', { 
      'data-testid': props.testID,
      style: { overflowY: 'auto', ...props.style }, 
      ...sanitizeProps(props)
    }, props.children),
    
    FlatList: (props) => {
      const items = (props.data || []).map((item, index) => {
        const key = props.keyExtractor ? props.keyExtractor(item, index) : index.toString();
        return (
          <div key={key} data-testid={`item-${key}`}>
            {props.renderItem({ item, index })}
          </div>
        );
      });
      
      return React.createElement('div', { 
        'data-testid': props.testID,
        style: { overflowY: 'auto', ...props.style },
        ...sanitizeProps(props)
      }, 
      props.ListHeaderComponent,
      items,
      props.ListFooterComponent,
      props.ListEmptyComponent && props.data?.length === 0 ? props.ListEmptyComponent : null);
    },
    
    SectionList: (props) => React.createElement('div', { 
      'data-testid': props.testID,
      ...sanitizeProps(props) 
    }, props.children),
    
    Modal: (props) => props.visible 
      ? React.createElement('div', { 
          'data-testid': props.testID || 'modal',
          ...sanitizeProps(props)
        }, props.children) 
      : null,
    
    KeyboardAvoidingView: (props) => React.createElement('div', { 
      ...sanitizeProps(props),
      'data-testid': props.testID || 'keyboard-avoiding-view',
      'data-behavior': props.behavior || 'padding',
    }, props.children),
    
    ActivityIndicator: (props) => React.createElement('div', { 
      'data-testid': props.testID || 'loading-indicator',
      className: `activity-indicator ${props.size || 'small'}`,
      style: { 
        backgroundColor: 'transparent',
        borderRadius: '50%',
        width: props.size === 'large' ? '36px' : '20px',
        height: props.size === 'large' ? '36px' : '20px',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: `${props.color || '#999'} transparent ${props.color || '#999'} transparent`,
        ...props.style 
      },
      ...sanitizeProps(props)
    }),
  };
});

jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-reanimated', () => ({
  useSharedValue: jest.fn((initialValue) => ({ value: initialValue })),
  useAnimatedStyle: jest.fn(() => ({})),
  useDerivedValue: jest.fn((callback) => ({ value: callback() })),
  useAnimatedScrollHandler: jest.fn(() => () => {}),
  useAnimatedRef: jest.fn(() => ({ current: null })),
  useAnimatedGestureHandler: jest.fn(() => () => {}),
  useAnimatedProps: jest.fn(() => ({})),
  useAnimatedReaction: jest.fn(() => {}),
  
  withTiming: jest.fn((toValue, config, callback) => {
    callback && callback(true);
    return toValue;
  }),
  withSpring: jest.fn((toValue, config, callback) => {
    callback && callback(true);
    return toValue;
  }),
  withDecay: jest.fn((config, callback) => {
    callback && callback(true);
    return 0;
  }),
  withDelay: jest.fn((delay, animation) => animation),
  withRepeat: jest.fn((animation, numberOfReps, reverse, callback) => {
    callback && callback(true);
    return animation;
  }),
  withSequence: jest.fn((...animations) => animations[animations.length - 1]),
  
  FadeIn: { duration: jest.fn(() => ({ delay: jest.fn(() => ({})) })) },
  FadeOut: { duration: jest.fn(() => ({ delay: jest.fn(() => ({})) })) },
  Layout: { duration: jest.fn(() => ({})) },
  SlideInRight: { duration: jest.fn(() => ({})) },
  SlideOutLeft: { duration: jest.fn(() => ({})) },
  
  createAnimatedComponent: jest.fn((component) => component),
  Easing: {
    linear: jest.fn(),
    ease: jest.fn(),
    quad: jest.fn(),
    cubic: jest.fn(),
    bounce: jest.fn(),
    out: jest.fn((fn) => fn),
    exp: jest.fn(),
  },
  Extrapolation: {
    CLAMP: 'clamp',
    EXTEND: 'extend',
    IDENTITY: 'identity'
  },
  addWhitelistedNativeProps: jest.fn(),
  runOnJS: jest.fn((fn) => fn),
  runOnUI: jest.fn((fn) => fn),
  
  get: jest.fn(() => 1),
  
  View: 'View',
  Text: 'Text',
  Image: 'Image',
  ScrollView: 'ScrollView',
  FlatList: 'FlatList',
  
  interpolate: jest.fn(),
  Transition: {
    In: jest.fn(),
    Out: jest.fn(),
    Together: jest.fn(),
    Sequence: jest.fn(),
  },
}));

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  initializeAuth: jest.fn(() => ({})),
  getReactNativePersistence: jest.fn(() => ({})),
  onAuthStateChanged: jest.fn(() => jest.fn()),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
  signOut: jest.fn(() => Promise.resolve()),
  sendPasswordResetEmail: jest.fn(() => Promise.resolve()),
  GoogleAuthProvider: { credential: jest.fn() },
  signInWithCredential: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
}));

jest.mock('firebase/firestore', () => {
  return {
    collection: jest.fn(() => ({})),
    getFirestore: jest.fn(() => ({})),
    doc: jest.fn(() => ({})),
    getDoc: jest.fn(() => Promise.resolve({ exists: () => false, data: () => null })),
    getDocs: jest.fn(() => Promise.resolve({ docs: [], empty: true })),
    setDoc: jest.fn(() => Promise.resolve()),
    updateDoc: jest.fn(() => Promise.resolve()),
    deleteDoc: jest.fn(() => Promise.resolve()),
    query: jest.fn(() => ({})),
    where: jest.fn(() => ({})),
    orderBy: jest.fn(() => ({})),
    limit: jest.fn(() => ({})),
    onSnapshot: jest.fn((docOrQuery, options, callback) => {
      const actualCallback = typeof options === 'function' ? options : callback;
      
      if (actualCallback) {
        actualCallback({ exists: () => false, data: () => ({}) });
      }
      
      return jest.fn();
    }),
    serverTimestamp: jest.fn(() => ({ toDate: () => new Date() })),
  };
});

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: jest.fn(() => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      setOptions: jest.fn(),
      dispatch: jest.fn(),
    })),
    useRoute: jest.fn(() => ({ 
      params: {
        currentElapsedHours: 0,
        selectedStageName: 'Stage 1',
      },
      name: 'MockScreen',
      key: 'mock-route-key',
    })),
    NavigationContainer: ({ children }) => children,
    createNavigationContainerRef: jest.fn(() => ({ current: null, navigate: jest.fn() })),
  };
});

jest.mock('@react-navigation/stack', () => {
  const React = require('react');
  return {
    createStackNavigator: jest.fn(() => ({
      Navigator: ({ screenOptions, children }) => 
        React.createElement(React.Fragment, null, children),
      
      Screen: ({ name, component: Component, options }) => {
        if (name === 'Auth' && Component) {
          return React.createElement('div', { 'data-testid': 'auth-screen' }, 
            React.createElement(Component, { testID: 'auth-screen-component' }));
        }
        
        if (name === 'Onboarding' && Component) {
          return React.createElement('div', { 'data-testid': 'onboarding-screen' }, 
            React.createElement(Component, { testID: 'onboarding-screen-component' }));
        }
        
        if (name === 'Main' && Component) {
          return React.createElement('div', { 'data-testid': 'main-tab' }, 
            React.createElement(Component, { testID: 'main-tab-component' }));
        }
        
        return null;
      }
    })),
    TransitionPresets: { 
      SlideFromRightIOS: {}, 
      ModalSlideFromBottomIOS: {} 
    },
  };
});

jest.mock('@react-navigation/bottom-tabs', () => {
  const React = require('react');
  return {
    createBottomTabNavigator: jest.fn(() => ({
      Navigator: ({ screenOptions, children }) => 
        React.createElement(React.Fragment, null, children),
      
      Screen: ({ name, component: Component, options }) => {
        if (Component) {
          return React.createElement('div', { 'data-testid': `tab-${name.toLowerCase()}` }, 
            React.createElement(Component, { testID: `${name.toLowerCase()}-screen` }));
        }
        return null;
      }
    })),
  };
});

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  AndroidImportance: { MAX: 5, HIGH: 4, DEFAULT: 3, LOW: 2, MIN: 1 },
  AndroidNotificationPriority: { MAX: 'max', HIGH: 'high', DEFAULT: 'default', LOW: 'low', MIN: 'min' },
  SchedulableTriggerInputTypes: { DATE: 'date', DAILY: 'daily', WEEKLY: 'weekly' },
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    signIn: jest.fn(() => Promise.resolve({ idToken: 'mock-token' })),
    signOut: jest.fn(() => Promise.resolve()),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  },
}));

jest.mock('react-native-svg', () => {
  const React = require('react');
  
  const createSvgComponent = (name) => {
    return (props) => React.createElement(
      'div', 
      { 
        'data-testid': props.testID || `svg-${name.toLowerCase()}`,
        ...props
      }, 
      props.children || null
    );
  };
  
  return {
    Svg: createSvgComponent('Svg'),
    Circle: createSvgComponent('Circle'),
    Ellipse: createSvgComponent('Ellipse'),
    G: createSvgComponent('G'),
    Path: createSvgComponent('Path'),
    Polygon: createSvgComponent('Polygon'),
    Polyline: createSvgComponent('Polyline'),
    Line: createSvgComponent('Line'),
    Rect: createSvgComponent('Rect'),
    Text: createSvgComponent('Text'),
    TSpan: createSvgComponent('TSpan'),
    Defs: createSvgComponent('Defs'),
    LinearGradient: createSvgComponent('LinearGradient'),
    RadialGradient: createSvgComponent('RadialGradient'),
    Stop: createSvgComponent('Stop'),
    ClipPath: createSvgComponent('ClipPath'),
    default: createSvgComponent('Svg'),
  };
});

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  return {
    LinearGradient: React.forwardRef(({ colors, style, children, ...props }, ref) => 
      React.createElement('div', {
        ref,
        'data-testid': props.testID || 'linear-gradient',
        className: 'expo-linear-gradient',
        style: { 
          ...style,
          background: colors && colors.length > 0 
            ? `linear-gradient(to bottom, ${colors.join(', ')})` 
            : undefined 
        },
        ...props,
      }, children)
    ),
  };
});

jest.mock('expo-app-loading', () => ({
  Module: true,
  default: () => null,
}), { virtual: true });

jest.mock('react-native/Libraries/BatchedBridge/NativeModules', () => {
  return {
    UIManager: {
      RCTView: {
        forceTouchAvailable: false,
        directEventTypes: {},
      },
    },
    PlatformConstants: {
      forceTouchAvailable: false,
    },
    RNGestureHandlerModule: {
      State: {
        BEGAN: 'BEGAN',
        FAILED: 'FAILED',
        ACTIVE: 'ACTIVE',
      },
      attachGestureHandler: jest.fn(),
      dropGestureHandler: jest.fn(),
      updateGestureHandler: jest.fn(),
    },
    KeyboardObserver: {},
    RNCWebView: {},
    ExpoModulesCore: {
      NativeViewManagerAdapter: {
        Mixin: {},
      },
      NativeUnimoduleProxy: {},
      EventEmitter: {
        addListener: jest.fn(),
        removeListeners: jest.fn(),
      },
    },
  };
});

const originalError = console.error;
console.error = function(message, ...args) {
  const suppressPatterns = [
    'React does not recognize the',
    'You provided a `value` prop to a form field without an `onChange` handler',
    'Received `true` for a non-boolean attribute',
    'An update to',
    'inside a test was not wrapped in act',
    'Elements should be placed inside',
  ];
  
  if (typeof message === 'string' && suppressPatterns.some(pattern => message.includes(pattern))) {
    return;
  }
  originalError.call(console, message, ...args);
};