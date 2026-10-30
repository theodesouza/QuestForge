# Revisão adversarial — Vale das Proporções

Data: 22/10/2026. Artefato: `src/content/questions/expansion/vale.ts`.

Revisão independente por agente de IA, com leitura das 110 questões e resolução individual de cada enunciado, seguida da comparação com alternativas, gabarito, dicas, contas e `verify`. Não é revisão humana. Cross-model skipped: non-interactive context.

Contrato conferido: 20 questões em cada uma de `r1-m1`, `r1-m2`, `r1-m3`; 50 questões adicionais para o Golem; enunciados autorais em português; subtemas compatíveis; duas dicas graduais; resolução estruturada; cálculo verificável; alternativa numérica correta única, inclusive ao interpretar frações e decimais equivalentes.

## Achados válidos e corrigidos

1. **Habilidades genéricas ocultavam o conteúdo avaliado.** As 110 questões herdavam somente H3. Foram adicionados metadados explícitos em 72 questões: H11 nas escalas, H16 na proporcionalidade, H10/H12 nas unidades e medidas relevantes e H21 nas modelagens algébricas. As questões numéricas simples continuam usando H3 quando adequado. A escolha segue a [matriz oficial do INEP](https://download.inep.gov.br/download/enem/matriz_referencia.pdf). H17 avalia argumentação sobre variação; não foi usado como sinônimo de resolver equações.

2. **VAG-001 repetia a situação matemática de RZP-001.** Os mesmos grupos de 12 e 18 unidades produziam novamente a participação 2/5 com outra ambientação. A versão revisada exige selecionar o grupo de runas não triangulares, excluindo uma terceira categoria: 12/(12 + 6) = 2/3. A alternativa 4/11 captura o erro de incluir todas as runas no denominador.

3. **VAM-032 era muito próximo de RZP-015.** Ambos pediam a duração restante de ração depois de consumo inicial e chegada de mais animais. A nova questão pede o máximo de animais adicionais que podem ser recebidos por um prazo fixo, incluindo arredondamento inteiro: 15 × 18 = 270 diárias; piso(270/12) − 15 = 7 cães novos.

4. **VAM-039 era muito próximo de RZP-017 e sua dificuldade estava inflada.** A versão anterior apenas descontava um dia e calculava duração após quebra de máquina. A revisão mantém o contexto por etapas, mas exige dimensionar máquinas alugadas com produtividade diferente para um prazo fixo: trabalho restante 696; capacidade própria futura 360; déficit 336; cada alugada produz 150 unidades equivalentes; teto(336/150) = 3 máquinas. Duas alugadas produzem 300 e não cobrem o déficit. Assim, a classificação 4 passa a corresponder a uma modelagem com várias restrições.

5. **Treze classificações estavam infladas em relação ao raciocínio necessário.** Foram reduzidas: VAM-013 (3→2), VAM-018 (3→2), VAM-034 (3→2), VAM-040 (4→3), VAM-055 (3→2), VAM-056 (3→2), VAM-060 (4→3), VAG-017 (3→2), VAG-023 (3→2), VAG-024 (4→3), VAG-037 (3→2), VAG-038 (3→2) e VAG-041 (4→3). Nenhuma questão teve apenas os números aumentados para simular dificuldade.

## Verificação matemática individual

**110/110 questões finais resolvidas individualmente.** Nenhum gabarito matematicamente incorreto foi encontrado na versão recebida. Os três novos resultados das questões reescritas foram recalculados acima. Os resultados independentes estão preservados como fixtures em `src/content/validation/__tests__/valeExpansion.test.ts`; não são obtidos chamando o `verify` da questão.

Cada linha abaixo lista os resultados na ordem dos IDs do intervalo, nas unidades e bases percentuais pedidas pelos enunciados. Frações representam os valores exatos antes de arredondar.

| IDs | Resultados independentes |
| --- | --- |
| VAM-001–010 | 1,5; 120; 88; 1/3; 48; 1; 4,2; 56; 0,02; 3 |
| VAM-011–020 | 25; 500; 0,5; 390; 20.000; 60; 75; 5; 1.400/3; 160 |
| VAM-021–030 | 15; 40; 108; 30; 10,8; 3; 20; 12; 15; 30 |
| VAM-031–040 | 60; 7; 345,6; 27; 1,25; 15; 6; 14,4; 3; 14 |
| VAM-041–050 | 42; 35; 30; 4.800; 24; 56,7; 30; 15; 459; 560 |
| VAM-051–060 | 35; 30; 50; 54; 100; 10; 100; 340; 240/23; 3.750/19 |
| VAG-001–010 | 2/3; 63; 720; 120; 6; 300; 70; 3; 180; 30 |
| VAG-011–020 | 32; 60; 100; 36; 200; 72; 8; 7; 43,2; 16 |
| VAG-021–030 | 350; 36; 28; 20; 540; 780; 1.500; 100; 400; 140/3 |
| VAG-031–040 | 300; 56; 30; 100/9; 20; 25; 300/7; 50/3; 720; 40 |
| VAG-041–050 | 80/3; 80; 30; 20; 100; 90; 300/19; 25/3; 7.500/23; 300 |

Não foram encontradas ambiguidades matemáticas substantivas, alternativas numericamente equivalentes, explicações falsas ou respostas reveladas pelo enunciado nas questões finais. As dicas orientam o raciocínio e o primeiro cálculo; não dependem da letra da alternativa. As letras continuam distribuídas igualmente (22 por letra), e o aplicativo pode embaralhar as alternativas.

A diversidade inclui comparação de taxas, seleção da base, repartição, diferenças e mudanças de razão, escalas lineares/quadráticas/cúbicas, conversão de unidades, produção por etapas, dimensionamento inteiro, custos fixos e variáveis, percentuais condicionados, alterações de composição, diluição, secagem e inversão de descontos. Famílias do mesmo subtema compartilham conceitos, mas as três repetições mais próximas do original tiveram a decisão ou a incógnita alterada.

## Testes e limites

- Jest focado: `node node_modules/jest/bin/jest.js valeExpansion --runInBand --cacheDirectory ../jest-cache` — **113 testes passaram**.
- Typecheck: `node node_modules/typescript/bin/tsc --noEmit` — passou.
- Lint: `node node_modules/eslint/bin/eslint.js src/content/questions/expansion/vale.ts src/content/validation/__tests__/valeExpansion.test.ts` — passou.
- Os testes conferem contagens, alinhamento com as missões, fonte autoral, IDs e textos distintos, estrutura completa, habilidades específicas, ausência de alternativas numericamente equivalentes e 110 resultados independentes contra gabarito e `verify`.
- A comparação automatizada de enunciados completos inclui o banco original; as famílias originais de razão/proporção e porcentagem também foram lidas para procurar reaproveitamento semântico. Arquivos de questões originais não foram alterados.

Escopo de edição: apenas `vale.ts`, `valeExpansion.test.ts` e este relatório. Sem commits. Integração no banco, seleção de missões e interface ficam com a tarefa principal.

Não houve teste com estudantes, calibração psicométrica ou revisão por docente. A dificuldade é uma avaliação editorial por IA; os testes automatizados não provam originalidade semântica ou qualidade pedagógica por si só.
