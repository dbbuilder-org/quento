/**
 * Tab Layout - Main app navigation with 5 Rings
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

type TabIconProps = {
  focused: boolean;
  ringNumber: number;
  label: string;
};

function TabIcon({ focused, ringNumber, label }: TabIconProps) {
  return (
    <View style={styles.tabContainer}>
      <View
        style={[
          styles.ringIcon,
          focused && styles.ringIconActive,
        ]}
      >
        <Text style={[styles.ringNumber, focused && styles.ringNumberActive]}>
          {ringNumber}
        </Text>
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerTintColor: '#1A1A1A',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E8E4DD',
          height: 85,
          paddingTop: 8,
          paddingBottom: 24,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Your Story',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} ringNumber={1} label="Core" />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} ringNumber={2} label="Discover" />
          ),
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Strategy',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} ringNumber={3} label="Plan" />
          ),
        }}
      />
      <Tabs.Screen
        name="execute"
        options={{
          title: 'Actions',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} ringNumber={4} label="Execute" />
          ),
        }}
      />
      <Tabs.Screen
        name="optimize"
        options={{
          title: 'Growth',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} ringNumber={5} label="Optimize" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#D4C4A8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  ringIconActive: {
    borderColor: '#2D5A3D',
    backgroundColor: '#2D5A3D',
  },
  ringNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B7355',
  },
  ringNumberActive: {
    color: '#FFFFFF',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#8B7355',
  },
  tabLabelActive: {
    color: '#2D5A3D',
  },
});
