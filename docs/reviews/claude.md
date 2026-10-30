# Revisão externa das 330 questões

Concluída em 22/10/2026 pelo Claude Code, modelo `claude-sonnet-5-5` (provedor `firstParty` informado pelo CLI). Foram enviados três lotes cegos de 110 questões, contendo somente ID, assunto, dificuldade, enunciado, pergunta e alternativas. Não foram enviados código, gabaritos, dicas, verificadores, saves ou dados de conta.

Execução: `claude -p --safe-mode --permission-mode dontAsk --tools "" --no-session-persistence --output-format json --json-schema <schema>`, com o material pela entrada padrão. As customizações e ferramentas ficaram desativadas. A saída estruturada exigia respostas A–E, cobertura e observações por questão. A chamada anterior em modo de planejamento foi descartada porque não entregou avaliação.

## Resultado conferido

- 110 respostas por lote, sem IDs ausentes, extras ou duplicados: **330/330**.
- **Zero divergências** entre as respostas independentes e os gabaritos do banco.
- Os lotes foram comparados com as questões do código publicado `b1777c0`: eram idênticos.
- As três execuções terminaram com sucesso, sem buscas na web nem pedidos de permissão de ferramentas.

## Reconciliação das observações

| Questão | Observação do Claude | Decisão após conferir a fonte |
| --- | --- | --- |
| VAG-014 | A largura da passarela não é necessária para contar as tábuas; resposta única de 36. | Manter como escolha pedagógica: a orientação das peças exige selecionar a dimensão relevante. A resolução explica a diferença entre comprimento de cada tábua e quantidade de faixas. |
| MEM-019 | Sugere explicitar que o rendimento deve ser maior ou igual à tarifa; confirma 2 meses. | Manter: “cobrir a tarifa” já exige atingir seu valor integral, e a resolução explicita a comparação. R$ 19,20 por mês × 2 = R$ 38,40 ≥ R$ 36,00. Não há mudança de sentido ou gabarito a fazer. |
| MEC-044 | A contagem de pares depende de comprar somente quando o anterior acaba; confirma economia de R$ 30,00. | Sem alteração: o enunciado já declara essa regra e que não há compra após os 30 meses. São cinco pares de R$ 150,00 contra três de R$ 240,00. |

Não houve achado matemático acionável nem necessidade de alterar o conteúdo publicado. Esta é uma verificação adicional por IA; não substitui avaliação pedagógica humana ou calibração com alunos.
