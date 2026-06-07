import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WalkHomeScreen from '../screens/walk/WalkHomeScreen';
import WalkTrackingScreen from '../screens/walk/WalkTrackingScreen';
import WalkSummaryScreen from '../screens/walk/WalkSummaryScreen';

const Stack = createNativeStackNavigator();

export default function WalkNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WalkHome" component={WalkHomeScreen} />
      <Stack.Screen name="WalkTracking" component={WalkTrackingScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="WalkSummary" component={WalkSummaryScreen} />
    </Stack.Navigator>
  );
}
