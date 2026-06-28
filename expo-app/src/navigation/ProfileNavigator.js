import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileTabScreen from '../screens/profile/ProfileTabScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ProfileFeedDetailScreen from '../screens/profile/ProfileFeedDetailScreen';
import DogProfileScreen from '../screens/profile/DogProfileScreen';
import DogEditScreen from '../screens/profile/DogEditScreen';
import DogSwitchScreen from '../screens/profile/DogSwitchScreen';
import FavoriteLocationsScreen from '../screens/profile/FavoriteLocationsScreen';
import LikedPostsScreen from '../screens/profile/LikedPostsScreen';
import WalkHistoryScreen from '../screens/walk/WalkHistoryScreen';
import WalkDetailScreen from '../screens/walk/WalkDetailScreen';
import FollowListScreen from '../screens/profile/FollowListScreen';
import NotificationScreen from '../screens/profile/NotificationScreen';
import LocationDetailScreen from '../screens/explore/LocationDetailScreen';
import UpdateInfoScreen from '../screens/explore/UpdateInfoScreen';
import SettingsScreen from '../screens/common/SettingsScreen';
import UserAgreementScreen from '../screens/common/UserAgreementScreen';
import PrivacyPolicyScreen from '../screens/common/PrivacyPolicyScreen';

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
      <Stack.Screen name="FavoriteLocations" component={FavoriteLocationsScreen} />
      <Stack.Screen name="LocationDetail" component={LocationDetailScreen} options={{ tabBarStyle: { display: 'none' } }} />
      <Stack.Screen name="UpdateInfo" component={UpdateInfoScreen} />
      <Stack.Screen name="WalkHistory" component={WalkHistoryScreen} />
      <Stack.Screen name="WalkDetail" component={WalkDetailScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="UserAgreement" component={UserAgreementScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="FollowList" component={FollowListScreen} />
      <Stack.Screen name="LikedPosts" component={LikedPostsScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
    </Stack.Navigator>
  );
}
