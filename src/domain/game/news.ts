/**
 * Novidades: avisos de uma vez só para quem já joga (ex.: "chegaram os Cenários"). Cada aviso
 * tem uma chave no registro (`news:<id>`), então aparece uma única vez por aparelho. Quem
 * termina a apresentação agora já começa com tudo "visto" — não faz sentido anunciar como
 * novidade o que sempre existiu para essa pessoa.
 */
import type { Tx } from './tx';

export interface News {
  id: string;
  title: string;
  detail: string;
}

export const NEWS: readonly News[] = [
  {
    id: 'cosmetics-v2',
    title: 'Novidades na personalização',
    detail: 'Cenários atrás do herói, molduras, núcleos e auras novas e mais peças na Oficina.',
  },
  {
    id: 'atlas-r4-r5',
    title: 'Duas novas regiões no Atlas',
    detail: 'Torres Euclidianas e Cavernas Volumétricas: geometria plana e espacial, com o Colosso Euclidiano e o Arquiteto dos Sólidos.',
  },
  {
    id: 'atlas-r6-r9',
    title: 'Quatro novas regiões no Atlas',
    detail: 'Observatório dos Dados, Labirinto do Acaso, Cordilheira das Funções e Ilhas da Medida, cada uma com um chefão de mecânica própria.',
  },
];

export function announceNews(tx: Tx, now: number) {
  for (const n of NEWS) {
    const key = `news:${n.id}`;
    if (tx.hasLedger(key)) continue;
    tx.addLedger(key, now);
    tx.emit({ type: 'news', id: n.id, title: n.title, detail: n.detail });
  }
}

export function markNewsSeen(tx: Tx, now: number) {
  for (const n of NEWS) if (!tx.hasLedger(`news:${n.id}`)) tx.addLedger(`news:${n.id}`, now);
}
