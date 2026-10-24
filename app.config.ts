import { existsSync } from 'fs';
import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Configuração dinâmica sobre o app.json. Só acrescenta o que depende do ambiente:
 * o `google-services.json` do projeto Firebase (identificadores públicos, não segredos), que o
 * plugin do login Google exige para gerar o app Android. Em builds da EAS ele chega pela variável
 * de arquivo `GOOGLE_SERVICES_JSON`; em builds locais, vale `./google-services.json` (fora do git).
 * Passo a passo em docs/CLOUD_SETUP.md.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const googleServicesFile = process.env.GOOGLE_SERVICES_JSON ?? './google-services.json';
  // Em build na nuvem, falhar cedo e alto: um APK sem o arquivo nasceria sem login funcional.
  if (process.env.EAS_BUILD === 'true' && !existsSync(googleServicesFile)) {
    throw new Error(
      'google-services.json não encontrado. Crie a variável de arquivo GOOGLE_SERVICES_JSON na EAS (veja docs/CLOUD_SETUP.md, passo 5).',
    );
  }
  return {
    ...config,
    name: config.name ?? 'QuestForge',
    slug: config.slug ?? 'questforge',
    android: { ...config.android, googleServicesFile },
  };
};
