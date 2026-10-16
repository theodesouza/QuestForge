/**
 * Movimento calmo: entradas e toques sem mola (nada de "quicar" ou passar do ponto).
 * Tudo usa curvas de desaceleração suaves, que chegam devagar no lugar.
 */
import { Easing, FadeIn, FadeInDown, FadeInUp, SlideInDown } from 'react-native-reanimated';

/** Desaceleração suave, sem ultrapassar o destino. */
export const EASE_OUT = Easing.out(Easing.cubic);
export const EASE_IN_OUT = Easing.inOut(Easing.quad);

export const calm = {
  /** Painéis que sobem de baixo (prévia "experimentar"). */
  sheet: () => SlideInDown.duration(340).easing(EASE_OUT),
  /** Avisos que descem do topo. */
  toast: () => FadeInUp.duration(300).easing(EASE_OUT),
  /** Itens que surgem no lugar (revelação, nível, estrelas). */
  appear: (delay = 0, duration = 420) => FadeIn.delay(delay).duration(duration).easing(EASE_OUT),
  /** Linhas que sobem um pouco ao entrar (dano na batalha). */
  rise: (delay = 0) => FadeInDown.delay(delay).duration(320).easing(EASE_OUT),
};
