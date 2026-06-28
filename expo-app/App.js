import React, { useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ExploreProvider } from './src/contexts/ExploreContext';
import { SquareProvider } from './src/contexts/SquareContext';
import { WalkProvider } from './src/contexts/WalkContext';
import { DogProvider } from './src/contexts/DogContext';
import { ProfileProvider } from './src/contexts/ProfileContext';
import AuthScreen from './src/screens/common/AuthScreen';
import ErrorBoundary from './src/components/ErrorBoundary';
import NetworkBanner from './src/components/NetworkBanner';

function AppInner() {
  return (
    <ProfileProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </ProfileProvider>
  );
}

function AppContent() {
  const { session, loading } = useAuth();

  if (loading) return null;
  if (!session) return <AuthScreen />;

  return (
    <ExploreProvider>
      <SquareProvider>
        <WalkProvider>
          <DogProvider>
            <AppInner />
          </DogProvider>
        </WalkProvider>
      </SquareProvider>
    </ExploreProvider>
  );
}

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
            <AppContent />
          </AuthProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
