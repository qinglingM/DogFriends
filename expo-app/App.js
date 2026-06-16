import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import { ExploreProvider } from './src/contexts/ExploreContext';
import { SquareProvider } from './src/contexts/SquareContext';
import { WalkProvider } from './src/contexts/WalkContext';
import { DogProvider } from './src/contexts/DogContext';
import { ProfileProvider } from './src/contexts/ProfileContext';
import { useCurrentCity } from './src/hooks/useCurrentCity';

function AppInner() {
  const { province, city } = useCurrentCity();

  return (
    <ProfileProvider initialProvince={province} initialCity={city}>
      <StatusBar style="dark" />
      <RootNavigator />
    </ProfileProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ExploreProvider>
          <SquareProvider>
            <WalkProvider>
              <DogProvider>
                <AppInner />
              </DogProvider>
            </WalkProvider>
          </SquareProvider>
        </ExploreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}