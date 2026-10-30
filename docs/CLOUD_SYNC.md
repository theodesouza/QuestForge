# Contas Google e progresso na nuvem — arquitetura

Este documento registra o diagnóstico do projeto, as decisões e o funcionamento da sincronização.
Guias práticos: [CLOUD_SETUP.md](CLOUD_SETUP.md) (configurar o Firebase), [LEGACY_MIGRATION.md](LEGACY_MIGRATION.md)
(preservar o progresso anterior às contas) e [PRIVACY.md](PRIVACY.md) (privacidade, LGPD, Google Play).

## 1. Diagnóstico: o que existia

**Stack:** Expo SDK 57, React Native 0.86, TypeScript estrito, Expo Router, Zustand, `expo-sqlite`, Reanimated.
Sem backend, sem conta, sem telemetria. Atualizações de JS por EAS Update (`runtimeVersion` = versão do app).

**Onde os dados viviam — verificado por busca em todo `src/` (não presumido):** um único lugar,
o SQLite `questforge.db` (esquema v3). Não havia AsyncStorage, SecureStore, arquivos nem `localStorage`.
Na web (só pré-visualização) o repositório era em memória.

| Tabela | Conteúdo | Vai para a nuvem? |
| --- | --- | --- |
| `profile` | nome, objetivo, meta diária, XP, Tinta, descanso, itens equipados, metas adaptativas por assunto, totais, ajustes | sim (sem o fuso do aparelho) |
| `question_state` | repetição espaçada, contadores, Ecos, favoritas e dúvidas por questão | sim |
| `reward_ledger` | recompensas únicas já concedidas (`level:N`, `mission:…`, `boss:…`, `quest:…`, `shop:…`) | sim |
| `inventory` | itens possuídos (núcleos, auras, molduras, títulos) | sim |
| `campaign_progress` | missões: conclusão, melhor pontuação/estrelas, tentativas | sim |
| `boss_progress` | chefões: tentativas, vitórias, recordes | sim |
| `quest_board` | encomendas do dia/semana | sim |
| `attempts` | log imutável de respostas | sim, **à parte** (lotes) |
| `active_run` | sessão/batalha em andamento (presa às sementes daquele aparelho) | **não** |

Não sincronizam: sessão e batalha em andamento, fuso do aparelho (`tzOffsetMin`) e o banco de questões
(conteúdo global, já embutido no app).

**Fatos que condicionaram o desenho**

- **XP e Tinta são contadores acumulados que não dá para reconstruir.** O log de tentativas não registra
  bônus de sessão, missão, chefão nem encomendas. Logo, o estado precisa ser sincronizado e a fusão entre
  aparelhos precisa somar incrementos — "o último que gravou vence" perderia progresso.
- **Idempotência já existia** (`reward_ledger`, `INSERT OR IGNORE`, IDs de tentativa únicos). A nuvem a herda.
- **A chave de assinatura atual é a de depuração do React Native.** A Play Store exige outra chave, e trocar
  a chave obriga a desinstalar — o que apagaria o progresso local. É o motivo concreto desta mudança.
- `recentAttempts` não é usado por nenhuma tela: todo o estado derivado já está nas outras tabelas.

### Riscos de perda e como cada um é tratado

| Risco | Tratamento |
| --- | --- |
| Perfil novo e vazio sobrescrever o progresso (local ou da nuvem) | Login obrigatório antes de jogar; um aparelho novo só abre o jogo **depois** de consultar a nuvem (tela "restaurando"); regras do servidor só aceitam `rev = anterior + 1`; trava de regressão no cliente |
| Dois aparelhos divergirem | Merge de 3 vias (seção 5), nunca "o último vence" |
| Resposta de rede perdida ⇒ reenvio contar o mesmo XP duas vezes | `nonce` + linhagem (seção 5) |
| Recompensa única paga nos dois aparelhos | Estorno da segunda (seção 5) |
| Restaurar um banco antigo do Backup Automático do Android sobre dados já sincronizados | `allowBackup: false`: reinstalar = começar limpo da nuvem, um único caminho testado |
| Dados de uma versão nova lidos por um app antigo | `schema` versionado; app antigo recusa sincronizar (nunca regrava campos que não conhece); regras impedem `schema` de regredir |
| Migração destruir o progresso atual | Seção 8 e [LEGACY_MIGRATION.md](LEGACY_MIGRATION.md) |

## 2. Decisões de arquitetura

| Decisão | Por quê |
| --- | --- |
| **Firebase Auth (Google) + Cloud Firestore** | Autorização no servidor por regras de segurança, sem backend próprio para manter; plano gratuito cobre o início; SDK maduro |
| **Login pelo Credential Manager** (`react-native-nitro-google-signin`, MIT) | É o fluxo atual do Android. A biblioteca gratuita original (`@react-native-google-signin`) usa o SDK legado, descontinuado; a variante com Credential Manager é paga |
| **SDK JS do Firebase** (não `@react-native-firebase`) | Menos código nativo; bastam Auth e Firestore; a sessão é guardada por nós no cofre do sistema |
| **Sessão em `expo-secure-store`** (Android Keystore) | "Persistência segura da sessão": nada de token em texto puro (AsyncStorage) |
| **Um documento-snapshot por conta** (não um documento por entidade) | 1 gravação por sincronização e 1 leitura por restauração (cotas pequenas); consistência atômica; a string opaca evita a explosão de índices do Firestore |
| **Concorrência otimista (`rev`) imposta pelo servidor** | Impossível sobrescrever uma versão que o aparelho não viu, mesmo com um cliente com defeito |
| **SQLite por conta** (`questforge-<uid>.db`) | Trocar de conta/sair nunca apaga nada; isolamento natural; o `questforge.db` antigo fica intocado como backup |
| **Login obrigatório na 1ª abertura** | Evita o caso perigoso "progresso anônimo × conta nova" para todos os futuros usuários |
| **Alternativas descartadas** | Supabase (projetos gratuitos pausam por inatividade — ruim para confiabilidade); backend próprio (custo operacional); Firestore com persistência offline própria (não é durável em RN e esconderia o controle de pendências) |

Plataformas: **Android** completo. **Web** é só pré-visualização (progresso em memória, sem login real, sem nuvem).
**iOS** não é alvo desta versão (sem build, sem cliente OAuth iOS).

## 3. Modelo de dados na nuvem

```
users/{uid}/save/state          documento-snapshot versionado
users/{uid}/attempts/{chunkId}  lotes do log de tentativas (append-only, idempotentes)
```

Campos de `save/state`: `schema`, `rev`, `epoch`, `nonce`, `ancestry[≤32]`, `deviceId`, `updatedAt`, `appVersion`,
`data` (string canônica do progresso), `hash`, `stats` (resumo legível) e, só na migração única, `legacyImport`.

`data` usa tuplas compactas (~110 bytes por questão); o banco inteiro de 314 questões cabe em ~35 KB e há folga
para milhares (teto de 900 000 caracteres, validado nas regras; o limite do Firestore é 1 MiB).
Chaves antigas no registro de recompensas (encomendas diárias) crescem devagar (~4/dia de uso); se algum dia
isso se aproximar do teto, o `schema` permite dividir o documento.

**Schema 2 (Academia).** O `data` ganhou o campo `aca`: o progresso de cada etapa (`aula/etapa`), também em tuplas
compactas. O desafio em andamento não viaja (como a batalha). No merge de 3 vias, cada etapa combina os dois
lados sem perder nada: datas de "vista", "estudada" e "dominada" ficam com a mais antiga; verificações e
exercícios vistos se unem; contadores de prática e desafio somam o que cada lado acrescentou desde a base;
o melhor desempenho fica com o maior; a agenda de revisão segue o lado da atividade mais recente. As
recompensas `academy:*` do registro seguem a mesma regra das demais (cada marco paga uma vez). Um app que só
entende o schema 1 recusa sincronizar um documento de schema 2 — nunca apaga o que não conhece.

`attempts/{deviceId}-{posição}`: o id é determinístico — regravar o mesmo lote é idempotente. Vão em lotes de
40 ou quando a tentativa mais antiga passa de 24 h (o estado derivado já viaja no snapshot a cada ciclo).

## 4. Persistência local

SQLite por conta, esquema **v5** (v4: `sync_kv`; v5: tabelas da Academia — migrações só acrescentam). `sync_kv` guarda, na **mesma transação**
que o estado:

- `meta` — `uid`, `deviceId`, `baseRev`, `epoch`, `attemptsCursor`, aviso pendente;
- `base` — o último estado que este aparelho sabe estar na nuvem (a BASE do merge);
- `pending` — envios cuja chegada ainda é incerta (`nonce` + o que foi enviado);
- `discarded` — cópia do que um reinício vindo de outro aparelho descartou (rede de segurança).

"Há alterações a enviar" = estado local ≠ base. Não existe um sinalizador de sujeira que possa divergir da realidade.
Mudanças só em `lastActiveAt`/descanso (que ocorrem a cada abertura do app) não contam.

## 5. Protocolo de sincronização

O jogo nunca espera a rede: cada resposta grava no SQLite (como sempre) e só **agenda** uma sincronização em lote:
90 s depois da última alteração (uma sessão inteira costuma virar um único envio), no máximo 5 min sob uso
contínuo; **imediatamente** nos marcos (fim de sessão/missão, fim de chefão, onboarding) e ao ir para o segundo
plano; um pull ao voltar ao primeiro plano, no máximo a cada 5 min.

Um ciclo (`src/sync/engine.ts`), com o estado local lido e aplicado dentro da mesma fila das respostas:

1. Lê o estado local `L`, a base `B` e os envios pendentes. Sem nada a enviar: uma leitura simples da nuvem
   (`rev` igual à base ⇒ nada a fazer).
2. Registra o envio como **pendente** (com um `nonce`) *antes* de falar com a rede.
3. Transação no Firestore: lê `R`; decide a partir de `(B, L, R)`; grava `rev + 1` só se `R` não mudou.
4. Aplica o resultado no SQLite (estado + nova base + metadados numa só transação). O que o jogador fez
   *durante* o ciclo é somado, não perdido.

**Detecção de versão e conflito.** Versão = `rev` (só avança de 1 em 1, imposto pelas regras). Conflito = a nuvem
avançou desde a base **e** o aparelho também mudou. O caso comum (um aparelho) nunca chega ao merge.

**Merge de 3 vias** (`src/sync/merge.ts`, puro e simétrico):

| Dado | Regra |
| --- | --- |
| XP, Tinta, totais, acertos, tentativas | `base + Δlocal + Δnuvem` — cada lado contribui só o que acrescentou |
| Registro de recompensas, inventário | união |
| Recordes (melhor pontuação, estrelas, menor nº de turnos, 1ª conclusão) | o melhor dos dois |
| Nome, equipamento, ajustes, metas por assunto | só um lado mudou ⇒ vale a mudança; os dois ⇒ vale o aparelho usado por último |
| Estado de revisão de cada questão | contadores somam; o agendamento vem do lado que respondeu por último |
| Encomendas | contadores somam; "dias de estudo" conta dias **distintos**; dia diferente ⇒ vale o mais novo |
| **Recompensa única paga nos dois lados** (mesma chave no registro desde a base) | a segunda é **estornada** (XP/Tinta). Toda chave que o jogo grava tem regra (teste dedicado) |
| Encomenda que só fecha somando os dois lados | liquidada uma vez |
| Tinta negativa (duas compras com o mesmo saldo) | zera, sem perder nenhum dos itens |

**Idempotência de envios.** Se a resposta se perde (a gravação chegou, o aparelho não soube), o próximo ciclo
reconhece o envio pelo `nonce`/`ancestry` e usa o estado enviado como base — nada é somado duas vezes. Uma
transação abandonada por prazo é marcada como cancelada e não pode gravar depois.

**Reiniciar o progresso** incrementa `epoch`; a maior geração vence sem fusão e as regras impedem regressão de
`epoch`. O outro aparelho adota o reinício e guarda uma cópia do que descartou.

**Travas de integridade:** estado local vazio nunca sobrescreve a nuvem; um envio que faria o progresso regredir
é barrado (`integrity`); documento da nuvem com hash que não confere, schema mais novo ou ausente
(que já existiu) **nunca** é "consertado" por cima — o motor pausa e avisa.

## 6. Segurança e privacidade

- **Autorização no servidor** (`firestore.rules`): só o dono (`request.auth.uid == uid`) **e** autenticado pelo
  Google lê/grava `users/{uid}/…`; tudo o mais é negado (inclusive o documento `users/{uid}`). Formato, tamanhos,
  `rev`, `epoch` e `schema` validados. Testado contra os emuladores reais (`npm run test:rules`).
- **Segredos:** nenhum no app. Os identificadores do Firebase são públicos por natureza (variáveis `EXPO_PUBLIC_*`,
  `google-services.json` fora do git). O token do Google vira credencial do Firebase e não é guardado.
- **Coleta mínima:** nome e e-mail vêm da conta Google só para exibir "Conta e nuvem" no aparelho (não vão para o
  Firestore); na nuvem ficam o `uid` e o progresso. Sem anúncios, sem analytics.
- **LGPD:** acesso/portabilidade (Ajustes → *Exportar meus dados*), exclusão (Ajustes → *Excluir conta e dados*:
  apaga nuvem, conta de login e banco local, após reconfirmar com o Google) e reinício do progresso.
- **Limite honesto:** o progresso é "autoritativo no cliente" — um usuário pode adulterar o **próprio** progresso.
  Isso não afeta outros usuários. Se um dia houver ranking, ele exigirá validação no servidor.
- **Abuso de cota:** um usuário autenticado malicioso poderia gerar gravações em excesso. Mitigações recomendadas
  antes de crescer: Firebase App Check (Play Integrity) e alertas de orçamento (ver CLOUD_SETUP.md).

## 7. Custos e cotas

Cotas gratuitas do Cloud Firestore (documentação oficial, conferida em 20/10/2026): **1 GiB** armazenado,
**50 000 leituras/dia**, **20 000 gravações/dia**, **20 000 exclusões/dia**, **10 GiB/mês** de saída. Documento
máximo: 1 MiB. Firebase Authentication: sem custo até 50 000 usuários ativos/mês (Identity Platform, usuários
padrão). Plano Spark não exige cartão. A página de preços não diz o que acontece ao estourar a cota no Spark —
confira no console e **não presuma gratuidade permanente**.

Estimativa por usuário ativo (uso típico, sincronização em lote): ~2–4 gravações de snapshot por sessão de estudo
(o envio de fim de sessão + no máximo um por 5 min de uso contínuo) + 1 gravação de tentativas por ~40 respostas
+ 1 gravação quando o quadro de encomendas vira o dia; 1–2 leituras por abertura do app. Um dia com 2 sessões
≈ 8–10 gravações ⇒ o teto de 20 000 gravações/dia comporta algo como **~2 000 usuários ativos por dia** (conta de
ordem de grandeza, não uma promessa). Leituras (50 000/dia) não são o gargalo. Uma restauração lê 1 documento + os lotes de tentativas (≈1 por 40 respostas).
Excedendo isso, é preciso habilitar o faturamento (plano Blaze) — o custo por gravação extra é pequeno, mas defina
alertas de orçamento. Reduzir gravações é simples: aumentar `debounceMs`/`maxWaitMs` em `SyncEngine`.

## 8. Garantias — e o que NÃO é garantido

**Garantido (e testado):** progresso sincronizado sobrevive a desinstalação, limpeza de dados e troca de
aparelho; entrar na mesma conta restaura tudo; offline funciona e nada se perde por falta de internet; reenvios
não duplicam; dois aparelhos convergem sem perder nem duplicar; contas são isoladas.

**Não garantido:** o que **nunca chegou ao servidor**. Estudo feito offline e seguido de desinstalação antes de
reconectar não pode ser recuperado. A tela *Conta e nuvem* mostra "Alterações a enviar" para isso ficar visível.
Do log bruto de respostas, até ~40 recentes (ou 24 h de atividade) podem ainda estar só no aparelho; o estado
derivado (XP, missões, revisões) vai a cada sincronização.

## 9. Testes (mapa para o pedido original)

| Cenário | Onde |
| --- | --- |
| Primeira autenticação, reabertura com sessão, troca de conta, saída, exclusão | `src/state/__tests__/session.test.ts` |
| Criação de perfil, salvamento, reinstalação simulada, offline, envio duplicado, resposta perdida, prazo estourado, conflito, isolamento, travas | `src/sync/__tests__/engine.test.ts` |
| Merge: neutro, idempotente, simétrico, soma sem duplicar, recompensas únicas, compras, encomendas, regressão | `src/sync/__tests__/merge.test.ts` |
| Atualização do app sem perda (esquema v1/v2/v3 → v4) | `src/data/__tests__/upgrade.test.ts`, `persistence.test.ts` |
| Migração única do legado | `src/legacy/__tests__/migration.test.ts` |
| Regras de segurança e motor sobre o Firestore real | `src/data/cloud/__emulator__/` (`npm run test:rules`) |
| Sessão segura, erros de login/Firestore | `src/auth/__tests__/`, `src/data/cloud/__tests__/` |

**Não testado em aparelho real (depende de você):** o login Google de verdade (Credential Manager) e o
Firebase com o seu projeto — veja a lista de verificação em CLOUD_SETUP.md.
