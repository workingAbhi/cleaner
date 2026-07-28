import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text } from 'react-native';
import { Colors } from './src/core/theme';
import { RootNavigator } from './src/core/navigation';
import { AuthProvider } from './src/core/context';

function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
/*
function App(): React.JSX.Element {
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.background}
      />

      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Cleaner</Text>

        <Text style={styles.subtitle}>
          Production Architecture Initialized
        </Text>
      </SafeAreaView>
    </>
  );
}
  */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
  },

  subtitle: {
    marginTop: 12,
    color: Colors.textSecondary,
    fontSize: 16,
  },
});

export default App;