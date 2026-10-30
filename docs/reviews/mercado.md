# Auditoria do Mercado de Âmbar

## Entrega

- `src/content/questions/expansion/mercado.ts`: 110 questões explícitas e autorais.
- `MERCADO_MISSIONS`: 20 itens em `r2-m1`, 20 em `r2-m2` e 20 em `r2-m3`; IDs `MEM-001` a `MEM-060`.
- `MERCADOR_EXTRA`: 50 itens; IDs `MEC-001` a `MEC-050` (10 de juros simples, 15 de compostos, 10 de compras a prazo e 15 de custo-benefício).
- Cada questão tem cinco alternativas, duas dicas graduais, resolução estruturada com contas, conceito, habilidades específicas e `verify()` que refaz a conta pelos dados do enunciado.
- Gabaritos: 22 em cada letra. Dificuldades: 5 fáceis, 25 médias, 54 difíceis e 26 muito difíceis.

## Revisão de conteúdo e matemática

Preservei os rascunhos anteriores e li seus enunciados, bases percentuais, prazos e resoluções. Recalculei os 110 resultados e registrei uma segunda lista independente de resultados em `work/build-mercado.cjs`. Esse script compara a lista com as expressões de verificação antes de emitir o TypeScript. Os arquivos `mercador-compras.cjs` e `mercador-custos.cjs` completam as 25 situações que faltavam, com enunciados próprios sobre cronogramas de parcelas, orçamento, valor presente, cancelamento, fatura, capacidade, franquias, faixas de energia, embalagens, durabilidade e contratos.

Os enunciados explicitam a base de juros/tributos/descontos, as datas dos aportes e pagamentos, as convenções de prazo e as cobranças incluídas quando isso afeta a resposta. Nas compras em embalagens e transportes, a resolução enumera as combinações relevantes. Desigualdades de vantagem estrita avançam além da igualdade; metas mínimas usam o primeiro período inteiro que as alcança.

A pergunta de `MEM-012` identifica a aproximação aos centavos do capital calculado, evitando pedir uma igualdade monetária exata após arredondamento. `MEC-022` declara tolerância absoluta de `1e-9` para o resultado zero, devido ao erro de ponto flutuante ao comparar fatores teoricamente iguais. As demais tolerâncias explícitas são de meio centavo ou de meio centésimo de ponto percentual, conforme a alternativa arredondada. Distratores monetários negativos usam `R$ -valor`, compatível com o parser atual.

Todas as habilidades foram atribuídas por item entre H10/H12/H15/H16/H17/H21; nenhum item herda o H3 genérico do auxiliar `authored`. As alternativas e as explicações não dependem de letras ou de posição. Não há geração numérica de enunciados no aplicativo: o módulo entregue contém literais e funções de verificação diretas. A geração local apenas transcreve os rascunhos autorais.

## Verificação executada

- `node work/build-mercado.cjs`: 110 resultados independentes e contagens conferidos.
- `node node_modules/jest/bin/jest.js mercadoExpansion --runInBand --cacheDirectory ../jest-cache`: 3 testes passaram; estrutura, compatibilidade de missão, unicidade, respostas numéricas e distribuição dos gabaritos.
- `node node_modules/typescript/bin/tsc --noEmit`: passou.
- `node node_modules/eslint/bin/eslint.js src/content/questions/expansion/mercado.ts src/content/validation/__tests__/mercadoExpansion.test.ts`: passou.

## Limites

Não alterei agregadores, bancos antigos ou arquivos compartilhados. A integração ao catálogo e os testes gerais ficam com a sessão principal. Não fiz verificação visual ou em aparelho físico nesta etapa de conteúdo. Nenhum commit foi criado.
