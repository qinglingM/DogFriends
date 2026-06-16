import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileTabScreen from '../screens/profile/ProfileTabScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ProfileFeedDetailScreen from '../screens/profile/ProfileFeedDetailScreen';
import DogProfileScreen from '../screens/profile/DogProfileScreen';
import DogEditScreen from '../screens/profile/DogEditScreen';
import DogSwitchScreen from '../screens/profile/DogSwitchScreen';
import VaccineScreen from '../screens/profile/VaccineScreen';
import FavoriteLocationsScreen from '../screens/profile/FavoriteLocationsScreen';
import ContributionHistoryScreen from '../screens/profile/ContributionHistoryScreen';
import WalkHistoryScreen from '../screens/walk/WalkHistoryScreen';
import WalkDetailScreen from '../screens/walk/WalkDetailScreen';
import LocationDetailScreen from '../screens/explore/LocationDetailScreen';
import UpdateInfoScreen from '../screens/explore/UpdateInfoScreen';
import SettingsScreen from '../screens/common/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function ProfileNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileTabScreen} />
      <Stack.Screen name="PersonalProfile" component={ProfileTabScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ProfileFeedDetail" component={ProfileFeedDetailScreen} />
      <Stack.Screen name="DogProfile" component={DogProfileScreen} />
      <Stack.Screen name="DogEdit" component={DogEditScreen} />
      <Stack.Screen name="DogSwitch" component={DogSwitchScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Vaccine" component={VaccineScreen} />
      <Stack.Screen name="FavoriteLocations" component={FavoriteLocationsScreen} />
      <Stack.Screen name="ContributionHistory" component={ContributionHistoryScreen} />
      <Stack.Screen name="LocationDetail" component={LocationDetailScreen} />
      <Stack.Screen name="UpdateInfo" component={UpdateInfoScreen} />
      <Stack.Screen name="WalkHistory" component={WalkHistoryScreen} />
      <Stack.Screen name="WalkDetail" component={WalkDetailScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
