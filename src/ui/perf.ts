/**
 * Vigia de fluidez: em telas cheias de efeitos (revelação de item, subida de nível), mede o intervalo
 * entre quadros. Se o aparelho não dá conta (vários quadros seguidos bem lentos), avisa uma vez para a
 * tela se simplificar na hora — em vez de deixar o app engasgar até o Android dizer que não responde.
 */
import { useEffect, useRef } from 'react';

/** Um quadro mais lento que isto (≈ 9 fps) conta como engasgo. */
const SLOW_FRAME_MS = 110;
/** Quantos engasgos seguidos disparam o aviso. */
const SLOW_STREAK = 4;
/** Ignora a montagem da tela (o primeiro desenho sempre demora). */
const WARMUP_MS = 700;

export function useSlowFrames(active: boolean, onSlow: () => void): void {
  const cb = useRef(onSlow);
  useEffect(() => {
    cb.current = onSlow;
  }, [onSlow]);

  useEffect(() => {
    if (!active || typeof requestAnimationFrame !== 'function') return;
    let raf = 0;
    let last = 0;
    let streak = 0;
    const started = Date.now();
    const tick = (t: number) => {
      if (last && Date.now() - started > WARMUP_MS) {
        streak = t - last > SLOW_FRAME_MS ? streak + 1 : 0;
        if (streak >= SLOW_STREAK) {
          cb.current();
          return; // avisa uma vez
        }
      }
      last = t;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}
