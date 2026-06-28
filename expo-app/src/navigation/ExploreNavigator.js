import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ExploreHomeScreen from '../screens/explore/ExploreHomeScreen';
import LocationDetailScreen from '../screens/explore/LocationDetailScreen';
import AddLocationScreen from '../screens/explore/AddLocationScreen';
import AddLocationSuccessScreen from '../screens/explore/AddLocationSuccessScreen';
import UpdateInfoScreen from '../screens/explore/UpdateInfoScreen';
import SearchLocationScreen from '../screens/explore/SearchLocationScreen';

const Stack = createNativeStackNavigator();

export default function ExploreNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExploreHome" component={ExploreHomeScreen} />
      <Stack.Screen name="LocationDetail" component={LocationDetailScreen} options={{ tabBarStyle: { display: 'none' } }} />
      <Stack.Screen name="AddLocation" component={AddLocationScreen} />
      <Stack.Screen name="AddLocationSuccess" component={AddLocationSuccessScreen} />
      <Stack.Screen name="UpdateInfo" component={UpdateInfoScreen} />
      <Stack.Screen name="SearchLocation" component={SearchLocationScreen} />
    </Stack.Navigator>
  );
}
