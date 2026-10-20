/**
 * Primeiro acesso desta conta neste aparelho: o jogo só abre depois de saber o que a nuvem tem.
 * Sem isto, um aparelho novo criaria um perfil em branco concorrendo com o progresso guardado.
 */
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { retryRestore, signOut } from '../../state/session';
import { useGameStore } from '../../state/store';
import { Button } from '../../ui/Button';
import { Screen } from '../../ui/Screen';
import { Text } from '../../ui/Text';
import { colors, space } from '../../ui/theme';

export function RestoreScreen() {
  const error = useGameStore((s) => s.restoreError);
  const user = useGameStore((s) => s.user);

  return (
    <Screen scroll={false} contentStyle={styles.center}>
      {error ? (
        <View style={styles.block} accessibilityLiveRegion="polite">
          <Text variant="title" align="center">
            Não conseguimos buscar seu progresso
          </Text>
          <Text variant="body" color={colors.parchmentDim} align="center">
            {error}
          </Text>
          <Text variant="caption" color={colors.mist} align="center">
            Nada foi alterado. Assim que a conexão voltar, é só tentar de novo.
          </Text>
          <Button label="Tentar de novo" onPress={retryRestore} />
          <Button label="Sair da conta" variant="ghost" onPress={signOut} />
        </View>
      ) : (
        <View style={styles.block} accessibilityLiveRegion="polite">
          <ActivityIndicator size="large" color={colors.brass} />
          <Text variant="title" align="center">
            Buscando seu progresso…
          </Text>
          <Text variant="body" color={colors.parchmentDim} align="center">
            {user?.displayName ? `Olá, ${user.displayName.split(' ')[0]}! ` : ''}Estamos conferindo o que a sua conta já guardou.
          </Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
  block: { gap: space.lg, alignItems: 'stretch' },
});
