/**
 * Troca de abas com deslize (como em jogos: arrastar a tela para o lado muda de aba).
 *
 * Todas as abas leem o mesmo deslocamento (`tabSlide`, em px) e o aplicam à própria tela. Ao arrastar,
 * a tela acompanha o dedo; ao soltar, ela termina de sair, a aba muda e a nova entra pelo lado oposto.
 * O mesmo movimento vale para o toque na barra de abas (a direção vem da posição das abas).
 */
import { router } from 'expo-router';
import { Dimensions } from 'react-native';
import { Easing, makeMutable, withDelay, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useGameStore } from '../../state/store';
import { haptic } from '../../ui/feedback';

export const TAB_ORDER = ['camp', 'atlas', 'academy', 'hero'] as const;
export type TabName = (typeof TAB_ORDER)[number];

/** Deslocamento horizontal atual das telas de aba (px). */
export const tabSlide = makeMutable(0);

const OUT_MS = 150;
const IN_MS = 230;
const OUT = Easing.in(Easing.quad);
const IN = Easing.out(Easing.cubic);

let busy = false;
/** Movimento reduzido do sistema (atualizado pelo layout das abas). */
let systemReduce = false;
export const setSystemReduceMotion = (v: boolean) => {
  systemReduce = v;
};

export function tabIndexOf(pathname: string): number {
  const name = pathname.replace(/^\//, '').split('/')[0];
  return TAB_ORDER.indexOf(name as TabName);
}

function reduced(): boolean {
  const pref = useGameStore.getState().game?.profile.settings.reduceMotion ?? 'system';
  return pref === 'always' || (pref === 'system' && systemReduce);
}

/** Largura de referência do deslize. */
export const slideWidth = () => Dimensions.get('window').width;

/** Estágio final de um deslize: com a tela já fora, troca a aba e faz a nova entrar do outro lado. */
function enter(target: TabName, dir: 1 | -1) {
  const w = slideWidth();
  tabSlide.set(dir * w); // a nova aba nasce fora da tela, do lado de onde vem
  router.navigate(`/${target}` as never);
  tabSlide.set(withDelay(40, withTiming(0, { duration: IN_MS, easing: IN })));
  setTimeout(() => {
    busy = false;
  }, IN_MS + 80);
}

/**
 * Muda para a aba `target`. `fromX` é onde a tela já está (um arrasto em andamento) — a saída continua
 * dali. `dir` = +1 quando a nova aba vem da direita (o conteúdo sai para a esquerda).
 */
export function goToTab(from: number, target: number, fromX = 0, velocity = 0): void {
  if (busy || target === from || target < 0 || target >= TAB_ORDER.length) {
    tabSlide.set(withTiming(0, { duration: IN_MS, easing: IN }));
    return;
  }
  haptic('select');
  const dir: 1 | -1 = target > from ? 1 : -1;
  const name = TAB_ORDER[target];
  if (reduced()) {
    tabSlide.set(0);
    router.navigate(`/${name}` as never);
    return;
  }
  busy = true;
  const w = slideWidth();
  // Quanto falta para a tela sair: arrasto já feito + velocidade do gesto encurtam o tempo.
  const remaining = Math.max(0.15, 1 - Math.abs(fromX) / w);
  const ms = Math.max(70, OUT_MS * remaining * (Math.abs(velocity) > 900 ? 0.7 : 1));
  tabSlide.set(
    withTiming(-dir * w, { duration: ms, easing: OUT }, (finished) => {
      'worklet';
      if (finished) scheduleEnter(name, dir);
    }),
  );
}

function scheduleEnter(name: TabName, dir: 1 | -1) {
  'worklet';
  scheduleOnRN(enter, name, dir);
}
