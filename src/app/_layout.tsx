import { BricolageGrotesque_600SemiBold } from '@expo-google-fonts/bricolage-grotesque/600SemiBold';
import { BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque/700Bold';
import { BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque/800ExtraBold';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ItemRevealOverlay } from '../features/celebration/ItemRevealOverlay';
import { LevelUpOverlay } from '../features/celebration/LevelUpOverlay';
import { DialogHost } from '../features/dialog/DialogHost';
import { ToastHost } from '../features/toast/ToastHost';
import { LoginScreen } from '../features/auth/LoginScreen';
import { RestoreScreen } from '../features/auth/RestoreScreen';
import { boot } from '../state/session';
import { useGameStore } from '../state/store';
import { Button } from '../ui/Button';
import { Text } from '../ui/Text';
import { colors, space } from '../ui/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const status = useGameStore((s) => s.status);
  const error = useGameStore((s) => s.error);

  useEffect(() => {
    boot();
  }, []);

  const ready = (fontsLoaded || !!fontError) && status !== 'loading';
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  if (!ready) return <View style={styles.root} />;

  return (
    <GestureHandlerRootView style={styles.root}>
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={styles.root}>
        {status === 'signed-out' ? (
          <LoginScreen />
        ) : status === 'restoring' ? (
          <RestoreScreen />
        ) : status === 'legacy' ? (
          <LegacyScreen />
        ) : status === 'error' ? (
          <View style={styles.error}>
            <Text variant="title" align="center">
              Não foi possível abrir seu mapa
            </Text>
            <Text variant="body" color={colors.mist} align="center">
              Seu progresso está salvo no aparelho. Tente novamente — se o problema continuar, reinicie o app.
            </Text>
            <Text variant="caption" color={colors.mistDim} align="center">
              {error}
            </Text>
            <Button label="Tentar novamente" onPress={() => boot()} />
          </View>
        ) : (
          <>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.ink900 },
                animation: 'fade',
              }}
            >
              <Stack.Screen name="session" options={{ gestureEnabled: false, animation: 'slide_from_bottom' }} />
              <Stack.Screen name="boss" options={{ gestureEnabled: false, animation: 'fade' }} />
              <Stack.Screen name="summary" options={{ gestureEnabled: false }} />
            </Stack>
            <ToastHost />
            <LevelUpOverlay />
            <ItemRevealOverlay />
          </>
        )}
        <DialogHost />
      </View>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/** Migração única do progresso antigo: existe só em builds de desenvolvimento (no bundle de produção o `require` é removido). */
function LegacyScreen() {
  if (process.env.EXPO_PUBLIC_LEGACY_MIGRATION === '1') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- require condicional: o Metro remove este ramo (e o módulo) do bundle de produção
    const { LegacyMigrationScreen } = require('../legacy/LegacyMigrationScreen') as typeof import('../legacy/LegacyMigrationScreen');
    return <LegacyMigrationScreen />;
  }
  return null;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink900 },
  error: { flex: 1, justifyContent: 'center', padding: space.xxl, gap: space.lg },
});
