# Questões e evolução dos chefes

Base: `aae38b1`, de 22/10/2026, incluindo autenticação Google e sincronização. Branch: `codex/questoes-chefes-2026-10-22`.

## Conteúdo integrado

O banco passou de **314 para 644 questões**, preservando os IDs e arquivos antigos. Foram adicionadas **20 questões para cada uma das nove missões (180)** e **50 extras próprios para cada um dos três chefes (150)**. Todos os itens novos têm cinco alternativas, duas dicas, explicação do conceito, resolução com contas e verificador numérico.

As consultas por assunto são compartilhadas: os novos itens também entram nas expedições, nos reforços e nos Ecos. Os pools totais dos chefes incluem tanto seus extras quanto as questões das missões compatíveis: Golem 96→206; Mercador 93→203; Quimera 79→189. As missões mantêm cinco questões por tentativa e seus perfis de dificuldade.

Na revisão foram reescritas situações próximas de questões antigas, esclarecidas bases e unidades, recalibradas dificuldades e atribuídas habilidades específicas do ENEM. Vale e Planícies têm 110 resultados independentes registrados em testes por região. Mercado tem verificações de todos os itens e uma segunda resolução cega de 110 enunciados; a comparação editorial final dessa segunda revisão foi interrompida pelo limite de uso. As dificuldades são avaliações editoriais de IA, sem calibração com alunos ou revisão humana.

## Combate e apresentação

- **Selos de Conhecimento:** um acerto sem dicas nem chute em um subassunto novo acende uma runa. Três subassuntos diferentes liberam a **Convergência (+18 de dano)** e reiniciam os selos. Erros não os apagam. Os dados vêm dos turnos já persistidos, sem migração; saves antigos continuam válidos.
- Golem com ombreiras de basalto, núcleo e fragmentos revelados na segunda fase; Mercador com manto, mãos articuladas e cofre flutuante; Quimera com asas, armadura e cabeças que reagem à perda de vida.
- Arena vetorial com constelação de selos, fases e reações curtas. Movimento usa as dependências Reanimated/SVG existentes, para fora de foco e em segundo plano, e respeita a preferência de movimento reduzido.
- Chefes priorizam inéditas; depois, as respondidas há mais tempo. A batalha exclui perguntas já usadas enquanto houver alternativas. Nas expedições, o peso por assunto evita que um banco maior domine apenas por volume.
- XP, recompensas, progresso, regras de dicas/chute e proteção antifarm permanecem. O fixture antifarm passou a confirmar que realmente esgotou as inéditas, pois a divisão por cinco não considerava a distribuição de dificuldades.

## Verificação e reprodução

Executados: 27 suítes, **566 testes aprovados**, nenhum reprovado e um teste de autoria já condicionalmente ignorado sem `QF_BATCH`. Após as três últimas reescritas, passaram novamente os **272 testes de conteúdo e 133 testes de domínio**. TypeScript e lint sem cache passaram. Exportação web de QA e exportação Android com bytecode Hermes passaram; não foi gerado APK nem publicada atualização.

Comandos: `npm test -- --runInBand --cacheDirectory ../jest-cache`, `npm run typecheck`, `npm run lint -- --no-cache`, `EXPO_PUBLIC_QA=1 npx expo export --platform web --output-dir dist-web`. No PowerShell, definir variáveis por `$env:NOME='valor'`. A exportação Android precisou de `TEMP`/`TMP` dentro de `work/` para o compilador Hermes gravar o bytecode no ambiente isolado.

O relatório JSON de Jest registra sucesso, mas o processo global permanece aberto com atividade assíncrona após terminar. Não foi usado `--forceExit`; execuções focadas encerraram normalmente. A prévia no navegador verificou as três batalhas reais, dano, combo, Convergência, mudança de fase, console e ausência de estouro horizontal em 320 px. `/vfx-lab?grid=bosses`, somente com `EXPO_PUBLIC_QA=1`, permite repetir a inspeção; a preparação de combate dessa tela é restrita ao preview web em memória.

Limites: sem teste em aparelho físico, sem benchmark de FPS nativo, sem login Google/Firestore reais nem emuladores de regras. A exportação informa ausência do `google-services.json` local; a configuração de nuvem existente não foi alterada. A revisão adicional por Claude, autorizada somente para questões, **não foi executada**: a aprovação automática falhou por limite de uso, não por avaliação de insegurança. O pacote cego contém apenas enunciados e alternativas, sem código, gabaritos ou dados de conta.
