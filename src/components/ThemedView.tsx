import React, { forwardRef } from 'react'; 
import { View, ViewProps, useColorScheme } from 'react-native';

export const ThemedView = forwardRef<View, ViewProps>((props, ref) => {
  const colorScheme = useColorScheme() ?? 'light';
  const { style, children } = props; 

  return (
    <View
      ref={ref} 
      style={[
        { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' },
        style
      ]}
      
    >
      {children}
    </View>
  );
});

ThemedView.displayName = 'ThemedView';