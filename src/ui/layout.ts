/**
 * Medidas do layout largo (versão para computador e tablets deitados). No celular nada disto muda:
 * a coluna ocupa a tela inteira e a navegação fica embaixo.
 *
 *  · a partir de `WIDE_MIN` de largura, as abas viram um trilho fixo à esquerda (`RAIL_W`);
 *  · o conteúdo nunca passa de `CONTENT_MAX` — linhas de texto longas demais cansam, e os painéis
 *    foram desenhados para a largura de um celular grande;
 *  · janelas de cerimônia e diálogos ficam numa coluna mais estreita (`SHEET_MAX`).
 */
import { useWindowDimensions } from 'react-native';

export const WIDE_MIN = 900;
export const RAIL_W = 232;
export const CONTENT_MAX = 780;
export const SHEET_MAX = 540;
/** Telas de foco (questão, batalha, etapa da Academia): um pouco mais largas, para gráficos e tabelas. */
export const FOCUS_MAX = 860;

export function useWide(): boolean {
  return useWindowDimensions().width >= WIDE_MIN;
}

/** Coluna centrada com largura máxima — o mesmo estilo serve em qualquer tela. */
export const column = (max: number = CONTENT_MAX) => ({ width: '100%', maxWidth: max, alignSelf: 'center' }) as const;
