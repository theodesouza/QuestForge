import type { BossArt as BossArtId } from '../../content/bosses';
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
}

/** Registro das artes de chefão: cada BossDef aponta para uma delas. */
export function BossArt({ art, ...rest }: Props) {
  switch (art) {
    case 'golem':
      return <GolemArt {...rest} />;
    case 'mercador':
      return <MercadorArt {...rest} />;
    case 'quimera':
      return <QuimeraArt {...rest} />;
  }
}
