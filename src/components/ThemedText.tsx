import React from 'react';
import { Text, TextProps, useColorScheme, TextStyle } from 'react-native';

interface ThemedTextProps extends TextProps {
  type?: 'default' | 'title' | 'subtitle' | 'link';
}

export function ThemedText(props: Readonly<ThemedTextProps>) {
  const colorScheme = useColorScheme() ?? 'light';
  const { style, type = 'default' } = props;

  const textStyle = {
    color: colorScheme === 'dark' ? '#fff' : '#000',
    ...getTypeStyle(type),
  };

  return (
    <Text
      style={[textStyle, style]}
    />
  );
}

function getTypeStyle(type: ThemedTextProps['type']): TextStyle {
  switch (type) {
    case 'title':
      return { fontSize: 28, fontWeight: '700' as TextStyle['fontWeight'] };
    case 'subtitle':
      return { fontSize: 20, fontWeight: '600' as TextStyle['fontWeight'] };
    case 'link':
      return { color: '#0a7ea4', textDecorationLine: 'underline' as TextStyle['textDecorationLine'] };
    default:
      return {};
  }
}