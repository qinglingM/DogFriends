import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SquareScreen from '../screens/square/SquareScreen';
import CreatePostScreen from '../screens/square/CreatePostScreen';
import PostDetailScreen from '../screens/square/PostDetailScreen';
import PersonalProfileScreen from '../screens/profile/PersonalProfileScreen';
import ProfileFeedDetailScreen from '../screens/profile/ProfileFeedDetailScreen';
import EarnedBadgesScreen from '../screens/profile/EarnedBadgesScreen';
import DogProfileScreen from '../screens/profile/DogProfileScreen';

const Stack = createNativeStackNavigator();

export default function SquareNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SquareHome" component={SquareScreen} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="UserProfile" component={PersonalProfileScreen} />
      <Stack.Screen name="ProfileFeedDetail" component={ProfileFeedDetailScreen} />
      <Stack.Screen name="EarnedBadges" component={EarnedBadgesScreen} />
      <Stack.Screen name="DogProfile" component={DogProfileScreen} />
    </Stack.Navigator>
  );
}
