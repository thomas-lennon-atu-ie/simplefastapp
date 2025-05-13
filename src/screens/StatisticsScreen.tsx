/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState, useEffect } from 'react';
import ApexCharts from 'react-apexcharts';
import { 
  View, 
  StyleSheet, 
  Platform, 
  FlatList, 
  TouchableOpacity, 
  ScrollView,
  useWindowDimensions 
} from 'react-native'; 

import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useFast, CompletedFast } from '../context/FastContext';

const TableHeader = () => (
  <View style={styles.tableHeader}>
    <ThemedText style={styles.tableHeaderText}>Date</ThemedText>
    <ThemedText style={styles.tableHeaderText}>Duration</ThemedText>
  </View>
);

function AccessibleEmoji({ label, children }: Readonly<{ label: string; children: string }>) {
  if (Platform.OS === 'web') {
    
    return <span role="img" aria-label={label} style={{ fontSize: 24 }}>{children}</span>;
  }
  return <ThemedText style={{ fontSize: 24 }}>{children}</ThemedText>;
}

export default function StatisticsScreen() {
  const { fastHistory } = useFast();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [filteredHistory, setFilteredHistory] = useState<CompletedFast[]>([]);
  const [chartData, setChartData] = useState<{ categories: string[]; series: number[] }>({
    categories: [],
    series: [],
  });

  const totalHoursFasted = fastHistory.reduce((sum, fast) => sum + fast.duration / (1000 * 60 * 60), 0);
  const longestFast = Math.max(...fastHistory.map(fast => fast.duration / (1000 * 60 * 60)));
  const averageFast = fastHistory.length ? totalHoursFasted / fastHistory.length : 0;

  useEffect(() => {
    const filtered = fastHistory.filter(fast => {
      const fastDate = fast.startTime.toDate();
      return fastDate.getMonth() === selectedMonth;
    });
    setFilteredHistory(filtered);
  }, [selectedMonth, fastHistory]);

  useEffect(() => {
    const now = new Date();
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(now.getDate() - i);
      return date;
    }).reverse();

    const categories = last14Days.map(date => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    const series = last14Days.map(date => {
      const fastForDay = fastHistory.find(fast => {
        const fastDate = fast.startTime.toDate();
        return fastDate.toDateString() === date.toDateString();
      });
      return fastForDay ? fastForDay.duration / (1000 * 60 * 60) : 0;
    });

    setChartData({ categories, series });
  }, [fastHistory]);

  const exportToCSV = () => {
    if (Platform.OS !== 'web') {
      alert('CSV export is only available on web');
      return;
    }
    
    let csvContent = "Date,Duration (hours)\n";
    
    fastHistory.forEach(fast => {
      const date = fast.startTime.toDate().toLocaleDateString();
      const duration = (fast.duration / (1000 * 60 * 60)).toFixed(1);
      csvContent += `${date},${duration}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'fasting_history.csv');
    link.click();
    URL.revokeObjectURL(url); // Clean up the object URL
  };

  const { height } = useWindowDimensions();
  
  // Create special web-specific styles for the container and scrollview
  const webScrollViewStyle = Platform.OS === 'web' 
    ? { 
        height: height, 
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch'
      } 
    : { flex: 1 };
    
  return (
    <ThemedView style={[styles.container, Platform.OS === 'web' && { height: '100vh' }]}>
      <ScrollView 
        style={webScrollViewStyle}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={true}
      >
        <ThemedText type="title" style={styles.title}>Fasting Statistics</ThemedText>

        {/* Chart */}
        {Platform.OS === 'web' ? (
          <View style={styles.chartContainer}>
            <ApexCharts
              options={{
                chart: { id: 'fasting-chart' },
                xaxis: { categories: chartData.categories },
                yaxis: { 
                  title: { text: 'Hours Fasted' }, 
                  min: 0,
                  max: 24,
                  tickAmount: 7,
                  labels: {
                    formatter: (val) => Math.round(val).toString()
                  },
                  forceNiceScale: false
                },
                title: { text: 'Last 14 Days', align: 'center' },
                dataLabels: {
                  enabled: true,
                  formatter: (val) => Math.round(Number(val)).toString()
                },
                tooltip: {
                  y: {
                    formatter: (val) => Math.round(val) + " hours"
                  }
                }
              }}
              series={[{ name: 'Hours Fasted', data: chartData.series }]}
              type="bar"
              height={300}
            />
          </View>
        ) : (
          <ThemedText style={styles.chartFallback}>Chart is only available on web.</ThemedText>
        )}

        <View style={styles.statsCardContainer}>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <View style={[styles.iconContainer, {backgroundColor: '#e3f2fd'}]}>
                <AccessibleEmoji label="Clock icon representing total hours fasted">🕒</AccessibleEmoji>
              </View>
              <View style={styles.statTextContainer}>
                <ThemedText style={styles.statValue}>{totalHoursFasted.toFixed(0)}</ThemedText>
                <ThemedText style={styles.statLabel}>Total Hours</ThemedText>
              </View>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.iconContainer, {backgroundColor: '#e8f5e9'}]}>
                <AccessibleEmoji label="Trophy icon representing longest fast">🏆</AccessibleEmoji>
              </View>
              <View style={styles.statTextContainer}>
                <ThemedText style={styles.statValue}>{longestFast.toFixed(0)}</ThemedText>
                <ThemedText style={styles.statLabel}>Longest Fast (h)</ThemedText>
              </View>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.iconContainer, {backgroundColor: '#fff8e1'}]}>
                <AccessibleEmoji label="Chart icon representing average fast duration">📊</AccessibleEmoji>
              </View>
              <View style={styles.statTextContainer}>
                <ThemedText style={styles.statValue}>{averageFast.toFixed(1)}</ThemedText>
                <ThemedText style={styles.statLabel}>Average (h)</ThemedText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.filterContainer}>
          {Array.from({ length: 12 }, (_, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.filterButton, selectedMonth === i && styles.filterButtonActive]}
              onPress={() => setSelectedMonth(i)}
            >
              <ThemedText style={styles.filterButtonText}>{new Date(0, i).toLocaleString('en-US', { month: 'short' })}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.exportButton}
          onPress={exportToCSV}
        >
          <ThemedText style={styles.exportButtonText}>Export All Data to CSV</ThemedText>
        </TouchableOpacity>

       
        <FlatList
          data={filteredHistory}
          keyExtractor={(item: CompletedFast) => item.id ?? `fast-${item.startTime.toMillis()}`}
          renderItem={({ item, index }: { item: CompletedFast, index: number }) => (
            <View style={[
              styles.tableRow, 
              index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd
            ]}>
              <ThemedText style={styles.tableCell}>{item.startTime.toDate().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}</ThemedText>
              <ThemedText style={[styles.tableCell, styles.tableCellRight]}>
                {Math.round(item.duration / (1000 * 60 * 60))} hours
              </ThemedText>
            </View>
          )}
          ListHeaderComponent={TableHeader}
          ListEmptyComponent={
            <View style={styles.emptyTableMessage}>
              <ThemedText>No fasting data for this month</ThemedText>
            </View>
          }
        />
      </ScrollView>
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
  
  // Chart styles
  chartContainer: {
    marginBottom: 24,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'white',
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  
  chartFallback: {
    textAlign: 'center',
    marginBottom: 24,
  },
  
  // Stats card styles
  statsCardContainer: {
    marginBottom: 24,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
    width: '30%',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 24,
  },
  statTextContainer: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  
  // Filter button styles
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  filterButton: {
    padding: 8,
    margin: 4,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#0a7ea4',
  },
  filterButtonText: {
    color: '#fff',
  },
  
  // Export button
  exportButton: {
    backgroundColor: '#4caf50',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  exportButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  
  // Enhanced table
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#0a7ea4',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeaderText: {
    fontWeight: 'bold',
    color: 'white',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableRowEven: {
    backgroundColor: '#f5f5f5',
  },
  tableRowOdd: {
    backgroundColor: 'white',
  },
  tableCell: {
    fontSize: 14,
    color: '#333',
  },
  tableCellRight: {
    fontWeight: '500',
    color: '#333',
  },
  emptyTableMessage: {
    padding: 20,
    alignItems: 'center',
  },
});