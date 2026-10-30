/**
 * Desenha o diálogo da frente da fila: painel do app sobre um véu escuro, botões empilhados
 * (a ação principal em destaque, "cancelar" discreto, ações destrutivas em vermelho).
 * É um Modal de verdade: o leitor de tela fica dentro dele e o botão Voltar do Android o dispensa
 * (equivale a "cancelar", ou ao único botão quando não há cancelamento).
 */
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { calm } from '../../ui/calm';
import { Button } from '../../ui/Button';
import { useReduceMotion } from '../../ui/feedback';
import { Panel } from '../../ui/Panel';
import { Text } from '../../ui/Text';
import { colors, space } from '../../ui/theme';
import { closeDialog, useDialogStore, type DialogButton } from './dialog';

function variantFor(button: DialogButton, isMain: boolean): 'primary' | 'secondary' | 'ghost' | 'danger' {
  if (button.style === 'cancel') return 'ghost';
  if (button.style === 'destructive') return 'danger';
  return isMain ? 'primary' : 'secondary';
}

export function DialogHost() {
  const dialog = useDialogStore((s) => s.queue[0]);
  const reduce = useReduceMotion();
  const insets = useSafeAreaInsets();
  if (!dialog) return null;

  const cancel = dialog.buttons.find((b) => b.style === 'cancel');
  const main = dialog.buttons.find((b) => b.style !== 'cancel' && b.style !== 'destructive');
  const dismiss = () => closeDialog(dialog.id, cancel ?? (dialog.buttons.length === 1 ? dialog.buttons[0] : undefined));
  // Cancelar vai por último; o resto segue a ordem em que foi escrito.
  const ordered = [...dialog.buttons.filter((b) => b.style !== 'cancel'), ...dialog.buttons.filter((b) => b.style === 'cancel')];

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={dismiss}>
      <Animated.View
        key={dialog.id}
        entering={FadeIn.duration(reduce ? 80 : 160)}
        exiting={FadeOut.duration(120)}
        style={[styles.scrim, { paddingTop: insets.top + space.lg, paddingBottom: insets.bottom + space.lg }]}
        accessibilityViewIsModal
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} accessibilityLabel="Fechar" accessible={false} />
        <Animated.View entering={reduce ? FadeIn : calm.appear(0, 220)} style={styles.card}>
          <Panel tone="raised" style={styles.panel}>
            <View accessible accessibilityRole="alert" style={styles.copy}>
              <Text variant="title" align="center">
                {dialog.title}
              </Text>
              {dialog.message ? (
                <Text variant="body" color={colors.parchmentDim} align="center">
                  {dialog.message}
                </Text>
              ) : null}
            </View>
            <View style={styles.actions}>
              {ordered.map((b, i) => (
                <Button key={`${b.text}-${i}`} label={b.text} size="md" variant={variantFor(b, b === main)} onPress={() => closeDialog(dialog.id, b)} />
              ))}
            </View>
          </Panel>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xl, backgroundColor: 'rgba(6, 9, 20, 0.8)' },
  card: { alignSelf: 'stretch', maxWidth: 420, width: '100%' },
  panel: { gap: space.lg, padding: space.xl },
  copy: { gap: space.sm },
  actions: { gap: space.sm },
});
