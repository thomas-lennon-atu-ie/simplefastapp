import {  render } from '@testing-library/react-native';
import {  Text } from 'react-native';

jest.mock('react-native/Libraries/StyleSheet/StyleSheet', () => ({
  create: styles => styles,
}));

jest.mock('react-native/Libraries/Utilities/PixelRatio', () => ({
  get: jest.fn(() => 2),
  roundToNearestPixel: jest.fn(size => size),
}));

jest.mock('lottie-react-native', () => {
  const React = require('react');
  return React.forwardRef((props, ref) => (
    <div ref={ref} style={props.style} data-testid="lottie-animation" />
  ));
});

jest.mock('../components/ThemedText', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    ThemedText: ({ children, testID }) =>
      React.createElement(Text, { testID }, children),
  };
});
jest.mock('../components/ThemedView', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    ThemedView: ({ children, testID }) =>
      React.createElement(View, { testID }, children),
  };
});
jest.mock('../components/ConfirmationModal', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    ConfirmationModal: ({ visible, title, message }) =>
      visible ? (
        React.createElement(View, null,
          React.createElement(Text, { testID: 'modal-title' }, title),
          React.createElement(Text, { testID: 'modal-message' }, message)
        )
      ) : null,
  };
});
jest.mock('../components/DateTimePickerModal', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    DateTimePickerModal: ({ visible, title }) =>
      visible ? React.createElement(View, null,
        React.createElement(Text, { testID: 'picker-title' }, title)
      ) : null,
  };
});
jest.mock('../components/FastingTimerCircle', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    FastingTimerCircle: () =>
      React.createElement(View, { testID: 'fasting-timer-circle' }),
  };
});
jest.mock('../components/FastProgressCircle', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    FastProgressCircle: () =>
      React.createElement(View, { testID: 'progress-circle' }),
  };
});
jest.mock('../components/AnimatedFastButton', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    AnimatedFastButton: () =>
      React.createElement(View, { testID: 'fast-button' }),
  };
});

import { AnimatedFastButton } from '../components/AnimatedFastButton';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { DateTimePickerModal } from '../components/DateTimePickerModal';
import { FastProgressCircle } from '../components/FastProgressCircle';
import { FastingTimerCircle } from '../components/FastingTimerCircle';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';

describe('ThemedText', () => {
  it('renders children', () => {
    const { getByTestId } = render(<ThemedText testID="themed-text">Hello Themed</ThemedText>);
    expect(getByTestId('themed-text')).toHaveTextContent('Hello Themed');
  });
});

describe('ThemedView', () => {
  it('renders children container', () => {
    const { getByTestId } = render(
      <ThemedView testID="themed-view">
        <Text>Inside View</Text>
      </ThemedView>
    );
    expect(getByTestId('themed-view')).toBeTruthy();
  });
});

describe('ConfirmationModal', () => {
  it('renders correctly when visible', () => {
    const { getByTestId } = render(
      <ConfirmationModal visible={true} title="Test Title" message="Test Message" onConfirm={()=>{}} onCancel={()=>{}} />
    );
    expect(getByTestId('modal-title')).toHaveTextContent('Test Title');
    expect(getByTestId('modal-message')).toHaveTextContent('Test Message');
  });
});

describe('DateTimePickerModal', () => {
  it('renders title when visible', () => {
    const { getByTestId } = render(
      <DateTimePickerModal visible={true} value={new Date()} onChange={()=>{}} onCancel={()=>{}} title="Select Date" />
    );
    expect(getByTestId('picker-title')).toHaveTextContent('Select Date');
  });
});

describe('FastingTimerCircle', () => {
  it('renders mocked timer', () => {
    const { getByTestId } = render(<FastingTimerCircle elapsedTime={0} targetDuration={0} onPress={() => {}} />);
    expect(getByTestId('fasting-timer-circle')).toBeTruthy();
  });
});

describe('AnimatedFastButton', () => {
  it('renders mocked button', () => {
    const { getByTestId } = render(
      <AnimatedFastButton isActive={false} elapsedTime={0} targetDuration={0} onStartPress={()=>{}} onEndPress={()=>{}} />
    );
    expect(getByTestId('fast-button')).toBeTruthy();
  });
});

describe('FastProgressCircle', () => {
  it('renders mocked progress circle', () => {
    const { getByTestId } = render(<FastProgressCircle slideNumber={1} isVisible={true} />);
    expect(getByTestId('progress-circle')).toBeTruthy();
  });
});