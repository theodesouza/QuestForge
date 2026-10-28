# QuestForge — Tarefas

Legenda: `[x]` implementado **e** testado/verificado · `[~]` parcial · `[ ]` pendente.
Este arquivo registra o estado real — nada é marcado como feito só por parecer pronto.

Como verificar: `npm test`, `npm run typecheck`, `npm run lint`, `npm run test:rules` (emuladores Firebase),
`npm run verify:no-legacy`, `npx expo export --platform android` e o roteiro ponta a ponta `scripts/e2e-web.js`.

## Etapa 1 — Planejamento ✅
- [x] `PROJECT_PLAN.md` (visão, mecânicas, direção de arte, roteiro)
- [x] `ARCHITECTURE.md` (stack, camadas, banco, conteúdo, qualidade, decisões)
- [x] `TASKS.md`

## Etapa 2 — Design system ✅
- [x] Tokens "Cartografia Noturna" (cores, espaçamento, raios, movimento) — `src/ui/theme.ts`
- [x] Tipografia Bricolage Grotesque + Inter, componente `Text`
- [x] 26 ícones SVG próprios — `src/ui/Icon.tsx`
- [x] Botão, chip, barra de progresso com régua, painel com cantoneiras, fundo cartográfico, pílulas, losangos de dificuldade, barra de abas flutuante
- [x] Astrolábio vetorial evolutivo (estrela ganha pontas por patente, anel ganha gravações por nível, moldura/núcleo/aura equipáveis)
- [x] "Reduzir movimento" (sistema/sempre/nunca) e feedback tátil desativável

## Etapa 3 — MVP jogável ✅
Domínio (testado em `src/domain/__tests__`):
- [x] Curva de XP e níveis 1–50 (58.000 XP no total), 11 patentes, recompensas em todos os níveis
- [x] Regras de XP: dificuldade, dicas (−25%), chute (50%), redenção de Eco (150%), revisão (60%), repetição (10%), anti-farm de 20 h
- [x] Descanso do Viajante (bônus de retorno, sem punição por ausência)
- [x] Repetição espaçada (Leitner 1→3→7→16→35 dias) e Ecos
- [x] Seleção adaptativa (Ecos devidos → subassuntos fracos/novos → dificuldade-alvo por assunto) e anti-repetição de subassunto
- [x] Andaime: 2 erros seguidos no mesmo subassunto inserem questão mais acessível + aviso de conceito
- [x] Domínio por subassunto (bayesiano, amostra mínima, evidência espaçada para "Dominado")
- [x] Recomendação "o que estudar agora" e Caça aos Ecos
- [x] Motor de batalha determinístico (couraça, combo, técnica, Determinação, retirada com Conhecimento do Inimigo)
- [x] Campanha da Região 1 (3 missões → chefão), desbloqueio em ordem, recompensas de 1ª conclusão idempotentes

Conteúdo (validado em `src/content/validation`):
- [x] **91 questões autorais** em 13 assuntos, 4 dificuldades, habilidades H1–H30, resolução passo a passo, conceito, 2 dicas graduais
- [x] **90 de 91** com `verify()` que recalcula a resposta a partir do enunciado; o validador exige que bata com o gabarito e com nenhuma outra alternativa
- [x] Gabaritos distribuídos entre A–E; nenhuma questão apresentada como oficial
- [x] Tabelas, gráficos de barras e 5 figuras vetoriais nos enunciados

Persistência (testada com SQLite real via `node:sqlite`):
- [x] Migrações versionadas e transacionais
- [x] Commit atômico por operação (falha ⇒ nada muda), tentativas e recompensas idempotentes
- [x] Sessão e batalha em andamento sobrevivem ao fechamento do app ("Retomar")
- [x] Fila serializada (toque duplo não duplica resposta)

Interface (verificada no roteiro ponta a ponta web, sem erros de console):
- [x] Onboarding em 4 passos opcionais → primeira expedição de 3 questões
- [x] Acampamento: astrolábio, nível, XP restante, próxima recompensa, próxima missão em 1 toque, expedições de 3/5/10/15/25 min, Ecos, treino sugerido, retomar sessão
- [x] Tela de questão: leitura confortável, seleção + confirmação, dicas graduais, "chute", pular (volta 1× ao fim), favoritar, marcar dúvida, feedback imediato, resolução passo a passo, conceito-chave, rolagem automática até o feedback
- [x] Resumo da sessão com "próximo passo"
- [x] Subida de nível com recompensas (pulável com um toque) e primeira recompensa equipada automaticamente
- [x] Batalha contra o Golem Proporcional: introdução, HUD fixo (vida, couraça, combo, Determinação, dano), narração, resultado com espólios
- [x] Atlas da Região 1 com caminho em zigue-zague
- [x] Herói: estatísticas honestas (precisão só após 10 respostas), equipamento, coleção com "como conseguir", estrada de recompensas
- [x] Ajustes: nome, meta diária, tátil, animações, apagar progresso; transparência sobre conteúdo e TRI

Aparelho real:
- [x] APK release (arm64, Android 7+) gerado com Gradle e instalado/testado pelo usuário num Android físico, sem problemas relatados

## Etapa 4 — Expansão do RPG (parcial)
- [x] **Região 2 — Mercado de Âmbar** (matemática financeira): 3 missões + chefão, abre após vencer o Golem
- [x] **Mercador Composto**: cofre de juros (erros devolvem vida, crescendo com erros seguidos, até o cofre quebrar abaixo de 50%), arte vetorial própria, espólios e título
- [x] Chefões descritos como dados (`BossTrait`: couraça ou juros) — a tela de batalha serve qualquer chefão (`/boss?id=…`)
- [x] **25 questões autorais de financeira** (juros simples/compostos, compras a prazo, custo-benefício), cada uma resolvida às cegas por dois revisores independentes antes de entrar
- [x] **Encomendas diárias e semanais**: 3 por quadro, recompensa automática (sem "resgatar"), Baú ao cumprir as 3, quadro troca sem penalidade
  - metas proporcionais ao tempo diário; semanal criada no meio da semana é proporcional aos dias que restam
  - uma diária mira o assunto recomendado (nunca pede mais acertos do que o subassunto tem) com botão "Treinar este assunto"
  - "Derrote N Ecos" só aparece quando há N Ecos voltando para revisão no período
  - dia/semana pelo fuso do aparelho; o quadro só avança no calendário (trocar o fuso não apaga progresso)
- [x] **Chama da Constância**: dias de estudo da semana, sem sequência que zera
- [x] **Oficina**: gastar Tinta em cosméticos comuns/incomuns (compra em dois toques); raros e lendários só por feitos
- [x] Avisos curtos (encomenda cumprida, baú) que esperam o fim da questão/batalha e da celebração, anunciados ao leitor de tela
- [x] **Região 3 — Planícies Numéricas** (frações, MMC/MDC, potências e notação científica): 3 missões + chefão, abre após vencer o Mercador
  - **72 questões autorais novas** (`BAS-101…324`, 6 lotes de 12), pools de 26–27 por missão (≥ 20 extras além das 5 de cada tentativa); novo subassunto `potencias`
  - cada lote foi resolvido às cegas por um revisor independente (e por mim): **0 divergências de gabarito**; as correções vieram de dificuldade superestimada (4 → 3 em 7 questões e 3 → 2 em 2; a rampa da missão de potências passou a [1, 2, 2, 3, 3] para casar com o conteúdo calibrado), um contexto irreal (volta de 24 s numa pista de atletismo virou trilha de caminhada) e um enunciado ambíguo (horta × terreno)
  - o validador agora entende notação científica (`3,2 × 10⁵`, `10⁻³`), potências (`2⁵`), raízes (`√49`), frações mistas (`2 1/2`) e o sinal `−`; a tolerância padrão passou a ser relativa
  - gabaritos do banco equilibrados: 62–64 por letra em 314 questões
- [x] **Quimera Fracionária** (`BossTrait` `heads`): a vida é a soma de três cabeças — Leão 1/2 (frações e contas), Cabra 1/3 (MMC e MDC), Serpente 1/6 (potências e notação) — e cada cabeça faz as perguntas da própria matéria; um erro faz a cabeça de pé se regenerar (6% da vida), mas nunca além do topo dela: cabeça derrubada não volta
  - barra de vida segmentada nas frações exatas (`HeadsBar`), arte vetorial com as cabeças que caem (`QuimeraArt`), fala própria a cada cabeça derrubada, lista das cabeças na introdução
  - recompensas: Moldura dos Três Arcos (raro, anel em arcos de 1/2, 1/3 e 1/6) e título Soma Inteira; sem erros nem dicas: **Núcleo da Trindade** (lendário, roda das frações + três gemas), que também desperta a Forma Mítica com qualquer aura lendária
- [ ] Regiões 4–9 com missões, desafios opcionais e chefões próprios (catálogo no plano)
- [ ] Conquistas e coleções
- [ ] Companheiros
- [ ] Selos de domínio gravados no astrolábio

## Expansão das missões e evolução visual do herói ✅
Missões (testado em `src/domain/__tests__/replay.test.ts` e `src/content/validation/__tests__/bank.test.ts`):
- [x] **126 questões novas** de missão (`src/content/questions/missoes/`, 12 lotes): cada uma das 6 missões tem pool de 31–33 questões — **≥ 20 extras** além das 5 de uma tentativa (o teste do banco exige)
- [x] Cada lote resolvido às cegas (só enunciado e alternativas) e comparado ao gabarito: 0 divergências; o último lote (FIN-311–320) também por um revisor independente
- [x] Auditoria das 116 questões antigas: 34 correções (dados impossíveis, contradições, dificuldade, dicas, nomes "A/B" que viravam ambíguos com alternativas embaralhadas)
- [x] Rejogar traz questões **inéditas primeiro** e não repete enquanto houver inédita compatível; depois, reaproveita Ecos, revisões e erros antes das já dominadas (teste com o pool real: ≥ 5 tentativas totalmente novas por missão)
- [x] Dificuldade coerente: perfil por missão, cada vaga aceita só ±1 nível; mesma quantidade de questões
- [x] Seleção e **alternativas embaralhadas** a cada tentativa, gabarito preservado (letra canônica no domínio; feedback mostra a letra exibida); validador barra referências a letras e alternativas posicionais
- [x] **Pontuação 0–1000 e 1–3 estrelas**, melhor resultado preservado (migração v3), "Novo recorde", botão "Repetir para melhorar a pontuação", estrelas e inéditas restantes no Atlas
- [x] Sem exploração: recompensas de estrela únicas; bônus de sessão só com ≥ 3 respostas valiosas; repetição rende 10% e nada dentro de 20 h; Eco só é redimido quando volta no prazo (errar de propósito e acertar em seguida não rende)
- [x] Revisão adversarial do código (lógica/persistência e efeitos/desempenho/acessibilidade): 4 + 7 achados confirmados, todos corrigidos com testes de regressão

Efeitos visuais (`src/ui/vfx/`, verificado no laboratório `/vfx-lab` e no roteiro ponta a ponta):
- [x] Motor de efeitos na UI thread (camadas SVG estáticas + transform/opacity, partículas com relógio compartilhado)
- [x] 9 núcleos e 8 auras com formas e movimentos próprios (chamas, marés, cortinas boreais, nebulosa, coroa solar, órbitas, runas…)
- [x] Hierarquia Comum → Incomum → Raro → **Épico** (nova raridade) → Lendário, reconhecível só pela aparência; molduras evoluem (pinos que pulsam, anéis armilares)
- [x] **Sinergias** reutilizáveis: Ressonância por elemento (fogo+fogo, tempestade+tempestade, …), Refração do cristal e **Forma Mítica** (lendário + lendário)
- [x] Revelação de item proporcional à raridade (carga, raios, ondas) com "Equipar agora"; prévia "experimentar" no Herói (inclusive itens bloqueados); estouro de energia ao equipar
- [x] "Intensidade dos efeitos" (Alta/Média/Baixa) remove partículas e camadas secundárias; movimento reduzido = um SVG estático; nada pisca acima de 3×/s
- [x] Desempenho: bitmaps do tamanho do desenho (pior caso 13,5 palcos em vez de 26), miniaturas com um SVG cada, astrolábio pausado fora de foco/coberto
- [x] Revelação é um `Modal` (TalkBack e botão Voltar do Android)
- [ ] Medir desempenho num Android intermediário físico (validado na web e por contagem de camadas/bitmaps nos testes)
- [ ] Ativar `ANDROID_SYNCHRONOUSLY_UPDATE_UI_PROPS` do Reanimated (transform/opacity sem commit da árvore) — exige APK novo

## Etapa 5 — Aprendizado adaptativo (pendente)
- [x] Folha de resolução nas 314 questões: raciocínio numerado, operações em destaque, frações numéricas diagramadas e resposta final; abre após erro, disponível no histórico e no reforço guiado. Mais de 60 resoluções com desenvolvimento adicional. Texto nativo para leitura offline e fonte acessível, sem serviço de IA ou nova dependência. 198 testes, lint e tipos passaram; leitura de todo o catálogo em 320 px sem corte lateral e fluxo de revisão/andaime sem alterar progresso verificados na web. Aparelho físico e TalkBack pendentes.
- [~] Painel de evolução: atividade semanal com gráfico por dia, acertos (percentual só após 10 respostas), acertos sem chute, dias de prática, domínio por subassunto e próximo treino; acesso no Acampamento e no Herói. Tempo de estudo e comparação entre semanas continuam pendentes.
- [x] Histórico de erros navegável: 20 tentativas por página, data, assunto, enunciado, alternativas com resposta marcada, resolução e conceito. Consultar não altera XP nem o prazo do Eco; Voltar do Android retorna ao histórico.
- [x] Consultas de aprendizado testadas em SQLite real e memória; calendário semanal/fuso e amostra mínima testados. Roteiro web verifica expedição → evolução → histórico → resolução e exige progresso inalterado e nenhum erro de console (`--learning-only`). Exportações web/Android, lint e tipos conferidos; aparelho físico ainda pendente.
- [ ] Caça aos Ecos como modo dedicado com progressão própria
- [~] Andaime com exemplo resolvido: dois erros seguidos podem abrir uma etapa de leitura (conceito, enunciado e resolução de outro item validado), depois uma questão de base mais acessível e retorno ao treino. Exemplo no mesmo subassunto do reforço, nunca acima do nível da questão errada; não revela itens planejados nem volta como reforço avaliado na mesma sessão. Leitura salva e retomável, sem tentativa/XP/domínio. Quando não há exemplo separado adequado, mantém o reforço anterior. Conteúdo didático autoral específico para todos os subassuntos ainda pendente.
- [ ] Simulados (por assunto, dificuldade, personalizado, completo 45 q) + histórico + comparação
- [ ] Lembretes opcionais com horário de silêncio
- [ ] Pausa saudável após 25 min contínuos

## Academia QuestForge ✅ (pendências no fim)
- [x] Modelo curso → aula → etapa, com etapas Descoberta, Fundamentos, Interpretação, Aplicações, Aprofundamento e Maestria, todas abertas desde o início; modos Aprender, Praticar e Desafiar em cada etapa
- [x] **13 cursos, 40 aulas e 197 etapas** cobrindo os 38 subassuntos: 143 laboratórios com missão, 3 simulações, 230 exemplos guiados (escolher o próximo passo), 212 verificações, 1.074 geradores de exercícios; 7 tipos de exercício (escolha, número, ordenar, achar o erro, selecionar, classificar, lacunas)
- [x] Feedback que explica cada erro previsível; dicas graduais na prática; Desafio sem ajuda; nenhum erro tira XP, Tinta ou domínio
- [x] Progresso vista → estudada → dominada, revisão espaçada das etapas dominadas (3/7/16/35 dias), recompensas por marco (uma vez cada), insígnias de domínio por aula e 4 títulos
- [x] Integração: as 644 questões ligadas à etapa do seu subassunto; as 2.576 alternativas erradas com nota explicativa no feedback; "Rever na Academia"; recomendações em resumos, Acampamento e Atlas; preparo para chefões (+15% de dano no máximo, visível no HUD); treino dirigido com questões do Atlas; diagnóstico por etapa sem veredito com poucos dados
- [x] Persistência (migração 5), nuvem (snapshot schema 2 com merge por etapa), normalização e testes de atualização
- [x] Validador de conteúdo (estrutura, contas, variedade dos geradores, missões alcançáveis, feedback) e testes de cobertura total; revisão dos itens de Maestria/Aprofundamento e varreduras mecânicas (resposta presente na resolução em 86 mil instâncias; concordância)
- [x] `scripts/e2e-academy.js`: fluxo da Academia no navegador com capturas, sem erros de console; e2e principal, tipos, lint, 622 testes e exportação Android conferidos
- [ ] Testar em Android físico e com TalkBack
- [ ] Revisão pedagógica por professor externo e teste com estudantes
- [x] Publicada por EAS Update em 28/10/2026 (código `fc454cf`, Android, runtime 0.3.0, sem novo APK): `preview` grupo `e999ba50-7c75-444f-99c9-7b86370ad660`, `production` grupo `25e682c0-ca23-49b3-9dae-adefb399ea1d`; manifestos servidos conferidos nos dois canais. Reversão: grupos de 22/10 (`3de15c8f-626e-43ec-a87a-385756ca0441` e `1e8a3a63-9125-46e7-aa10-201dcf3f49da`)
- [ ] Atualizar os patches indicados pelo `expo-doctor` (expo 57.0.31, expo-router 57.0.29, expo-sharing 57.0.24), anteriores a este trabalho

## Etapa 6 — Conteúdo (pendente)
- [~] Expandir para 500 questões validadas, em lotes por assunto — **314 hoje** (91 do MVP + 25 de financeira + 126 de missões das regiões 1–2 + 72 da Região 3); combinatória, geometria espacial e equações têm poucos itens

## Etapa 7 — Polimento (pendente)
- [ ] Sons (desativáveis)
- [ ] Testes de componentes e testes em aparelho intermediário (performance)
- [ ] Revisão de acessibilidade com leitor de tela real

## Etapa 7.5 — Contas Google e progresso na nuvem (v0.3.0)
Implementado e testado em Node/emuladores (detalhes em `docs/CLOUD_SYNC.md`):
- [x] Login **apenas com Google** (Credential Manager) → Firebase Auth; sessão no cofre do sistema; restauração ao reabrir (inclusive offline); sair; erros claros; exclusão de conta (reconfirma com o Google)
- [x] **Banco local por conta** (`questforge-<uid>.db`, esquema v4): sair/trocar de conta nunca apaga nada; Backup Automático do Android desligado
- [x] **Nuvem**: um documento-snapshot versionado por conta + lotes de tentativas; regras de segurança (dono + Google, `rev = anterior + 1`, geração e schema nunca regridem)
- [x] **Sincronização em lote** (90 s de debounce, teto de 5 min, marcos imediatos), pendências duráveis, envio idempotente (`nonce` + linhagem), prazo/cancelamento, espera crescente
- [x] **Merge de 3 vias** sem perder nem duplicar (contadores, união, recordes, estorno de recompensa única paga em dois aparelhos, liquidação de encomendas)
- [x] Reinício do progresso por geração (`epoch`); exportação de dados (LGPD); painel *Conta e nuvem*; avisos de sincronização
- [x] **Migração única do progresso legado** (somente leitura, backup verificável, idempotente, conferida por releitura) — **preparada, NÃO executada**; fora do bundle de produção (`npm run verify:no-legacy`)
- [x] 120+ testes novos (sessão, motor, merge, migração, regras e motor no Firestore real via emulador)
- [ ] Teste do login Google e da sincronização em **aparelho real** com o projeto Firebase (depende da configuração em `docs/CLOUD_SETUP.md`)
- [ ] Executar a migração única no celular (`docs/LEGACY_MIGRATION.md`) e confirmar
- [ ] Publicar política de privacidade e página de exclusão de conta (`docs/PRIVACY.md`); App Check e alertas de orçamento antes de crescer
- [ ] Compactar lotes de tentativas se um usuário acumular milhares (restauração lê ~1 documento por lote)

## Etapa 8 — Entrega (parcial)
- [x] Instruções para Android no `README.md` (Expo Go, build local e APK via EAS) e `eas.json`
- [x] APK de teste gerado localmente (`npx expo prebuild` + `./gradlew assembleRelease`, assinado com chave de debug)
- [x] **Atualizações pela internet (EAS Update)**: o APK instalado baixa versões novas sozinho (canal `preview`, runtime = versão do app); aviso "Atualizar agora" no Acampamento e nos Ajustes
- [x] **Progresso preservado em atualizações**: mesmo pacote, `versionCode` crescente e mesma chave de assinatura (`credentials/`, também usada pela EAS); migrações testadas contra bancos SQLite reais gravados pela v0.1.0
- [x] APK v0.2.0 conferido com `apksigner`/`aapt2`: mesmo pacote, `versionCode` 2 > 1 e certificado idêntico ao da v0.1.0 (instala por cima)
- [x] Primeira atualização publicada no canal `preview` (runtime 0.2.0); manifesto e bundle conferidos como o app os baixa
- [x] Atualização da expansão (missões rejogáveis + efeitos do herói) publicada no canal `preview` (runtime 0.2.0, sem mudança nativa); manifesto, hash do bundle e textos novos conferidos
- [x] Atualização da Região 3 (Planícies Numéricas, Quimera Fracionária e itens) publicada no canal `preview` (runtime 0.2.0, sem mudança nativa — o APK versionCode 4 já a recebe); manifesto, hash do bundle e textos novos conferidos
- [x] Atualização de evolução e histórico publicada em 19/10/2026 (`391ad47`, grupo `60495e32-9990-401e-839e-18976055c016`, Android, canal `preview`, runtime `0.2.0`): manifesto servido ao APK, download, hash e textos das telas conferidos; gancho de QA ausente. Reversão preparada para o grupo anterior da Região 3 (`21bf9c7d-cdf1-4aea-b9ac-0e12b62c11e0`), sem migração ou reinstalação.
- [x] Reforço guiado publicado em 19/10/2026 (`0bec7e1`, grupo `a2b4a350-6a36-4267-a788-33cfa74660d1`, Android, canal `preview`, runtime `0.2.0`): manifesto, download, hash e textos novos conferidos; gancho de QA ausente. Ponto de retorno: evolução e histórico (`60495e32-9990-401e-839e-18976055c016`). Sem migração SQL ou mudança nativa. 194 testes, lint, tipos, compilação Android e fluxo de exemplo/retomada no navegador verificados.
- [x] Folhas de resolução publicadas em 19/10/2026 às 15h16 de Brasília (`4efea8a`, grupo `7c181e15-f117-4da2-b32e-ec12992a7e93`, Android, canal `preview`, runtime `0.2.0`): manifesto servido, download do bundle de 4.425.532 bytes, hash e textos novos conferidos; gancho de QA ausente. Reversão para o reforço guiado (`a2b4a350-6a36-4267-a788-33cfa74660d1`). Sem migração ou mudança nativa. 198 testes, lint, tipos, compilação Android, todas as 314 folhas offline em 320 px e fluxo de erro/histórico/reforço verificados na web.
- [x] Ícone do app (espada, livro e símbolos), splash e ícone monocromático do Android 13 gerados a partir da arte oficial (APK v0.2.0, versionCode 3)
- [x] Novo ícone fornecido pelo usuário: livro, estrela, caminho e montanhas; fundo externo removido, PNG transparente, variantes adaptativas e temática monocromática, favicon. APK 0.2.1/versionCode 5 gerado no EAS em 19/10/2026 (build `1da63e0d-71bb-49fa-95d2-a1e541c7ccb8`, código `1c81fcc`), com pacote e certificado iguais aos anteriores. Assinatura criptográfica, versão, runtime 0.2.1, cor de fundo nativa e ícone extraído do APK conferidos. Tipos, lint, transparência/tamanhos das imagens e 19 testes de persistência/atualização passaram. Instalação e aparência em celular físico ainda pendentes. A tela de abertura mantém a arte anterior.
- [x] APK com a expansão (EAS, perfil `preview`): versionCode 4, versão 0.2.0, mesmo certificado da v0.1.0 (instala por cima), canal `preview` e runtime 0.2.0 conferidos com `apksigner`/`aapt2`; bundle embutido já traz missões e efeitos novos
- [ ] Chave de assinatura própria para publicação na Play Store
- [x] Abertura simples: apenas QuestForge em branco sobre fundo escuro, sem ilustração ou espera artificial. APK 0.2.2/versionCode 6 gerado em 19/10/2026 às 20h07 de Brasília (build `cf33019c-173f-4686-ac4a-ff6521e807d3`, código `1ad811b`), com pacote e assinatura iguais aos anteriores. Assinatura criptográfica, versão/runtime, fundo nativo e imagem extraída do APK conferidos. Tipos, lint, configuração Expo e área segura da imagem passaram. Nenhuma alteração em dados ou fluxo de carregamento; aparência em aparelho físico ainda pendente.
