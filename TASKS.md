# QuestForge — Tarefas

Legenda: `[x]` implementado **e** testado/verificado · `[~]` parcial · `[ ]` pendente.
Este arquivo registra o estado real — nada é marcado como feito só por parecer pronto.

Como verificar: `npm test` (148 testes), `npm run typecheck`, `npm run lint`,
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
- [x] Avisos curtos (encomenda cumprida, baú) que esperam o fim da questão/batalha e da celebração, anunciados ao leitor de tela
- [ ] Regiões 3–9 com missões, desafios opcionais e chefões próprios (catálogo no plano)
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
- [x] Sem exploração: recompensas de estrela únicas; bônus de sessão só com ≥ 3 respostas valiosas; repetição rende 10% e nada dentro de 20 h

Efeitos visuais (`src/ui/vfx/`, verificado no laboratório `/vfx-lab` e no roteiro ponta a ponta):
- [x] Motor de efeitos na UI thread (camadas SVG estáticas + transform/opacity, partículas com relógio compartilhado)
- [x] 9 núcleos e 8 auras com formas e movimentos próprios (chamas, marés, cortinas boreais, nebulosa, coroa solar, órbitas, runas…)
- [x] Hierarquia Comum → Incomum → Raro → **Épico** (nova raridade) → Lendário, reconhecível só pela aparência; molduras evoluem (pinos que pulsam, anéis armilares)
- [x] **Sinergias** reutilizáveis: Ressonância por elemento (fogo+fogo, tempestade+tempestade, …), Refração do cristal e **Forma Mítica** (lendário + lendário)
- [x] Revelação de item proporcional à raridade (carga, raios, ondas) com "Equipar agora"; prévia "experimentar" no Herói (inclusive itens bloqueados); estouro de energia ao equipar
- [x] "Intensidade dos efeitos" (Alta/Média/Baixa), movimento reduzido = quadros estáticos, nada pisca acima de 3×/s
- [ ] Medir desempenho num Android intermediário físico (validado só na web e por estimativa de camadas)

## Etapa 5 — Aprendizado adaptativo (pendente)
- [ ] Painel de evolução (semana, assuntos fortes/fracos, tempo de estudo, gráficos)
- [ ] Histórico de erros navegável ("por que errei")
- [ ] Caça aos Ecos como modo dedicado com progressão própria
- [ ] Andaime completo com exemplo resolvido dedicado
- [ ] Simulados (por assunto, dificuldade, personalizado, completo 45 q) + histórico + comparação
- [ ] Lembretes opcionais com horário de silêncio
- [ ] Pausa saudável após 25 min contínuos

## Etapa 6 — Conteúdo (pendente)
- [~] Expandir para 500 questões validadas, em lotes por assunto — **242 hoje** (91 do MVP + 25 de financeira + 126 de missões); combinatória, geometria espacial e equações têm poucos itens

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
- [x] Ícone do app (espada, livro e símbolos), splash e ícone monocromático do Android 13 gerados a partir da arte oficial (APK v0.2.0, versionCode 3)
- [ ] Chave de assinatura própria para publicação na Play Store
