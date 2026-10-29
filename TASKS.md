# QuestForge — Tarefas

Legenda: `[x]` implementado **e** testado/verificado · `[~]` parcial · `[ ]` pendente.
Este arquivo registra o estado real — nada é marcado como feito só por parecer pronto.

Como verificar: `npm test` (179 testes), `npm run typecheck`, `npm run lint`,
`npx expo export --platform android` e o roteiro ponta a ponta `scripts/e2e-web.js`.

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
- [x] **Personalização ampliada** (49 peças novas; catálogo de 39 → 88):
  - **molduras** 11 → 19, com 7 estilos novos de anel (pérolas, corrente, ondas, sol nascente, louros, runas, cristais); **núcleos** 10 → 17 (Jade, Coral, Ametista, Obsidiana, Esmeralda, Gelo Eterno, Eclipse); **auras** 8 → 14 (Pétalas, Cinzas, Vagalumes, Neve, Elétrica, Constelações); novo elemento **Natureza** com Ressonância própria
  - **Cenário**: quinto espaço de equipamento, a paisagem atrás do astrolábio no Herói, no Acampamento e nas prévias; 11 cenários com arte própria e camadas animadas leves (Noite Estrelada, Colinas, Mar Aberto, Dunas, Floresta, Vale de Pedra, Mercado de Âmbar, Planície dos Três Arcos, Campo Polar, Observatório, Cosmos Áureo)
  - **títulos** 10 → 27: 6 na Oficina, 6 por nível e 5 por feitos (10 e 40 Ecos superados, 1000 respostas, 3 estrelas em 6 missões, "Lenda do Atlas")
  - **feitos** (`feats.ts`): cada chefão rende o cenário da sua região (inclusive retroativo), e vencer todos sem errar rende o Cosmos Áureo; 30 níveis agora entregam algo (antes 17)
  - **Oficina** reorganizada: abas por espaço, 32 peças à venda (antes 8), "Só o que posso comprar" e **Experimentar** antes de comprar
  - **Herói**: cinco espaços, filtros Todos/Meus/Bloqueados, contagem por categoria, peças em ordem de raridade
  - perfis antigos continuam intactos (o espaço novo nasce vazio, sem migração SQL)
- [x] Avisos curtos (encomenda cumprida, baú) que esperam o fim da questão/batalha e da celebração, anunciados ao leitor de tela
- [x] **Região 3 — Planícies Numéricas** (frações, MMC/MDC, potências e notação científica): 3 missões + chefão, abre após vencer o Mercador
  - **72 questões autorais novas** (`BAS-101…324`, 6 lotes de 12), pools de 26–27 por missão (≥ 20 extras além das 5 de cada tentativa); novo subassunto `potencias`
  - cada lote foi resolvido às cegas por um revisor independente (e por mim): **0 divergências de gabarito**; as correções vieram de dificuldade superestimada (4 → 3 em 7 questões e 3 → 2 em 2; a rampa da missão de potências passou a [1, 2, 2, 3, 3] para casar com o conteúdo calibrado), um contexto irreal (volta de 24 s numa pista de atletismo virou trilha de caminhada) e um enunciado ambíguo (horta × terreno)
  - o validador agora entende notação científica (`3,2 × 10⁵`, `10⁻³`), potências (`2⁵`), raízes (`√49`), frações mistas (`2 1/2`) e o sinal `−`; a tolerância padrão passou a ser relativa
  - gabaritos do banco equilibrados: 62–64 por letra em 314 questões
- [x] **Quimera Fracionária** (`BossTrait` `heads`): a vida é a soma de três cabeças — Leão 1/2 (frações e contas), Cabra 1/3 (MMC e MDC), Serpente 1/6 (potências e notação) — e cada cabeça faz as perguntas da própria matéria; um erro faz a cabeça de pé se regenerar (6% da vida), mas nunca além do topo dela: cabeça derrubada não volta
  - barra de vida segmentada nas frações exatas (`HeadsBar`), arte vetorial com as cabeças que caem (`QuimeraArt`), fala própria a cada cabeça derrubada, lista das cabeças na introdução
  - recompensas: Moldura dos Três Arcos (raro, anel em arcos de 1/2, 1/3 e 1/6) e título Soma Inteira; sem erros nem dicas: **Núcleo da Trindade** (lendário, roda das frações + três gemas), que também desperta a Forma Mítica com qualquer aura lendária
- [x] **Região 4 — Torres Euclidianas** (geometria plana: áreas e áreas compostas, Pitágoras, semelhança e Tales, círculo, ângulos e polígonos regulares): 3 missões + chefão, abre após vencer a Quimera
  - **72 questões autorais novas** (`GEO-101…172`, 6 lotes de 12), pools de 25–27 por missão; 3 subassuntos novos (`areas-compostas`, `semelhanca`, `angulos`); todas com `verify()` numérico
  - **Colosso Euclidiano** (`BossTrait` `facets`): três vértices — Áreas, Triângulos e Círculos — que as perguntas percorrem em rodízio; vértice intacto reduz o dano em 40%, dois acertos o racham, um erro o reajusta; com os três rachados o Colosso fica exposto (+40% de dano) — `FacetsBar` no HUD, arte `ColossoArt` com as rachaduras de cada vértice
  - recompensas: Moldura das Torres (raro, polígono com triângulo e quadrado inscritos), título Geômetra, Planalto das Torres (cenário, por feito) e, sem erros nem dicas, **Núcleo de Euclides** (lendário: o 3-4-5 com seus quadrados 9 + 16 = 25)
- [x] **Região 5 — Cavernas Volumétricas** (geometria espacial: volumes, capacidade, cilindro, cone e esfera, área da superfície, sólidos compostos): 3 missões + chefão, abre após vencer o Colosso
  - **72 questões autorais novas** (`ESP-101…173`, 6 lotes de 12–13), pools de 25–28 por missão; 4 subassuntos novos (`capacidade`, `cone-esfera`, `superficie`, `solidos-compostos`)
  - **Arquiteto dos Sólidos** (`BossTrait` `concrete`): cada erro despeja uma camada de concreto (até 3) que tira 20% do dano; só a Técnica (3 acertos seguidos) quebra tudo; com a vida abaixo de 50% o concreto racha e para de se formar — `ConcreteTag` no HUD, arte `ArquitetoArt` com as camadas subindo pelo corpo
  - recompensas: Moldura de Geodo (raro, coroa de cubos isométricos), título Volumetra, Caverna de Cristais (cenário, por feito) e, sem erros nem dicas, **Núcleo do Poliedro** (lendário: cubo, octaedro e tetraedro encaixados)
  - catálogo: 88 → 96 peças (21 molduras com 2 estilos novos, 19 núcleos, 14 auras, 13 cenários, 29 títulos); a Lenda do Atlas agora exige vencer os cinco chefões sem errar
- [x] **Região 6 — Observatório dos Dados** (gráficos de barras/linhas/setores, tabelas e frequências, média/mediana/moda): 3 missões + chefão, abre após vencer o Arquiteto
  - **72 questões autorais novas** (`GRF-101…136`, `EST-101…136`), com dois **tipos novos de gráfico no enunciado** (linhas e setores); 2 subassuntos novos (`graficos-setores`, `frequencias`)
  - **Leviatã dos Gráficos** (`scales`): 4 escamas que reduzem o dano em 30%; acertos as arrancam (Técnica: duas), erros fazem duas crescerem; sem escamas, +50% de dano — `ScalesTag`, arte `LeviataArt`
  - recompensas: Moldura do Observatório (barras e radar), título Analista de Dados, cenário Mirante dos Gráficos e, sem erros nem dicas, **Núcleo do Histograma** (lendário)
- [x] **Região 7 — Labirinto do Acaso** (princípio multiplicativo, permutações, combinações, contagem com restrições, probabilidade): 3 missões + chefão
  - **72 questões autorais novas** (`COM-101…148`, `PRB-101…124`), muitas com verificação por busca exaustiva; 3 subassuntos novos (`permutacao`, `contagem-restricoes`)
  - **Esfinge do Acaso** (`riddle`): a cada 4 golpes (3 na fase 2) vem um Enigma — pergunta um nível acima, +50% de dano ao acertar e −2 de Determinação ao errar — `RiddleTag`, banner "Golpe do Enigma", arte `EsfingeArt`
  - recompensas: Moldura do Labirinto (greca), título Mestre do Acaso, cenário Corredores do Labirinto e **Núcleo do Dado Perfeito** (lendário)
- [x] **Região 8 — Cordilheira das Funções** (função afim, 1º grau, função quadrática, 2º grau, exponencial, progressões): 3 missões + chefão
  - **72 questões autorais novas** (`FUN-101…148`, `EQU-101…124`); 2 subassuntos novos (`equacao-2grau`, `progressoes`)
  - **Hidra das Funções** (`hydra`): cada erro faz nascer uma cabeça, e cada cabeça regenera 12 de vida por golpe; a Técnica cauteriza uma; com a vida abaixo de 40% os pescoços secam — `HydraTag`, arte `HidraArt` com as cabeças novas
  - recompensas: Moldura da Cordilheira, título Domador de Curvas, cenário Cordilheira ao Amanhecer e **Núcleo das Curvas** (lendário)
- [x] **Região 9 — Ilhas da Medida** (conversões, densidade/vazão/consumo, velocidade, tempo e fusos, trigonometria): 3 missões + chefão, a última região do Atlas
  - **73 questões autorais novas** (`GRA-101…148`, `TRG-101…125`); 4 subassuntos novos (`unidades-compostas`, `tempo`, `trigonometria`, `trigonometria-aplicada`)
  - **Leviatã das Escalas** (`phases`): três escalas (Colossal, Grande e Comum), cada uma com a sua matéria; cada escala concluída devolve 1 de Determinação — arte `EscalasArt`, que encolhe com a escala
  - recompensas: Moldura das Ilhas (régua), título Navegador das Escalas, cenário Arquipélago ao Anoitecer e **Núcleo da Rosa das Medidas** (lendário)
  - catálogo: 96 → 112 peças (25 molduras com 4 estilos novos, 23 núcleos, 14 auras, 17 cenários, 33 títulos); a Lenda do Atlas agora exige vencer os nove chefões sem errar; aviso único de novidade para quem já joga
- [ ] Cume do ENEM: simulados completos (planejado)
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

## Melhorias de uso: rever questões e Ecos ✅
- [x] **Rever a questão anterior** em expedições, missões, foco, Caça aos Ecos e batalhas: botão "Anterior" no rodapé; a revisão é somente leitura (alternativa escolhida, correta e resolução), tem "Anterior/Próxima" e o botão grande "Voltar à questão atual", que restaura seleção, dicas e rolagem; o tempo de resposta não conta enquanto se revê; no Android, Voltar fecha a revisão
- [x] **Eco superado**: acertar um Eco com confiança o encerra na hora (contador "Ecos superados" no Herói, selo "Eco superado" na questão, mensagem própria no feedback e no resumo); a redenção de 150% segue só no prazo (sem brecha de farm)
- [x] **Ecos antigos se dissipam**: mais de 21 dias, ou acima de 40 ativos, ao abrir o app — com aviso único; "Ecos dissipados" no Herói; migração v4 preserva o histórico (redenções antigas viram Ecos superados)
- [x] Caça aos Ecos separa Ecos ativos de revisões; Acampamento mostra "N Ecos à espreita" ou "N revisões prontas"

## Etapa 5 — Aprendizado adaptativo (pendente)
- [ ] Painel de evolução (semana, assuntos fortes/fracos, tempo de estudo, gráficos)
- [ ] Histórico de erros navegável ("por que errei")
- [ ] Caça aos Ecos como modo dedicado com progressão própria
- [ ] Andaime completo com exemplo resolvido dedicado
- [ ] Simulados (por assunto, dificuldade, personalizado, completo 45 q) + histórico + comparação
- [ ] Lembretes opcionais com horário de silêncio
- [ ] Pausa saudável após 25 min contínuos

## Etapa 6 — Conteúdo (pendente)
- [x] Expandir para 500 questões validadas, em lotes por assunto — **748 hoje** (91 do MVP + 25 de financeira + 126 de missões das regiões 1–2 + 72 da Região 3 + 72 + 73 das Regiões 4 e 5 + 72 + 72 + 72 + 73 das Regiões 6 a 9); toda questão de missão recalcula o gabarito (`verify()`)

## Etapa 7 — Polimento (pendente)
- [ ] Sons (desativáveis)
- [ ] Testes de componentes e testes em aparelho intermediário (performance)
- [ ] Revisão de acessibilidade com leitor de tela real

## Etapa 8 — Entrega (parcial)
- [x] Instruções para Android no `README.md` (Expo Go, build local e APK via EAS) e `eas.json`
- [x] APK de teste gerado localmente (`npx expo prebuild` + `./gradlew assembleRelease`, assinado com chave de debug)
- [x] **Atualizações pela internet (EAS Update)**: o APK instalado baixa versões novas sozinho (canal `preview`, runtime = versão do app); aviso "Atualizar agora" no Acampamento e nos Ajustes
- [x] **Progresso preservado em atualizações**: mesmo pacote, `versionCode` crescente e mesma chave de assinatura (`credentials/`, também usada pela EAS); migrações testadas contra bancos SQLite reais gravados pela v0.1.0
- [x] APK v0.2.0 conferido com `apksigner`/`aapt2`: mesmo pacote, `versionCode` 2 > 1 e certificado idêntico ao da v0.1.0 (instala por cima)
- [x] Primeira atualização publicada no canal `preview` (runtime 0.2.0); manifesto e bundle conferidos como o app os baixa
- [x] Atualização da expansão (missões rejogáveis + efeitos do herói) publicada no canal `preview` (runtime 0.2.0, sem mudança nativa); manifesto, hash do bundle e textos novos conferidos
- [x] Atualização da Região 3 (Planícies Numéricas, Quimera Fracionária e itens) publicada no canal `preview` (runtime 0.2.0, sem mudança nativa — o APK versionCode 4 já a recebe); manifesto, hash do bundle e textos novos conferidos
- [x] Atualização "rever questão anterior + Ecos superados/dissipados" publicada no canal `preview` (runtime 0.2.0, grupo `a3abb373`, sem mudança nativa): e2e completo sem erros (61 capturas), hash do bundle igual ao do manifesto e textos novos presentes no bundle
- [x] Atualização da personalização ampliada (Cenários, 49 peças novas, feitos, Oficina maior) publicada no canal `preview` (runtime 0.2.0, grupo `f1fb3515`, sem mudança nativa): e2e completo sem erros (67 capturas, com compra de Cenário, prévia, remoção e feitos de chefão), hash do bundle igual ao do manifesto e textos novos presentes
- [x] Atualização das Regiões 4 e 5 (Torres Euclidianas, Cavernas Volumétricas, Colosso Euclidiano, Arquiteto dos Sólidos, 8 peças novas e aviso de novidade) publicada no canal `preview` (runtime 0.2.0, grupo `38d25005`, update `01a188f7`, sem mudança nativa): e2e completo sem erros (91 capturas, as duas regiões jogadas até os chefões), hash do bundle igual ao do manifesto e textos novos presentes
- [x] Atualização das Regiões 6 a 9 (Observatório dos Dados, Labirinto do Acaso, Cordilheira das Funções, Ilhas da Medida, 4 chefões de mecânica própria, 289 questões e 16 peças novas) publicada no canal `preview` (runtime 0.2.0, grupo `cc6062bd`, update `01a18a18`, sem mudança nativa): e2e completo sem erros (143 capturas, as nove regiões jogadas até os chefões, com asserções das mecânicas novas), hash do bundle igual ao do manifesto e textos novos presentes
- [x] Ícone do app (espada, livro e símbolos), splash e ícone monocromático do Android 13 gerados a partir da arte oficial (APK v0.2.0, versionCode 3)
- [x] APK com a expansão (EAS, perfil `preview`): versionCode 4, versão 0.2.0, mesmo certificado da v0.1.0 (instala por cima), canal `preview` e runtime 0.2.0 conferidos com `apksigner`/`aapt2`; bundle embutido já traz missões e efeitos novos
- [ ] Chave de assinatura própria para publicação na Play Store
