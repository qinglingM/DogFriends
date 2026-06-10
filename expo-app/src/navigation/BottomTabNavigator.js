import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

import WalkNavigator from './WalkNavigator';
import SquareNavigator from './SquareNavigator';
import ExploreNavigator from './ExploreNavigator';
import ProfileNavigator from './ProfileNavigator';

const Tab = createBottomTabNavigator();

const TAB_CONFIG = {
  Walk: { label: '遛狗', icon: 'location', iconActive: 'location' },
  Square: { label: '广场', icon: 'compass-outline', iconActive: 'compass' },
  Explore: { label: '去玩', icon: 'paw-outline', iconActive: 'paw' },
  Profile: { label: '我的', icon: 'person-outline', iconActive: 'person' },
};

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const config = TAB_CONFIG[route.name];
          const iconName = focused ? config.iconActive : config.icon;
          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarLabel: ({ focused, color }) => {
          const config = TAB_CONFIG[route.name];
          return (
            <Text style={[styles.label, { color, fontWeight: focused ? '800' : '400' }]}>
              {config.label}
            </Text>
          );
        },
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
      })}
    >
      <Tab.Screen name="Walk" component={WalkNavigator} />
      <Tab.Screen name="Square" component={SquareNavigator} />
      <Tab.Screen name="Explore" component={ExploreNavigator} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: spacing.bottomTabHeight,
    paddingBottom: 14,
    paddingTop: 4,
  },
  tabItem: {
    paddingVertical: 2,
  },
  label: {
    fontSize: 11,
    marginTop: 2,
  },
});
