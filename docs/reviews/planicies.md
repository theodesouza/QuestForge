# Revisão independente das Planícies Numéricas

Revisão adversarial de `QuestForge/src/content/questions/expansion/planicies.ts`, feita a partir dos enunciados. Foram resolvidas individualmente **110 questões**: PLM-001–060 e PLQ-001–050. Cada resultado foi comparado ao gabarito, às demais alternativas, à resolução e à função `verify()`. A tabela abaixo registra as contas independentes. Não encontrei gabaritos aritmeticamente errados na versão inicial; encontrei problemas de clareza, diversidade, classificação e independência da verificação.

Há exatamente 20 itens em cada uma das três missões e 50 extras da Quimera. A Quimera cobre frações/operações com 20 itens, MMC/MDC com 15 e potências/notação científica com 15. Todos os itens mantêm duas dicas e resolução explicada. Os 110 resultados têm uma única alternativa numericamente equivalente, inclusive frações e notação científica.

Correções realizadas:

- PLQ-002: alternativas já estavam escritas com o sinal depois de `R$`; normalizei também o enunciado e a resolução. O saldo correto continua sendo −75 reais. A posição `−R$` perde o sinal no parser atual.
- PLQ-014: explicitei que as duas retiradas ocorrem em **cada** bandeja; antes, a retirada podia ser interpretada como feita no conjunto inteiro.
- PLQ-030: explicitei que os números são inteiros positivos, domínio do MDC/MMC utilizado.
- PLM-037: `verify()` passou a testar a restrição de mais de 10 alunos, em vez de devolver apenas o MDC.
- PLM-039 e PLQ-032: a verificação agora procura o menor quadrado divisível pelos dois números. Os fatores de complemento antes embutidos na função já codificavam uma etapa da resposta.
- PLQ-017: substituí outro problema de fração de área cultivada por interpretação de um ponto na reta numérica, reduzindo a repetição de PLM-003/BAS-111. O resultado continua 1/3.
- PLM-003: substituí a fração de uma área plantada por consumo unitário da impressora e cálculo de dois relatórios. Agora há divisão por cinco e multiplicação por dois, em vez do modelo de duas subáreas de BAS-111. Resultado: 3/10 de cartucho.
- PLM-023: substituí contagem de segmentos de barras por uma compra com despesas iguais e mínimas em duas categorias. O raciocínio mudou de MDC e cortes para MMC dos preços e quantidades compradas. Resultado: 4 rolos + 3 caixas = 7 itens.
- PLQ-026: acrescentei reservas antes da distribuição; o resultado passou de 60 para **24 cestas**, com 7 kg, 9 kg e 11 kg. Antes repetia a distribuição 3:4:5 de PLM-032 com estoques escalados.
- PLM-005: o aluno agora corrige um argumento errado sobre subtração de frações. O resultado continua 1/30; H4 tem uma tarefa observável no enunciado.
- Todos os 110 itens receberam habilidades explícitas. Foram usados H1, H2, H3, H4, H5, H7, H10 e H12 conforme representação, contagem, cálculo, avaliação de argumento, decisão de compra/transporte, geometria e medidas. Referência consultada: [Matriz de referência do Inep](https://download.inep.gov.br/download/enem/matriz_referencia.pdf). A busca retornou o conteúdo da matriz; a abertura direta do PDF apresentou HTTP 502.
- Dificuldades recalibradas: PLM-052 de 3 para 2; PLM-053 de 4 para 3; PLM-058 de 4 para 2; PLM-060 de 4 para 3; PLQ-045/046 de 4 para 3; PLQ-026 de 2 para 3 após a nova etapa de reserva. Dificuldade é julgamento pedagógico, sem calibração empírica de alunos.

## Contas independentes, uma por item

| Item | Conta ou argumento a partir do enunciado | Resultado |
|---|---|---|
| PLM-001 | (12−5)/12 | 7/12 |
| PLM-002 | 1/3+1/4 | 7/12 |
| PLM-003 | consumo por relatório (3/4)/5=3/20; dois relatórios | 3/10 |
| PLM-004 | (3/4)/(1/8) | 6 |
| PLM-005 | 21/30−20/30; subtrair denominadores é inválido | 1/30 |
| PLM-006 | −4+9−3 | 2 °C |
| PLM-007 | 48−6(2+3) | 18 |
| PLM-008 | 50−3×7,50−2×4 | R$ 19,50 |
| PLM-009 | 45×2/3 | 30 |
| PLM-010 | 28÷(7/12) | 48 |
| PLM-011 | (2/3)(3/4) | 1/2 |
| PLM-012 | piso(2,5÷0,75) | 3 |
| PLM-013 | −3(4−9) | 15 |
| PLM-014 | 3/2+11/4−5/6 | 41/12 m |
| PLM-015 | 7/10−2/5 | 3/10 L |
| PLM-016 | 18/24=3/4; denominador | 4 |
| PLM-017 | 1−(3/5+2/5−1/5) | 1/5 |
| PLM-018 | (12+15+9+20)/4 | 14 |
| PLM-019 | 18÷[(3/4)(1/3)] | 72 |
| PLM-020 | (9/12−2/12)/(7/12) | 1 |
| PLM-021 | MMC(6,8) | 24 min |
| PLM-022 | MDC(36,60) | 12 |
| PLM-023 | menor despesa por categoria=MMC(18,24)=72; 72/18+72/24 | 7 |
| PLM-024 | MMC(12,15,20) | 60 s |
| PLM-025 | MDC(24,40,56) | 8 m |
| PLM-026 | 0,36,72,108,144,180 | 6 |
| PLM-027 | múltiplos de 36; primeiro acima de 100 | 108 |
| PLM-028 | lado 80; (80/16)(80/20) | 20 |
| PLM-029 | MDC=12; 84/12 | 7 |
| PLM-030 | MMC(8,10) | 40 min |
| PLM-031 | MMC(5,7)+2; excluir estoque 2 | 37 |
| PLM-032 | MDC(72,96,120) | 24 |
| PLM-033 | 180,360,540,720; excluir zero | 4 |
| PLM-034 | MDC=18; (54+90)/18 | 8 |
| PLM-035 | espaçamento 6; perímetro 144; contorno fechado | 24 |
| PLM-036 | MMC(14,21,28) | 84 dias |
| PLM-037 | divisores comuns 1,2,4,8,16; único >10 | 16 |
| PLM-038 | 12×180/36; MDC(36,60)=12 | 60 |
| PLM-039 | múltiplo de 2³3² com expoentes pares: 2⁴3² | 144 |
| PLM-040 | múltiplos de 180 positivos até 400: 180,360 | 2 |
| PLM-041 | 3 opções em 4 posições | 81 |
| PLM-042 | 2³×2⁵=2⁸ | 256 |
| PLM-043 | 5⁶/5⁴=5² | 25 |
| PLM-044 | 9 linhas de 9 lâmpadas | 81 |
| PLM-045 | 1/1000 | 0,001 L |
| PLM-046 | 0,45/1000 | 4,5×10⁻⁴ m |
| PLM-047 | 6,2×100000 | 620000 bytes |
| PLM-048 | 12×2⁵ | 384 |
| PLM-049 | 20000×3000 | 6×10⁷ |
| PLM-050 | 90000000/300000 | 300 s |
| PLM-051 | 1+1/2 | 1,5 |
| PLM-052 | 16−16 | 0 |
| PLM-053 | 2⁶/2⁴ | 4 |
| PLM-054 | 10⁻²/10⁻⁵=10³ | 1000 |
| PLM-055 | 3200000+750000 | 3,95×10⁶ |
| PLM-056 | 8×1024 | 8192 bytes |
| PLM-057 | 3,9,27,81,243: cinco etapas | 5 |
| PLM-058 | 48×10⁻⁶=4,8×10⁻⁵; expoente | −5 |
| PLM-059 | 0,002×70000 | 140 g |
| PLM-060 | 3 cubinhos por direção; 3³ | 27 |
| PLQ-001 | 1−15/24−4/24 | 5/24 |
| PLQ-002 | −120+85−40 | −75 reais |
| PLQ-003 | (5/6)/10 | 1/12 kg |
| PLQ-004 | teto(166/40) | 5 ônibus |
| PLQ-005 | 80×3/8=30; 75×2/5=30 | 0 L |
| PLQ-006 | 63×3/7 | 27 |
| PLQ-007 | 6×4,50−5×5,20 | R$ 1,00 |
| PLQ-008 | 8/12+9/12 | 17/12 L |
| PLQ-009 | 9/10−6/10 | 3/10 |
| PLQ-010 | 158−12×13 | 2 |
| PLQ-011 | 8/12−3/12 | 5/12 |
| PLQ-012 | (156−24)/6 | R$ 22,00 |
| PLQ-013 | 68÷(17/40) | 160 |
| PLQ-014 | 5×[18−7−3] | 40 |
| PLQ-015 | (2/3)(1/4) | 1/6 |
| PLQ-016 | teto(73/8) | 10 caixas |
| PLQ-017 | comprimentos na razão 1:2; unidade em 3 partes | 1/3 |
| PLQ-018 | 6+6 | 12 |
| PLQ-019 | 3/5−7/12=36/60−35/60 | 1/60 |
| PLQ-020 | (48+17)/5 | 13 |
| PLQ-021 | 91=7×13; 143=11×13 | 13 cm |
| PLQ-022 | MMC(18,30) | 90 s |
| PLQ-023 | 63+3; excluir quantidade 3 | 66 |
| PLQ-024 | MDC=48; (2−1)+(3−1) cortes | 3 |
| PLQ-025 | 42,84; excluir zero | 2 |
| PLQ-026 | MDC(168,216,264); cestas 7:9:11 | 24 |
| PLQ-027 | MMC=72; dias 72 e 144 | 2 |
| PLQ-028 | lado 105; (105/15)(105/21) | 35 |
| PLQ-029 | MDC=6; 198/6 | 33 |
| PLQ-030 | 18×540/90; MDC(90,108)=18 | 108 |
| PLQ-031 | período 40; somente 40 e 80; excluir 0 e 120 | 2 |
| PLQ-032 | 60=2²×3×5; completar 3 e 5 | 900 |
| PLQ-033 | MDC=3; (87+117)/3 | 68 |
| PLQ-034 | 72/108=2/3; numerador | 2 |
| PLQ-035 | próxima coincidência dia 48; 48−17 | 31 dias |
| PLQ-036 | (1/9)×9 | 1 |
| PLQ-037 | 5⁶/5⁵ | 5 |
| PLQ-038 | 1/8+1/4 | 3/8 L |
| PLQ-039 | 27−(−27) | 54 |
| PLQ-040 | 5×81 | 405 |
| PLQ-041 | 0,0006/0,02 | 0,03 g/mL |
| PLQ-042 | (8−3,5)×10⁶ | 4,5×10⁶ |
| PLQ-043 | 6000×250 | 1,5×10⁶ cm |
| PLQ-044 | 70×10⁻⁹ | 7×10⁻⁸ m |
| PLQ-045 | 256/8=32=2⁵; expoente | 5 |
| PLQ-046 | 90000×8000=7,2×10⁸; expoente | 8 |
| PLQ-047 | 0,009/3 | 0,003 g por mL |
| PLQ-048 | 2⁵×5⁵=10⁵ | 100000 |
| PLQ-049 | 2¹⁰/2⁷=2³ | 8 |
| PLQ-050 | 640/16 | 40 |

## Semelhanças e limites

Li os enunciados originais de `basica.ts` e das seis coleções `missoes/r3-m*-*.ts`. Há sobreposição de modelos fundamentais, que não é eliminada por serem textos autorais explícitos: PLM-004/BAS-113 usam porções fracionárias de líquido; PLM-019/BAS-103 recuperam o total após duas retiradas; PLM-026/BAS-206 contam coincidências incluindo a inicial; PLQ-044/BAS-306/BAS-314 convertem nanômetros em metros. PLM-028/PLQ-028 também compartilham o modelo de quadrado mínimo de retângulos, e PLM-038/PLQ-030 usam a mesma identidade de MDC/MMC. São textos e dados distintos, porém não certifico novidade semântica de todos os modelos matemáticos.

PLQ-017, PLQ-026, PLM-003 e PLM-023 foram alteradas para remover quatro repetições especialmente próximas. A coleção final é escrita explicitamente, sem gerador de questões ou substituição automática de parâmetros. Não usei busca global de plágio na internet nem revisão por professor/alunos. As verificações matemáticas e de metadados não substituem calibração pedagógica.

Esta foi a revisão independente solicitada pelo agente principal, sem nova delegação. Segunda arquitetura/modelo externo não foi invocada: contexto de subagente não interativo, sem autorização para CLI externo.

Validação executada: `node node_modules/jest/bin/jest.js planiciesExpansion --runInBand --cacheDirectory ../jest-cache`. A execução final, depois das reescritas de PLM-003 e PLM-023, passou com **115/115 testes aprovados**, incluindo 110 oráculos individuais. Não executei a suíte inteira, a interface ou build nativo; esses arquivos não foram alterados.

### Ajustes finais da sessão principal

PLQ-028 foi substituída por cruzamento de condições de divisibilidade, paridade e MDC (35 fragmentos), removendo a repetição do mosaico mínimo. PLQ-029 passou a tratar ciclos com início defasado: sinais a cada 14 s desde zero e a cada 21 s desde 14; chegada em 23 s, próxima coincidência em 56 s, espera de 33 s. PLQ-030 passou a otimizar a diferença entre pares de inteiros com MDC 18 e MMC 540: fatores coprimos com produto 30, melhor par (5,6), números (90,108). As três respostas foram recalculadas e preservam os oráculos independentes, com verificadores que percorrem os dados do enunciado. Os 272 testes de conteúdo passaram após as reescritas.
