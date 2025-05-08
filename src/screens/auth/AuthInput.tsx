import React from 'react';
import { TextInput, TextInputProps, View, Text, StyleSheet } from 'react-native';


type AllowedTextInputProps = Pick<
  TextInputProps,
  | 'value'
  | 'onChangeText'
  | 'placeholder'
  | 'keyboardType'
  | 'autoCapitalize'
  | 'secureTextEntry'
  | 'editable'
  | 'onBlur' 
  | 'onFocus'
>;

interface AuthInputProps extends AllowedTextInputProps {
  error?: string | null;
  isError?: boolean;
  style?: TextInputProps['style'];
}

export function AuthInput({ error, isError, style, ...restProps }: Readonly<AuthInputProps>) {
 
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[styles.input, isError ? styles.inputError : null, style]}
        placeholderTextColor="#888"      
        value={restProps.value}
        onChangeText={restProps.onChangeText}
        placeholder={restProps.placeholder}
        keyboardType={restProps.keyboardType}
        autoCapitalize={restProps.autoCapitalize}
        secureTextEntry={restProps.secureTextEntry}
        editable={restProps.editable}
        onBlur={restProps.onBlur}
        onFocus={restProps.onFocus}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#000',
    marginBottom: 5, 
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
    marginBottom: 0, 
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 2,
    marginLeft: 5,
    marginBottom: 10, 
  },
});