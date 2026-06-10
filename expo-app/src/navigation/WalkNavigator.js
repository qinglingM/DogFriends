import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WalkHomeScreen from '../screens/walk/WalkHomeScreen';
import WalkTrackingScreen from '../screens/walk/WalkTrackingScreen';
import WalkCheckinScreen from '../screens/walk/WalkCheckinScreen';
import WalkResultScreen from '../screens/walk/WalkResultScreen';

const Stack = createNativeStackNavigator();

export default function WalkNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WalkHome" component={WalkHomeScreen} />
      <Stack.Screen name="WalkTracking" component={WalkTrackingScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="WalkCheckin" component={WalkCheckinScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="WalkResult" component={WalkResultScreen} options={{ animation: 'slide_from_right' }} />
    </Stack.Navigator>
  );
}
