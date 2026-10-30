/** Primeira tela de quem ainda não entrou: login com Google (única forma de conta nesta versão). */
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { missingConfig } from '../../auth/config';
import { createInitialState } from '../../domain/game/game';
import { signIn } from '../../state/session';
import { useGameStore } from '../../state/store';
import { Astrolabe } from '../../ui/Astrolabe';
import { Button } from '../../ui/Button';
import { useReduceMotion } from '../../ui/feedback';
import { Screen } from '../../ui/Screen';
import { Text } from '../../ui/Text';
import { colors, space } from '../../ui/theme';

const STARTER = createInitialState(0).profile.equipped;

export function LoginScreen() {
  const reduce = useReduceMotion();
  const busy = useGameStore((s) => s.authBusy);
  const error = useGameStore((s) => s.authError);
  const missing = missingConfig();

  const footer = (
    <>
      <Button label="Entrar com o Google" icon="hero" loading={busy} onPress={signIn} accessibilityHint="Abre a lista de contas Google do aparelho" />
      <Text variant="caption" color={colors.mistDim} align="center">
        Guardamos só o seu progresso e o identificador da conta. Sem anúncios e sem rastreamento.
      </Text>
    </>
  );

  return (
    <Screen footer={footer} scroll>
      <Animated.View entering={reduce ? undefined : FadeIn.duration(700)} style={styles.welcome}>
        <Astrolabe level={1} equipped={STARTER} size={250} animate={!reduce} />
        <Text variant="label" color={colors.brass}>
          QuestForge
        </Text>
        <Text variant="hero" align="center">
          Guarde a sua jornada.
        </Text>
        <Text variant="body" color={colors.parchmentDim} align="center">
          Entre com o Google e o seu progresso fica salvo na conta: se trocar de celular ou reinstalar o app, é só entrar de novo e continuar de onde parou.
        </Text>
      </Animated.View>

      {error ? (
        <View style={styles.error} accessibilityLiveRegion="polite">
          <Text variant="caption" color={colors.ember}>
            {error}
          </Text>
        </View>
      ) : null}

      {__DEV__ && missing.length > 0 ? (
        <View style={styles.dev}>
          <Text variant="caption" color={colors.mist}>
            Ambiente de desenvolvimento: faltam variáveis do Firebase ({missing.join(', ')}). Veja docs/CLOUD_SETUP.md.
          </Text>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  welcome: { alignItems: 'center', gap: space.md, paddingTop: space.xl },
  error: { padding: space.md, borderRadius: 12, backgroundColor: colors.emberGlow },
  dev: { padding: space.md, borderRadius: 12, backgroundColor: colors.ink800 },
});
