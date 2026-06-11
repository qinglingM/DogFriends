import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import { ExploreProvider, useExplore } from './src/contexts/ExploreContext';
import { SquareProvider, useSquare } from './src/contexts/SquareContext';
import { WalkProvider, useWalk } from './src/contexts/WalkContext';
import { DogProvider, useDogs } from './src/contexts/DogContext';
import { BadgeProvider, useBadges } from './src/contexts/BadgeContext';

function BadgeProviderWrapper({ children }) {
  const { dogs } = useDogs();
  const { identityBadges } = useDogs();
  const { contributions, validations, locations, helpful, inaccuracyReports } = useExplore();
  const { posts } = useSquare();
  const { records: walkRecords } = useWalk();

  return (
    <BadgeProvider
      dogs={dogs}
      contributions={contributions}
      validations={validations}
      locations={locations}
      helpful={helpful}
      inaccuracyReports={inaccuracyReports}
      walkRecords={walkRecords}
      posts={posts}
    >
      {children}
    </BadgeProvider>
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
                <BadgeProviderWrapper>
                  <StatusBar style="dark" />
                  <RootNavigator />
                </BadgeProviderWrapper>
              </DogProvider>
            </WalkProvider>
          </SquareProvider>
        </ExploreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}