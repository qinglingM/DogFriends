import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SquareScreen from '../screens/square/SquareScreen';
import CreatePostScreen from '../screens/square/CreatePostScreen';
import PostDetailScreen from '../screens/square/PostDetailScreen';
import ProfileTabScreen from '../screens/profile/ProfileTabScreen';
import ProfileFeedDetailScreen from '../screens/profile/ProfileFeedDetailScreen';
import DogProfileScreen from '../screens/profile/DogProfileScreen';
import FollowListScreen from '../screens/profile/FollowListScreen';

const Stack = createNativeStackNavigator();

export default function SquareNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SquareHome" component={SquareScreen} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="UserProfile" component={ProfileTabScreen} />
      <Stack.Screen name="ProfileFeedDetail" component={ProfileFeedDetailScreen} />
      <Stack.Screen name="DogProfile" component={DogProfileScreen} />
      <Stack.Screen name="FollowList" component={FollowListScreen} />
    </Stack.Navigator>
  );
}
