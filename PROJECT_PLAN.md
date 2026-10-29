# QuestForge — Plano do Produto

> RPG educacional de matemática para o ENEM. Android primeiro, pronto para iOS.
> Este documento é a fonte da verdade sobre **visão, mecânicas e direção de arte**.
> Decisões técnicas estão em `ARCHITECTURE.md`; o andamento real está em `TASKS.md`.

---

## 1. Visão

O jogador é um **Cartógrafo** num mundo cujo mapa — o **Atlas** — foi desfeito pela
**Névoa do Esquecimento**. Cada conceito de matemática que ele domina redesenha um pedaço
do mundo. Resolver questões não é "ganhar pontos": é **traçar o mapa**, **forjar o
astrolábio** e **expulsar a névoa**.

A promessa ao jogador:

1. Abrir o app e em **um toque** estar resolvendo uma questão.
2. Em toda sessão — mesmo de 3 minutos — **ver algo avançar**.
3. Terminar sabendo **mais matemática do que antes**, e saber **qual o próximo passo**.

A frase-teste do produto: *"Só mais umas questões para subir de nível."*

### Princípios de design (inegociáveis)

| Princípio | Como se traduz no produto |
| --- | --- |
| Questão é o centro | Nenhum efeito visual compete com o enunciado. Animações ocorrem *depois* da resposta. |
| Progresso real ≠ volume | XP mede esforço; **Domínio** mede aprendizado e só sobe com evidência espaçada no tempo. |
| Constância sem culpa | Não existe "ofensiva" que zera. Ausência gera **Descanso do Viajante** (bônus de retorno). |
| Raridade por mérito | Itens raros vêm de feitos (chefão sem dicas, domínio de assunto), nunca de sorte. |
| Sem manipulação | Sem compras, loot boxes, contadores falsos de urgência ou notificações excessivas. |
| Honestidade de dados | Precisão só aparece com amostra mínima; nada de "nota TRI" inventada. |

---

## 2. As três dimensões de progresso

```
 PERSONAGEM (esforço)        CAMPANHA (território)        CONHECIMENTO (domínio)
 XP · nível 1–50            Regiões do Atlas              Domínio por subassunto
 Tinta ✦ (moeda)            Missões · Chefões             Ecos (erros a revisar)
 Astrolábio + cosméticos     Marcos narrativos            Repetição espaçada
 Títulos · Companheiros      Selos de região              Calibração (certeza × acerto)
```

Elas se cruzam mas não se confundem: um jogador de nível 30 pode ter Geometria Espacial
"Em descoberta" — e o app recomendará treino exatamente ali.

### 2.1 Personagem — o Astrolábio

O avatar é um **astrolábio vivo**, desenhado em vetor, que representa a evolução intelectual:

- **Anéis** ganham gravações (marcas de escala) conforme o nível sobe.
- **Estrelas orbitais** surgem a cada patente (a cada 5 níveis).
- **Núcleo** (gema central), **Moldura** (anel externo), **Aura** e **Cenário** (a paisagem atrás do
  astrolábio) são cosméticos equipáveis, além do **Título** exibido embaixo do nome.
- **Selos de domínio** (fase posterior) aparecem gravados no anel quando o jogador domina
  um assunto — o personagem literalmente carrega o que aprendeu.

### 2.2 Curva de XP (níveis 1–50)

`xpParaProximo(L) = arred5(50 + 12 · (L − 1)^1.4)`

| Nível | XP p/ próximo | XP acumulado (aprox.) | Sensação |
| --- | --- | --- | --- |
| 1 → 2 | 50 | 0 | 3–4 questões: primeiro nível no primeiro minuto |
| 5 → 6 | 135 | 295 | 1 sessão curta por nível |
| 10 → 11 | 310 | 1.295 | ~1–2 sessões |
| 25 → 26 | 1.075 | 10.950 | dias de dedicação |
| 49 → 50 | 2.760 | 55.240 (total 58.000 no nível 50) | meses — marco de longo prazo |

Totais exatos são calculados e testados em `src/domain/progression/levels.ts`.

### 2.3 Fontes de XP e proteções anti-exploração

| Ação | XP |
| --- | --- |
| Acerto inédito | Base por dificuldade: Fácil 10 · Médio 16 · Difícil 24 · Muito difícil 34 |
| Uso de dica | −25% por dica (mínimo 50% da base) |
| Acerto marcado como "chute" | 50% — e **não** conta para domínio; agenda revisão |
| **Redenção** (acertar uma questão que já errou, em outro dia/sessão) | 150% da base |
| Revisão devida (repetição espaçada) | 60% da base |
| Repetição fora do prazo de revisão | 10% da base, no máx. 1× a cada 20 h por questão |
| Erro | 0 XP — vira um **Eco** (revisão futura com bônus de redenção) |
| Sessão concluída (≥ 3 respondidas) | +20 · Sessão perfeita (≥ 5, sem erros) +20 — 3 acertos fáceis já garantem o nível 2 |
| Missão concluída (1ª vez) | +40 |
| Chefão derrotado (1ª vez) | +150 + item exclusivo |
| Descanso do Viajante | Bônus que **dobra** o XP de questões até esgotar o saldo (acumula 150/dia de ausência, teto 600) |

Repetir infinitamente uma questão fácil rende no máximo ~1 XP/dia por questão.

### 2.4 Economia

- **Tinta ✦**: moeda ganha estudando (1–4 por acerto, bônus em missões/chefões).
  Gasta na Oficina de cosméticos (fase 4). Nunca comprada com dinheiro real.
- **Cosméticos** (molduras, núcleos, auras, companheiros, títulos) com raridades:
  Comum · Incomum · Raro · Lendário. Raros e lendários são **vinculados a feitos**.
- **Registro de recompensas idempotente**: cada recompensa tem uma chave única
  (`level:7`, `boss:golem:first`). Concedê-la duas vezes é impossível por construção.

### 2.5 Campanha — o Atlas

Regiões planejadas (cada uma com missões, desafios opcionais, revisão e chefão):

| # | Região | Conteúdos | Guardião |
| --- | --- | --- | --- |
| 1 | **Vale das Proporções** | razão, proporção, regra de três, porcentagem | **Golem Proporcional** |
| 2 | Mercado de Âmbar | matemática financeira, juros, descontos | Mercador de Juros Compostos |
| 3 | Planícies Numéricas | operações, frações, potências, notação científica | Quimera Fracionária |
| 4 | Torres Euclidianas | geometria plana, áreas, perímetros, Pitágoras | Colosso Euclidiano |
| 5 | Cavernas Volumétricas | geometria espacial, volumes, planificações | Arquiteto dos Sólidos |
| 6 | Observatório dos Dados | gráficos, tabelas, estatística | Leviatã dos Gráficos |
| 7 | Labirinto do Acaso | contagem, combinatória, probabilidade | Esfinge do Acaso |
| 8 | Cordilheira das Funções | funções afim/quadrática/exponencial, equações | Hidra das Funções |
| 9 | Ilhas da Medida | grandezas, escalas, conversões, trigonometria básica | Leviatã das Escalas |
| ∞ | Cume do ENEM | simulados completos | — |

Regiões já vencidas permanecem abertas para revisão. A primeira versão jogável (MVP)
implementou a Região 1; hoje o Atlas jogável vai da **Região 1 à 5** (cada uma com 3 missões e o
chefão), e as regiões 6–9 seguem planejadas.

### 2.6 Chefões

Batalha por turnos em que **cada turno é uma questão**:

- Acerto causa dano proporcional à dificuldade; **combo** de acertos amplia o dano.
- Ao atingir combo 3, o jogador ativa uma **técnica** (dano extra, com nome e animação).
- Erro: o chefão ataca a **Determinação** (3 pontos). O jogador vê a resolução antes de seguir.
- Sem cronômetro. Sem sorte: dano é determinístico.
- Determinação zerada = **retirada**, nunca "game over": o XP das questões fica, e a
  próxima tentativa ganha **Conhecimento do Inimigo** (+10% de dano por tentativa, até +30%).
- Cada chefão tem personalidade (falas de introdução, fase e derrota) e uma mecânica
  própria (ex.: o Golem possui **Armadura** que reduz dano de questões fáceis até ser quebrada;
  o Colosso Euclidiano tem **três vértices** que racham com acertos; o Arquiteto dos Sólidos
  despeja **concreto** a cada erro, quebrado só pela Técnica).

### 2.7 Conhecimento — o treinador

- **Ecos**: todo erro gera um Eco. Ecos voltam por repetição espaçada
  (Leitner: 1 → 3 → 7 → 16 → 35 dias). Vencer um Eco rende Redenção (150% XP).
- **Calibração**: o jogador pode marcar "chute" antes de confirmar. Acertos por chute não
  contam como domínio e agendam revisão — separando sorte de aprendizado.
- **Domínio por subassunto** em 5 estados — Inexplorado · Em descoberta · Em progresso ·
  Firme · Dominado — usando estimativa bayesiana com amostra mínima e exigência de acertos
  espaçados em dias diferentes para "Dominado".
- **Andaime adaptativo**: após 2 erros seguidos no mesmo subassunto, a sessão insere
  explicação + exemplo resolvido + questão mais acessível antes de voltar ao nível anterior.
- **Seleção de questões**: Ecos devidos → subassuntos fracos/novos → dificuldade alvo
  adaptada (sobe com acertos, desce com erros), evitando repetição previsível.

### 2.8 Engajamento saudável

- **Expedições rápidas**: 3 · 5 · 10 · 15 · 25 minutos.
- **Fio da meada**: toda sessão termina com o *próximo pequeno passo* sugerido.
- **Missões diárias e semanais** (fase 4) — simples, alcançáveis, sem punição por perder.
- **Chama da Constância**: meta *semanal* de dias de estudo (ex.: 4 de 7), sem zerar.
- **Descanso do Viajante**: voltar depois de dias fora rende bônus, não culpa.
- **Lembretes** opcionais, com horário de silêncio e no máximo 1 por dia (fase 5).
- **Pausa saudável**: após 25 min contínuos, sugestão gentil de pausa.

### 2.9 Simulados (fase 5)

Por assunto, por dificuldade, personalizado e completo (45 questões), com cronômetro
opcional e correção só ao final. O app explica a diferença entre **percentual de acerto**
e **nota TRI do ENEM** e não exibe nota TRI sem modelo validado.

---

## 3. Direção de arte — "Cartografia Noturna"

**Conceito**: um caderno de cartógrafo aberto à noite. Tinta escura, linhas finas de
latão, constelações e curvas de nível. Elegante, mais "instrumento de precisão" que
"desenho infantil" — celebra sem infantilizar.

### Paleta

| Token | Cor | Uso |
| --- | --- | --- |
| `ink.900` | `#0B1020` | fundo base |
| `ink.800` | `#121933` | superfícies |
| `ink.700` | `#1A2346` | superfícies elevadas |
| `ink.600` | `#27315C` | bordas, trilhos |
| `parchment` | `#F4ECDC` | texto principal |
| `mist` | `#9AA3C7` | texto secundário |
| `brass` | `#F2B54A` | XP, recompensas, ação principal |
| `verdigris` | `#38D6B0` | acerto, domínio |
| `ember` | `#FF6A55` | erro, dano, chefões |
| `iris` | `#9B87FF` | raro, arcano, Ecos |

Contraste: texto `parchment` sobre `ink.900` ≈ 15:1; `mist` sobre `ink.800` ≥ 7:1.

### Tipografia

- **Bricolage Grotesque** — display: títulos, números de nível, nomes de chefões.
  Personalidade forte e moderna, com ótima leitura em tamanhos grandes.
- **Inter** — corpo e enunciados: legibilidade máxima, algarismos tabulares para números.
- Enunciado em 17px / altura de linha 26px; alternativas com alvo de toque ≥ 56px.

### Linguagem visual

- Linhas de 1–1,5px em latão translúcido, cantos 14–20px, fundo com grade sutil de mapa.
- Ícones próprios desenhados em SVG (traço único, ponta arredondada) — sem biblioteca genérica.
- Movimento: molas curtas (≤ 350 ms) na interface; celebrações (subida de nível) curtas,
  puláveis com um toque e reduzidas a *fade* quando "reduzir movimento" estiver ativo.
- Tátil: toque leve ao selecionar, sucesso/erro na correção, impacto em golpes de chefão.

---

## 4. Roteiro por etapas

| Etapa | Entrega | Critério de pronto |
| --- | --- | --- |
| 1. Planejamento | Este plano, `ARCHITECTURE.md`, `TASKS.md` | Documentos versionados |
| 2. Design system | Tokens, tipografia, ícones, componentes, Astrolábio | Usado por todas as telas |
| 3. **MVP jogável** | Onboarding, Acampamento, sessão de questões, correção, XP, níveis, persistência, 1ª recompensa, 1º chefão, Região 1 | Fluxo completo funcional + testes verdes |
| 4. Expansão RPG | Regiões 2–9, Oficina, inventário completo, conquistas, missões diárias/semanais, companheiros | — |
| 5. Aprendizado adaptativo | Painel de evolução, domínio, Caça aos Ecos, andaime completo, simulados, lembretes | — |
| 6. Conteúdo | 500 questões validadas em lotes revisáveis | Validador sem erros |
| 7. Polimento | Testes ponta a ponta, performance, acessibilidade, revisão crítica do design | — |
| 8. Entrega | Instruções Android, build EAS | — |

Ver `TASKS.md` para o estado real de cada item.
