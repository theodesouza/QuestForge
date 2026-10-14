import type { BossArt as BossArtId } from '../../content/bosses';
import { GolemArt } from './GolemArt';
import { MercadorArt } from './MercadorArt';

interface Props {
  art: BossArtId;
  size?: number;
  cracked?: boolean;
  defeated?: boolean;
}

/** Registro das artes de chefão: cada BossDef aponta para uma delas. */
export function BossArt({ art, ...rest }: Props) {
  switch (art) {
    case 'golem':
      return <GolemArt {...rest} />;
    case 'mercador':
      return <MercadorArt {...rest} />;
  }
}
