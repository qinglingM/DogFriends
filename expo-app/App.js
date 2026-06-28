import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { ExploreProvider } from './src/contexts/ExploreContext';
import { SquareProvider } from './src/contexts/SquareContext';
import { WalkProvider } from './src/contexts/WalkContext';
import { DogProvider } from './src/contexts/DogContext';
import { ProfileProvider } from './src/contexts/ProfileContext';
import ErrorBoundary from './src/components/ErrorBoundary';
import NetworkBanner from './src/components/NetworkBanner';

export default function App() {
  useEffect(() => {
    (async () => {
      await Location.requestForegroundPermissionsAsync();
      await Notifications.requestPermissionsAsync();
    })();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <AuthProvider>
            <NetworkBanner />
            <ProfileProvider>
              <ExploreProvider>
                <SquareProvider>
                  <WalkProvider>
                    <DogProvider>
                      <StatusBar style="dark" />
                      <RootNavigator />
                    </DogProvider>
                  </WalkProvider>
                </SquareProvider>
              </ExploreProvider>
            </ProfileProvider>
          </AuthProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
