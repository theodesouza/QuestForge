# Configurar o Firebase e o login Google

Passo a passo do que **só você** pode fazer (conta Google, projeto Firebase, builds). Nada aqui é segredo de
verdade: os identificadores do Firebase são públicos por natureza e a segurança vem de `firestore.rules`.
Mesmo assim, os valores ficam fora do git (`.env`, `google-services.json`).

> Não invente valores nem copie de outro projeto. Cada passo diz de onde vem o valor.

## 1. Criar o projeto

1. [console.firebase.google.com](https://console.firebase.google.com) → **Adicionar projeto** (ex.: `questforge`).
   Desative o Google Analytics (o app não usa e isso mantém a coleta mínima).
2. Plano **Spark** (gratuito, sem cartão) é suficiente para começar. Veja custos em [CLOUD_SYNC.md](CLOUD_SYNC.md#7-custos-e-cotas).

## 2. Authentication → Google

1. **Build → Authentication → Começar → Método de login → Google → Ativar**.
2. Escolha o e-mail de suporte do projeto e salve.
3. Ainda em *Google* → **Configuração do SDK da Web** → copie o **ID do cliente da Web**
   (termina em `.apps.googleusercontent.com`). Ele vira `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.
4. **Authentication → Configurações → Ações do usuário**: deixe *Excluir conta* permitido.

## 3. Registrar o app Android (cria o cliente OAuth do Android)

1. **Configurações do projeto → Seus apps → Adicionar app → Android**.
2. Nome do pacote: **`com.questforge.app`** (o do `app.json`).
3. **Certificado de assinatura SHA-1** — o da chave que assina os APKs de teste atuais
   (`credentials/android-debug.keystore`, a chave de depuração pública do React Native):

   ```
   SHA-1:   5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
   SHA-256: FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C
   ```

   (Para conferir: `keytool -list -v -keystore credentials/android-debug.keystore -storepass android`.)
   Se o pacote/SHA-1 estiver errado, o login falha com `DEVELOPER_ERROR`.
4. Baixe o **`google-services.json`** e coloque na **raiz do projeto**. Ele está no `.gitignore`.
5. Para a EAS (builds na nuvem), cadastre o arquivo como variável de ambiente do tipo **arquivo** chamada
   `GOOGLE_SERVICES_JSON`, nos ambientes `preview` e `production`, pelo painel da EAS (*Project → Environment
   variables*). O `app.config.ts` usa `process.env.GOOGLE_SERVICES_JSON` e, na EAS, **falha o build** se ele faltar
   (para nunca sair um APK sem login funcional).

## 4. Config do SDK (valores `EXPO_PUBLIC_*`)

1. **Configurações do projeto → Seus apps → Adicionar app → Web** (apelido qualquer). Copie `apiKey`,
   `authDomain`, `projectId`, `appId` (e, se quiser, `storageBucket`, `messagingSenderId`).
2. Local: copie `.env.example` para `.env` e preencha.
3. EAS: cadastre os mesmos nomes (texto simples) nos ambientes `preview` e `production`:

   ```bash
   npx eas-cli@latest env:set --name EXPO_PUBLIC_FIREBASE_API_KEY --value "<apiKey>" --environment preview --visibility plaintext
   # …repita para AUTH_DOMAIN, PROJECT_ID, APP_ID e EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID; e de novo com --environment production
   ```

## 5. Firestore e regras de segurança

1. **Build → Firestore Database → Criar banco de dados**, modo **produção**. Escolha o local com cuidado
   (não muda depois): `southamerica-east1` (São Paulo) aproxima dos usuários.
2. Publique as regras e os índices deste repositório:

   ```bash
   echo '{"projects":{"default":"<ID-DO-PROJETO>"}}' > .firebaserc   # fora do git
   npx --yes firebase-tools@15.34.0 deploy --only firestore:rules,firestore:indexes
   ```

3. Confira no console (*Firestore → Regras*) que o texto é o de `firestore.rules`.
4. **Antes de publicar**, rode as regras contra os emuladores (exige Java 21+):

   ```bash
   npm run test:rules
   ```

## 6. Build para testar no celular

O perfil `preview` mantém a assinatura atual (`credentials.json`), então o APK **instala por cima** do atual
preservando o banco local. A versão agora é **0.3.0 / versionCode 5**: o JS novo exige módulos nativos novos, e
`runtimeVersion = appVersion` impede que um APK 0.2.0 receba esse código por atualização pela internet.

```bash
npx eas-cli@latest build --platform android --profile preview
```

Para o procedimento **único** de preservar o progresso atual, use o perfil `legacy-migration` — veja
[LEGACY_MIGRATION.md](LEGACY_MIGRATION.md). **Não** use `preview` para isso.

## 7. Lista de verificação no aparelho (não dá para fazer sem o seu projeto)

- [ ] Login: "Entrar com o Google" abre o seletor de contas e entra. (Se falhar com `DEVELOPER_ERROR`: pacote,
      SHA-1 ou ID do cliente da Web errados. Se o Firebase recusar o token, veja a nota abaixo.)
- [ ] Fechar e reabrir o app (inclusive em modo avião): abre direto, sem pedir login.
- [ ] Estudar, aguardar o fim da sessão e conferir em *Firestore → users/{uid}/save/state* que o documento existe
      (`rev` crescendo, `stats` coerentes).
- [ ] **Reinstalação**: com o progresso já sincronizado (e o backup da migração guardado!), desinstalar, instalar,
      entrar com a mesma conta → "Buscando seu progresso…" → tudo volta.
- [ ] Segundo aparelho (ou emulador) com a mesma conta: restaura; estudar nos dois offline e reconectar → aviso
      "Combinamos o progresso de dois aparelhos".
- [ ] Ajustes → *Exportar meus dados* gera o JSON; *Excluir conta e dados* apaga nuvem e conta.

> **Nota (nonce):** a biblioteca de login gera um *nonce* próprio no token do Google e não expõe o valor bruto.
> O Firebase Auth normalmente aceita o token mesmo assim (o nonce só é conferido quando fornecido). Se o primeiro
> login real falhar com `auth/invalid-credential`, é este o ponto a investigar — avise antes de mexer no fluxo.

## 8. Antes de publicar na Google Play

1. **Chave de assinatura própria (Play App Signing).** Hoje o app é assinado com a chave de depuração; a Play
   exige outra. Trocar a chave **obriga a desinstalar** o app atual — por isso a migração única precisa estar
   concluída e conferida (e o JSON de backup guardado fora do celular) *antes*.
2. No **Play Console → Teste e lançamento → Integridade do app**, copie os SHA-1/SHA-256 do **certificado de
   assinatura do app** (e da chave de upload) e adicione **todos** no Firebase (*Configurações → Seu app Android →
   Impressões digitais do certificado*). Sem isso o login falha nas builds distribuídas pela Play.
3. Build de produção: `npx eas-cli@latest build --platform android --profile production`. Antes dele, rode
   **`npm run verify:no-legacy`** — confirma que a ferramenta de migração não está no bundle.
4. **Data safety (Play Console):** coleta *Informações pessoais → ID de usuário*, e e-mail/nome só se você os
   enviar (o app não envia); dados criptografados em trânsito; usuário pode pedir exclusão. Rascunhos em
   [PRIVACY.md](PRIVACY.md).
5. **Exclusão de conta:** a Play exige um caminho **dentro do app** (existe: Ajustes → Excluir conta e dados) **e**
   uma URL pública para pedir exclusão sem abrir o app — você precisa publicar essa página.
6. **Antes de crescer:** ative o **App Check** (Play Integrity) para Firestore/Auth e crie **alertas de orçamento**.

## 9. Problemas comuns

| Sintoma | Causa provável |
| --- | --- |
| `DEVELOPER_ERROR` ao entrar | pacote ≠ `com.questforge.app`, SHA-1 não cadastrado ou ID do cliente da Web de outro projeto |
| Tela de login mostra "faltam variáveis do Firebase" | `.env` incompleto (só em desenvolvimento) |
| Build da EAS falha com "google-services.json não encontrado" | variável de arquivo `GOOGLE_SERVICES_JSON` não criada |
| Sincronização "pausada" com `permission` | regras não publicadas, ou projeto/conta errados |
| `needs-update` | a conta tem dados de um app mais novo: atualize |
| Mudou `EXPO_PUBLIC_*` e o app não refletiu | o cache do Metro não considera essas variáveis: `npx expo start --clear` / `export --clear` |
