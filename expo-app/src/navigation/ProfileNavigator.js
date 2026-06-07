import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/profile/ProfileScreen';
import DogProfileScreen from '../screens/profile/DogProfileScreen';
import DogEditScreen from '../screens/profile/DogEditScreen';
import DogSwitchScreen from '../screens/profile/DogSwitchScreen';
import VaccineScreen from '../screens/profile/VaccineScreen';
import WalkHistoryScreen from '../screens/walk/WalkHistoryScreen';
import WalkDetailScreen from '../screens/walk/WalkDetailScreen';
import SettingsScreen from '../screens/common/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function ProfileNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="DogProfile" component={DogProfileScreen} />
      <Stack.Screen name="DogEdit" component={DogEditScreen} />
      <Stack.Screen name="DogSwitch" component={DogSwitchScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Vaccine" component={VaccineScreen} />
      <Stack.Screen name="WalkHistory" component={WalkHistoryScreen} />
      <Stack.Screen name="WalkDetail" component={WalkDetailScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
