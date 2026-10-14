# Chave de assinatura Android

`android-debug.keystore` é a chave de depuração **pública** do React Native
(alias `androiddebugkey`, senha `android`). O APK v0.1.0 instalado nos aparelhos foi
assinado com ela:

```
SHA-256: FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C
```

O Android só instala uma versão nova **por cima** (preservando o banco SQLite com o
progresso) se a assinatura for a mesma. Por isso:

- builds locais (`./gradlew assembleRelease`) usam esta chave — é o padrão do template;
- builds na nuvem (`eas build --profile preview`) também, via `credentials.json` +
  `"credentialsSource": "local"` no `eas.json`.

Nunca gere um APK de teste com outra chave: o Android recusaria a atualização e a
única saída seria desinstalar — apagando o progresso.

Esta chave serve só para distribuição interna. Uma publicação na Play Store exige uma
chave própria e secreta (o perfil `production` usa as credenciais gerenciadas pela EAS).
