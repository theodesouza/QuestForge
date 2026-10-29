import type { BossArt as BossArtId } from '../../content/bosses';
import { ArquitetoArt } from './ArquitetoArt';
import { ColossoArt } from './ColossoArt';
import { GolemArt } from './GolemArt';
import { MercadorArt } from './MercadorArt';
import { QuimeraArt } from './QuimeraArt';

interface Props {
  art: BossArtId;
  size?: number;
  cracked?: boolean;
  defeated?: boolean;
  /** Quimera: cabeças que já caíram. */
  headsFelled?: number;
  /** Colosso: acertos em cada vértice e quantos racham um. */
  facetHits?: Record<string, number>;
  hitsToCrack?: number;
  /** Arquiteto: camadas de concreto no corpo. */
  layers?: number;
}

/** Registro das artes de chefão: cada BossDef aponta para uma delas. */
export function BossArt({ art, size, cracked, defeated, headsFelled, facetHits, hitsToCrack, layers }: Props) {
  switch (art) {
    case 'golem':
      return <GolemArt size={size} cracked={cracked} defeated={defeated} />;
    case 'mercador':
      return <MercadorArt size={size} cracked={cracked} defeated={defeated} />;
    case 'quimera':
      return <QuimeraArt size={size} cracked={cracked} defeated={defeated} headsFelled={headsFelled} />;
    case 'colosso':
      return <ColossoArt size={size} cracked={cracked} defeated={defeated} facetHits={facetHits} hitsToCrack={hitsToCrack} />;
    case 'arquiteto':
      return <ArquitetoArt size={size} cracked={cracked} defeated={defeated} layers={layers} />;
  }
}
