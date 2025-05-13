import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  Alert
} from 'react-native';

import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useFast, FastingGoal, FASTING_GOAL_PRESETS } from '../context/FastContext';

export default function GoalsScreen() {
  const { currentGoal, setFastingGoal } = useFast();
  const [customHours, setCustomHours] = useState('');
  const [customName, setCustomName] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  const handleSelectPreset = async (goal: FastingGoal) => {
    try {
      await setFastingGoal(goal);
      Alert.alert("Success", `Fasting goal set to ${goal.name}`);
    } catch (error: unknown) {
      console.error("Error setting fasting goal:", error);
      Alert.alert("Error", "Failed to set fasting goal. Please try again.");
    }
  };

  const handleSaveCustomGoal = async () => {
    const hours = parseFloat(customHours);
    
    if (isNaN(hours) || hours <= 0 || hours > 72) {
      Alert.alert("Invalid Duration", "Please enter a positive number of hours (max 72)");
      return;
    }
    
    const name = customName.trim() || `Custom ${hours}h Fast`;
    const customGoal: FastingGoal = {
      type: 'custom',
      name,
      duration: hours * 60 * 60 * 1000,
      description: `Custom fast for ${hours} hours`
    };
    
    try {
      await setFastingGoal(customGoal);
      setIsCustomMode(false);
      setCustomHours('');
      setCustomName('');
      Alert.alert("Success", `Custom fasting goal set to ${hours} hours`);
    } catch (error: unknown) {
      console.error("Error setting custom fasting goal:", error);
      Alert.alert("Error", "Failed to set custom fasting goal. Please try again.");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Fasting Goals</ThemedText>
      
      {isCustomMode ? (
        <View style={styles.customGoalContainer}>
          <ThemedText style={styles.sectionTitle}>Create Custom Goal</ThemedText>
          
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Goal Name (optional)</ThemedText>
            <TextInput
              style={styles.input}
              value={customName}
              onChangeText={setCustomName}
              placeholder="E.g., My Custom Fast"
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Duration (hours)</ThemedText>
            <TextInput
              style={styles.input}
              value={customHours}
              onChangeText={setCustomHours}
              placeholder="Enter hours (e.g., 16.5)"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={() => setIsCustomMode(false)}
            >
              <ThemedText style={styles.buttonText}>Cancel</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]}
              onPress={handleSaveCustomGoal}
            >
              <ThemedText style={styles.buttonText}>Save Goal</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView>
          <ThemedText style={styles.sectionTitle}>Current Goal</ThemedText>
          {currentGoal ? (
            <View style={styles.currentGoalCard}>
              <ThemedText style={styles.goalName}>{currentGoal.name}</ThemedText>
              <ThemedText style={styles.goalDuration}>
                {(currentGoal.duration / (1000 * 60 * 60)).toFixed(1)} hours
              </ThemedText>
              {currentGoal.description && (
                <ThemedText style={styles.goalDescription}>{currentGoal.description}</ThemedText>
              )}
            </View>
          ) : (
            <ThemedText style={styles.noGoalText}>No goal set yet. Select a preset or create a custom goal.</ThemedText>
          )}
          
          <ThemedText style={styles.sectionTitle}>Preset Goals</ThemedText>
          <FlatList
            data={FASTING_GOAL_PRESETS}
            keyExtractor={(item) => item.name}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[
                  styles.presetItem,
                  currentGoal?.name === item.name && styles.selectedPreset
                ]}
                onPress={() => handleSelectPreset(item)}
              >
                <View>
                  <ThemedText style={styles.presetName}>{item.name}</ThemedText>
                  <ThemedText style={styles.presetDuration}>
                    {(item.duration / (1000 * 60 * 60)).toFixed(0)} hours
                  </ThemedText>
                </View>
                {item.description && (
                  <ThemedText style={styles.presetDescription}>{item.description}</ThemedText>
                )}
              </TouchableOpacity>
            )}
          />
          
          <TouchableOpacity 
            style={styles.customButton}
            onPress={() => setIsCustomMode(true)}
          >
            <ThemedText style={styles.customButtonText}>Create Custom Goal</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  currentGoalCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0a7ea4',
  },
  goalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  goalDuration: {
    fontSize: 16,
    marginTop: 4,
    color: '#333',
  },
  goalDescription: {
    fontSize: 14,
    marginTop: 8,
    color: '#555',
  },
  noGoalText: {
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 16,
  },
  presetItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedPreset: {
    borderWidth: 2,
    borderColor: '#0a7ea4',
    backgroundColor: '#f5f9fc',
  },
  presetName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  presetDuration: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  presetDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  customButton: {
    backgroundColor: '#4caf50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
  customButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  customGoalContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#0a7ea4',
    marginLeft: 8,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'white',
  },
});