import { REGIONS, type CampaignNode, type Region } from '../../content/regions';

export type NodeStatus = 'locked' | 'available' | 'completed';

export interface NodeProgress {
  nodeId: string;
  completedAt: number | null;
  bestCorrect: number;
  runs: number;
}

export interface BossProgress {
  bossId: string;
  attempts: number;
  wins: number;
  /** Tentativas encerradas em retirada desde a última vitória. */
  failedSinceWin: number;
  firstWinAt: number | null;
  flawless: boolean;
  bestTurns: number | null;
}

export interface CampaignView {
  progress: Record<string, NodeProgress>;
  bosses: Record<string, BossProgress>;
}

export function isNodeCompleted(node: CampaignNode, view: CampaignView): boolean {
  if (node.kind === 'boss') return (view.bosses[node.bossId]?.wins ?? 0) > 0;
  return view.progress[node.id]?.completedAt != null;
}

function findAny(nodeId: string): CampaignNode | undefined {
  for (const r of REGIONS) {
    const n = r.nodes.find((x) => x.id === nodeId);
    if (n) return n;
  }
  return undefined;
}

export function nodeStatus(node: CampaignNode, view: CampaignView): NodeStatus {
  if (isNodeCompleted(node, view)) return 'completed';
  const unlocked = node.requires.every((req) => {
    const r = findAny(req);
    return !!r && isNodeCompleted(r, view);
  });
  return unlocked ? 'available' : 'locked';
}

/** Próximo nó a fazer: o primeiro disponível e não concluído, na ordem da campanha. */
export function nextNode(view: CampaignView): { region: Region; node: CampaignNode } | null {
  for (const region of REGIONS) {
    for (const node of region.nodes) {
      if (nodeStatus(node, view) === 'available') return { region, node };
    }
  }
  return null;
}

export function regionCompletion(region: Region, view: CampaignView): { done: number; total: number } {
  const done = region.nodes.filter((n) => isNodeCompleted(n, view)).length;
  return { done, total: region.nodes.length };
}
