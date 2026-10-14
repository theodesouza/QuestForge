# QuestForge — RPG de matemática para o ENEM

Você é um **Cartógrafo** num mundo cujo mapa foi apagado pela Névoa do Esquecimento.
Cada questão de matemática resolvida redesenha um pedaço do Atlas, forja o seu astrolábio
e enfraquece os guardiões das regiões. Estudar é evoluir — e o app separa com honestidade
**esforço** (XP), **território** (campanha) e **aprendizado real** (domínio e revisão espaçada).

| Acampamento | Questão | Erro vira Eco | Subida de nível | Chefão |
| --- | --- | --- | --- | --- |
| ![](docs/screenshots/acampamento.jpg) | ![](docs/screenshots/questao-acerto.jpg) | ![](docs/screenshots/questao-eco.jpg) | ![](docs/screenshots/subida-de-nivel.jpg) | ![](docs/screenshots/chefao-batalha.jpg) |

| Onboarding | Atlas | Golem Proporcional | Vitória | Herói |
| --- | --- | --- | --- | --- |
| ![](docs/screenshots/onboarding.jpg) | ![](docs/screenshots/atlas.jpg) | ![](docs/screenshots/chefao-intro.jpg) | ![](docs/screenshots/chefao-vitoria.jpg) | ![](docs/screenshots/heroi.jpg) |

> Capturas da pré-visualização web, geradas pelo teste ponta a ponta (`scripts/e2e-web.js`).

## Documentos do projeto

- [`PROJECT_PLAN.md`](PROJECT_PLAN.md) — visão, mecânicas, economia, direção de arte e roteiro.
- [`ARCHITECTURE.md`](ARCHITECTURE.md) — stack, camadas, banco local, conteúdo e qualidade.
- [`TASKS.md`](TASKS.md) — o que está **implementado e testado** e o que está pendente.

## Rodar no Android

Requisitos: Node.js 20+ (testado com 22) e npm.

```bash
npm install
```

**Opção 1 — Expo Go (mais rápida).** Instale o Expo Go compatível com o SDK 57 no celular e rode:

```bash
npx expo start
```

Escaneie o QR code com o Expo Go. Todas as bibliotecas nativas usadas (SQLite, Reanimated,
SVG, Haptics) fazem parte do Expo Go.

**Opção 2 — build local** (precisa do Android Studio/SDK e de um emulador ou aparelho com depuração USB):

```bash
npx expo run:android
```

**Opção 3 — APK instalável pela nuvem (EAS)**, sem Android Studio:

```bash
npx eas-cli@latest build -p android --profile preview
```

Ao final, o EAS fornece um link para baixar o `.apk`. O perfil `preview` assina com a
mesma chave do APK já instalado (`credentials/`), então ele instala **por cima** e o
progresso continua lá. Nunca distribua um APK assinado com outra chave: o Android
recusaria a atualização e a única saída seria desinstalar — apagando o progresso.

## Atualizações pela internet (sem APK novo)

O APK instalado procura versões novas ao abrir (e ao voltar para o app). Para publicar
uma mudança de código (telas, regras, questões):

```bash
npx eas-cli@latest update --channel preview --message "o que mudou"
```

Na próxima abertura o app baixa a versão; o Acampamento mostra **Atualizar agora**
(ou ela entra sozinha na abertura seguinte). O progresso fica no SQLite do aparelho e
não é tocado — a versão nova só roda as migrações pendentes.

Mudou algo **nativo** (nova biblioteca com código nativo, permissões, ícone, `app.json`
de plataforma)? Aí é preciso um APK novo: suba `version` e `android.versionCode` no
`app.json` e gere o APK com a mesma chave. A `runtimeVersion` segue a `version`, então
um APK antigo nunca recebe código que dependa de nativo que ele não tem.

## Verificações

```bash
npm test                 # 109 testes: domínio, conteúdo, persistência SQLite real e atualização a partir da v0.1.0
npm run typecheck        # TypeScript estrito
npm run lint             # ESLint (config Expo + regras de hooks do React)
npm run validate:content # só o validador do banco de questões
npx expo export --platform android   # garante que o bundle nativo compila
```

Teste ponta a ponta no navegador (opcional, requer Playwright):

```bash
EXPO_PUBLIC_QA=1 npx expo export --platform web --output-dir dist-web
python3 -m http.server 8090 --directory dist-web &
node scripts/e2e-web.js e2e-shots http://localhost:8090/
```

## Estrutura

```
src/
  app/       telas (Expo Router)          domain/   regras puras: XP, níveis, revisão, batalha
  features/  composição de telas          content/  questões, assuntos, regiões, chefões, itens
  ui/        design system                data/     SQLite: migrações e repositório atômico
  state/     store + ações (domínio → persistência → tela)
```

Privacidade: sem conta, sem anúncios e sem telemetria. Todo o progresso fica no aparelho.
