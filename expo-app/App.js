import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import { ExploreProvider } from './src/contexts/ExploreContext';
import { SquareProvider } from './src/contexts/SquareContext';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ExploreProvider>
          <SquareProvider>
            <StatusBar style="dark" />
            <RootNavigator />
          </SquareProvider>
        </ExploreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
