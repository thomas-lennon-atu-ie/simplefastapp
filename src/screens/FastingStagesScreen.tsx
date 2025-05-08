import { useNavigation, RouteProp } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Dimensions, Platform, LayoutAnimation, UIManager } from 'react-native';

import deepKetosisLottie from '../../assets/lottie/deep-ketosis.json';
import earlyFastingLottie from '../../assets/lottie/early-fasting.json';
import extendedLottie from '../../assets/lottie/extended.json';
import fedStateLottie from '../../assets/lottie/fed-state.json';
import ketosisLottie from '../../assets/lottie/ketosis.json';
import transitionLottie from '../../assets/lottie/transition.json';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { RootStackParamList } from '../navigation/Navigation';


if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}


type FastingStagesScreenRouteProp = RouteProp<RootStackParamList, 'FastingStages'>;

type FastingStagesScreenProps = {
  route: FastingStagesScreenRouteProp; 
};


interface FastingStage {
  minHours: number;
  maxHours: number;
  name: string;
  description: string;
  benefits: string;
  lottieSource: LottieView['props']['source'];
}

const fastingStages: FastingStage[] = [
  { minHours: 0, maxHours: 4, name: "Fed State", description: "Digesting and absorbing nutrients.", benefits: "Elevated blood sugar and insulin.", lottieSource: fedStateLottie },
  { minHours: 4, maxHours: 8, name: "Early Fasting", description: "Insulin drops; body uses stored glycogen.", benefits: "Starting to tap into reserves.", lottieSource: earlyFastingLottie },
  { minHours: 8, maxHours: 12, name: "Transition", description: "Glycogen depletes; body shifts to fat; autophagy begins.", benefits: "Metabolic shift initiating.", lottieSource: transitionLottie },
  { minHours: 12, maxHours: 16, name: "Ketosis Begins", description: "Fat converts to ketones; enhanced autophagy.", benefits: "Fat burning & cellular repair.", lottieSource: ketosisLottie },
  { minHours: 16, maxHours: 24, name: "Deep Ketosis", description: "Heavy reliance on ketones; peak cellular repair.", benefits: "Enhanced detoxification.", lottieSource: deepKetosisLottie },
  { minHours: 24, maxHours: Infinity, name: "Extended Fasting", description: "Maintains ketosis; boosts autophagy.", benefits: "Improved insulin sensitivity.", lottieSource: extendedLottie },
];

const { width } = Dimensions.get('window');
const NUM_ICONS_PER_ROW = 5;
const ICON_ROW_PADDING = 10;
const ICON_CONTAINER_MARGIN = 4;
const ICON_CONTAINER_WIDTH = (width - ICON_ROW_PADDING * 2) / NUM_ICONS_PER_ROW - ICON_CONTAINER_MARGIN * 2;
const LOTTIE_ICON_SIZE = ICON_CONTAINER_WIDTH * 0.7;

export default function FastingStagesScreen({ route }: Readonly<FastingStagesScreenProps>) {
  const navigation = useNavigation();
  const [selectedStage, setSelectedStage] = useState<FastingStage | null>(null);
  const lottieRefs = useRef<{ [key: string]: LottieView | null }>({});
  const hasPlayedInitialAnimation = useRef(false);
  const { currentElapsedHours = 0, selectedStageName } = route.params || {};


  useEffect(() => {
    let initialStage: FastingStage | null = null;
    if (selectedStageName) {
      initialStage = fastingStages.find(s => s.name === selectedStageName) ?? null;
    }
    if (!initialStage) {

      for (let i = fastingStages.length - 1; i >= 0; i--) {
        if (currentElapsedHours >= fastingStages[i].minHours) {
          initialStage = fastingStages[i];
          break;
        }
      }
    }
 
    setSelectedStage(initialStage ?? fastingStages[0]);
  }, [currentElapsedHours, selectedStageName]);

  
  useEffect(() => {

    const timer = setTimeout(() => {
        if (!hasPlayedInitialAnimation.current) {
            console.log("Playing initial animations for all icons.");
            Object.values(lottieRefs.current).forEach(ref => {
                if (ref) {
                    ref.play(0);
                }
            });
            hasPlayedInitialAnimation.current = true;
        }
    }, 100); 

    return () => clearTimeout(timer);
  }, []);


  useEffect(() => {

    if (!hasPlayedInitialAnimation.current || !selectedStage) return;

    const stageName = selectedStage.name;
    console.log(`Selected stage changed to: ${stageName}. Playing its animation.`);

    Object.keys(lottieRefs.current).forEach(key => {
      const ref = lottieRefs.current[key];
      if (ref) {
        if (key === stageName) {
          ref.play(); 
        } else {
         
          // ref.reset(); // may still use this for non selected icons
        }
      }
    });
  }, [selectedStage]); 


  const handleStageSelect = (stage: FastingStage) => {

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedStage(stage);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ThemedText style={styles.backButtonText}>← Back</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.title}>Fasting Stages</ThemedText>
      </View>
      <View style={styles.iconRow}>
        {fastingStages.map((stage) => (
          <TouchableOpacity
            key={stage.name}
            style={styles.iconContainer}
            onPress={() => handleStageSelect(stage)} 
          >
            <View style={[styles.lottieWrapper, selectedStage?.name === stage.name && styles.selectedIconContainer]}>
              <LottieView
                ref={ref => { lottieRefs.current[stage.name] = ref; }}
                source={stage.lottieSource}
                style={styles.lottieIcon}
                autoPlay={false}
                loop={false}
                renderMode={Platform.OS === 'android' ? 'HARDWARE' : 'AUTOMATIC'}
              />
            </View>
            <ThemedText
              style={[
                styles.iconLabel,
                selectedStage?.name === stage.name && styles.selectedIconLabel
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
  if (stage.minHours <= 8) return "Stay hydrated with water or herbal tea.";
  if (stage.minHours <= 16) return "Add a pinch of salt to water for electrolytes.";
  return "Consider light activities and meditation.";
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
    paddingTop: Platform.OS === 'ios' ? 10 : 30, 
  },
  backButton: {
    padding: 10,
    marginRight: 5,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0a7ea4',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',   
    marginRight: 50, 
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: ICON_ROW_PADDING,
    marginBottom: 15,
  },
  iconContainer: {
    alignItems: 'center',
    width: ICON_CONTAINER_WIDTH,
    marginHorizontal: ICON_CONTAINER_MARGIN,
    marginBottom: 10,
  },
  lottieWrapper: {
    padding: 4,
    borderRadius: 8,
    marginBottom: 4,
    width: LOTTIE_ICON_SIZE + 8, 
    height: LOTTIE_ICON_SIZE + 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIconContainer: {
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
  },
  lottieIcon: {
    width: LOTTIE_ICON_SIZE, 
    height: LOTTIE_ICON_SIZE, 
  },
  iconLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  selectedIconLabel: {
    fontWeight: 'bold',
    color: '#0a7ea4',
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
  stageBigLottie: {
    width: 100,
    height: 100,
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
    lineHeight: 22,
  },
});