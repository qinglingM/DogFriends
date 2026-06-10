import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WalkHomeScreen from '../screens/walk/WalkHomeScreen';
import WalkCheckinScreen from '../screens/walk/WalkCheckinScreen';
import WalkResultScreen from '../screens/walk/WalkResultScreen';

const Stack = createNativeStackNavigator();

export default function WalkNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="WalkHome" component={WalkHomeScreen} />
      <Stack.Screen name="WalkCheckin" component={WalkCheckinScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="WalkResult" component={WalkResultScreen} options={{ animation: 'slide_from_right' }} />
    </Stack.Navigator>
  );
}
