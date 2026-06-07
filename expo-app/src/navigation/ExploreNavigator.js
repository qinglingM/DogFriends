import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ExploreHomeScreen from '../screens/explore/ExploreHomeScreen';
import LocationDetailScreen from '../screens/explore/LocationDetailScreen';

const Stack = createNativeStackNavigator();

export default function ExploreNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExploreHome" component={ExploreHomeScreen} />
      <Stack.Screen name="LocationDetail" component={LocationDetailScreen} />
    </Stack.Navigator>
  );
}
