import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text,  View, TouchableOpacity, ScrollView, Dimensions } from 'react-native';

import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';

// Use the same FastingStage interface and data as AnimatedFastButton
interface FastingStage {
  minHours: number;
  maxHours: number;
  name: string;
  description: string;
  benefits: string;
  emoji: string;
}

const fastingStages: FastingStage[] = [
  { minHours: 0, maxHours: 4, name: "Fed State", description: "Digesting and absorbing nutrients.", benefits: "Elevated blood sugar and insulin.", emoji: "🍽️" },
  { minHours: 4, maxHours: 8, name: "Early Fasting", description: "Insulin drops; body uses stored glycogen.", benefits: "Starting to tap into reserves.", emoji: "📉" },
  { minHours: 8, maxHours: 12, name: "Transition", description: "Glycogen depletes; body shifts to fat; autophagy begins.", benefits: "Metabolic shift initiating.", emoji: "🔄" },
  { minHours: 12, maxHours: 16, name: "Ketosis Begins", description: "Fat converts to ketones; enhanced autophagy.", benefits: "Fat burning & cellular repair.", emoji: "🏃‍♂️" },
  { minHours: 16, maxHours: 24, name: "Deep Ketosis", description: "Heavy reliance on ketones; peak cellular repair.", benefits: "Enhanced detoxification.", emoji: "🧹" },
  { minHours: 24, maxHours: Infinity, name: "Extended Fasting", description: "Maintains ketosis; boosts autophagy.", benefits: "Improved insulin sensitivity.", emoji: "🌟" },
];

type FastingStagesScreenProps = {
  route: {
    params: {
      currentElapsedHours?: number;
    }
  }
};

const { width } = Dimensions.get('window');

export default function FastingStagesScreen({ route }: Readonly<FastingStagesScreenProps>) {
  const navigation = useNavigation();
  const [selectedStage, setSelectedStage] = useState<FastingStage | null>(null);
  
  const { currentElapsedHours = 0 } = route.params || {};

  useEffect(() => {
    let currentStage = fastingStages[0];
    
    for (let i = fastingStages.length - 1; i >= 0; i--) {
      if (currentElapsedHours >= fastingStages[i].minHours) {
        currentStage = fastingStages[i];
        break;
      }
    }
    
    setSelectedStage(currentStage);
  }, [currentElapsedHours]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ThemedText style={styles.backButtonText}>← Back</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.title}>Fasting Stages</ThemedText>
      </View>

      <View style={styles.emojiRow}>
        {fastingStages.map((stage) => (
          <TouchableOpacity
            key={stage.name}
            style={[
              styles.emojiContainer,
              selectedStage?.name === stage.name && styles.selectedEmojiContainer
            ]}
            onPress={() => setSelectedStage(stage)}
          >
            <Text style={styles.emojiText}>{stage.emoji}</Text>
            <ThemedText 
              style={[
                styles.emojiLabel,
                selectedStage?.name === stage.name && styles.selectedEmojiLabel
              ]}
              numberOfLines={1}
            >
              {stage.minHours}-{stage.maxHours === Infinity ? '∞' : stage.maxHours}h
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {selectedStage && (
        <ScrollView style={styles.detailsContainer} contentContainerStyle={styles.detailsContent}>
          <View style={styles.stageHeader}>
            <Text style={styles.stageBigEmoji}>{selectedStage.emoji}</Text>
            <ThemedText style={styles.stageName}>{selectedStage.name}</ThemedText>
            <ThemedText style={styles.stageHours}>
              {selectedStage.minHours}-{selectedStage.maxHours === Infinity ? '∞' : selectedStage.maxHours} hours
            </ThemedText>
          </View>
          
          <View style={styles.sectionContainer}>
            <ThemedText style={styles.sectionTitle}>What&apos;s Happening</ThemedText>
            <ThemedText style={styles.sectionContent}>{selectedStage.description}</ThemedText>
          </View>
          
          <View style={styles.sectionContainer}>
            <ThemedText style={styles.sectionTitle}>Benefits</ThemedText>
            <ThemedText style={styles.sectionContent}>{selectedStage.benefits}</ThemedText>
          </View>
          
          <View style={styles.sectionContainer}>
            <ThemedText style={styles.sectionTitle}>Tips</ThemedText>
            <ThemedText style={styles.sectionContent}>
              {getTipForStage(selectedStage)}
            </ThemedText>
          </View>
        </ScrollView>
      )}
    </ThemedView>
  );
}

function getTipForStage(stage: FastingStage): string {
  if (stage.minHours <= 8) {
    return "Stay hydrated with water or herbal tea to manage early hunger.";
  } else if (stage.minHours <= 16) {
    return "Add a pinch of salt to water to maintain electrolyte balance.";
  } else {
    return "Consider light activities and meditation to stay focused.";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, 
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    marginBottom: 15,
    borderRadius: 12,
  },
  emojiContainer: {
    alignItems: 'center',
    width: width / 7, 
    padding: 8,
    borderRadius: 8,
  },
  selectedEmojiContainer: {
    backgroundColor: 'rgba(10, 126, 164, 0.1)', 
  },
  emojiText: {
    fontSize: 24,
    marginBottom: 5,
  },
  emojiLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  selectedEmojiLabel: {
    fontWeight: 'bold',
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: 'rgba(245, 245, 245, 0.5)',
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
  },
  detailsContent: {
    paddingBottom: 20,
  },
  stageHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  stageBigEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  stageName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  stageHours: {
    fontSize: 16,
    opacity: 0.7,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#0a7ea4',
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
  },
});