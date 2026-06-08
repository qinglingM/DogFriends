import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/profile/ProfileScreen';
import PersonalProfileScreen from '../screens/profile/PersonalProfileScreen';
import DogProfileScreen from '../screens/profile/DogProfileScreen';
import DogEditScreen from '../screens/profile/DogEditScreen';
import DogSwitchScreen from '../screens/profile/DogSwitchScreen';
import VaccineScreen from '../screens/profile/VaccineScreen';
import FavoriteLocationsScreen from '../screens/profile/FavoriteLocationsScreen';
import ContributionHistoryScreen from '../screens/profile/ContributionHistoryScreen';
import BadgeWallScreen from '../screens/profile/BadgeWallScreen';
import BadgeDetailScreen from '../screens/profile/BadgeDetailScreen';
import WalkHistoryScreen from '../screens/walk/WalkHistoryScreen';
import WalkDetailScreen from '../screens/walk/WalkDetailScreen';
import LocationDetailScreen from '../screens/explore/LocationDetailScreen';
import UpdateInfoScreen from '../screens/explore/UpdateInfoScreen';
import SettingsScreen from '../screens/common/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function ProfileNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="PersonalProfile" component={PersonalProfileScreen} />
      <Stack.Screen name="DogProfile" component={DogProfileScreen} />
      <Stack.Screen name="DogEdit" component={DogEditScreen} />
      <Stack.Screen name="DogSwitch" component={DogSwitchScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Vaccine" component={VaccineScreen} />
      <Stack.Screen name="FavoriteLocations" component={FavoriteLocationsScreen} />
      <Stack.Screen name="ContributionHistory" component={ContributionHistoryScreen} />
      <Stack.Screen name="BadgeWall" component={BadgeWallScreen} />
      <Stack.Screen name="LocationDetail" component={LocationDetailScreen} />
      <Stack.Screen name="UpdateInfo" component={UpdateInfoScreen} />
      <Stack.Screen name="BadgeDetail" component={BadgeDetailScreen} />
      <Stack.Screen name="WalkHistory" component={WalkHistoryScreen} />
      <Stack.Screen name="WalkDetail" component={WalkDetailScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
