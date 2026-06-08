import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SquareScreen from '../screens/square/SquareScreen';
import CreatePostScreen from '../screens/square/CreatePostScreen';
import PostDetailScreen from '../screens/square/PostDetailScreen';

const Stack = createNativeStackNavigator();

export default function SquareNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SquareHome" component={SquareScreen} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
    </Stack.Navigator>
  );
}
