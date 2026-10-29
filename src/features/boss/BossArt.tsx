import type { BossArt as BossArtId } from '../../content/bosses';
import { ArquitetoArt } from './ArquitetoArt';
import { ColossoArt } from './ColossoArt';
import { EsfingeArt } from './EsfingeArt';
import { GolemArt } from './GolemArt';
import { LeviataArt } from './LeviataArt';
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
  /** Leviatã dos Gráficos: escamas que ainda cobrem o corpo. */
  scales?: number;
  maxScales?: number;
  /** Esfinge do Acaso: o golpe atual é um Enigma. */
  riddle?: boolean;
}

/** Registro das artes de chefão: cada BossDef aponta para uma delas. */
export function BossArt({ art, size, cracked, defeated, headsFelled, facetHits, hitsToCrack, layers, scales, maxScales, riddle }: Props) {
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
    case 'esfinge':
      return <EsfingeArt size={size} cracked={cracked} defeated={defeated} riddle={riddle} />;
    case 'leviata':
      return <LeviataArt size={size} cracked={cracked} defeated={defeated} scales={scales} maxScales={maxScales} />;
  }
}
