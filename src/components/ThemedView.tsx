import React from 'react';
import { View, ViewProps, useColorScheme } from 'react-native';

export function ThemedView(props: Readonly<ViewProps>) {
  const colorScheme = useColorScheme() ?? 'light';
  const { style, children } = props;

  return (
    <View
      style={[
        { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' },
        style
      ]}
    >
      {children}
    </View>
  );
}