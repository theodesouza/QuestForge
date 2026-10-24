# Preservar o progresso atual (migração única)

Situação: o progresso que existe hoje no seu celular foi criado **antes** das contas e vive só no banco
`questforge.db` do aparelho. Este procedimento o associa à sua conta Google **uma única vez**, sem apagar nem
alterar nada do que está no celular. Não é uma função do app publicado: existe apenas na build do perfil
`legacy-migration` e **não entra** no bundle de produção (verificado por `npm run verify:no-legacy`).

**Nada foi executado ainda.** Este documento descreve o que vai acontecer e o que depende de você.

## Como funciona (resumo)

```
 questforge.db  ──(somente leitura)──►  backup JSON  (conferido por checksum; você guarda fora do celular)
 (legado, v3)                    └────►  questforge-<uid>.db  (banco novo da conta)
 NUNCA é alterado                                │
                                                 ▼
                                   Firestore  users/{uid}/save + attempts
                                                 │
                         relê a nuvem e o banco novo e compara campo a campo com o legado
```

Garantias (todas com teste em `src/legacy/__tests__/migration.test.ts`):

1. **Somente leitura:** a conexão ao banco legado usa `PRAGMA query_only = ON` — o próprio SQLite recusa escrita.
   O teste confere que o arquivo permanece **idêntico byte a byte** e na versão de esquema 3, sem tabelas novas.
2. **Nada é apagado nem reinicializado.** O banco legado fica no aparelho até **você** decidir removê-lo.
3. **Backup verificável antes de qualquer envio:** o app grava um JSON com **todo** o estado (inclusive a sessão
   em andamento) e o histórico de respostas, **relê o arquivo gravado** e confere checksum e resumo. Só então o botão
   de migrar é liberado — e só depois de você marcar que guardou o arquivo fora do celular.
4. **Conta correta:** a tela mostra nome e e-mail e exige confirmação explícita. Se você definir
   `EXPO_PUBLIC_LEGACY_EXPECTED_EMAIL`, qualquer outra conta é **barrada** (nada é associado a ela).
5. **Idempotente:** a nuvem recebe o documento com uma impressão digital do conteúdo (`legacyImport.fingerprint`).
   Repetir reconhece a mesma impressão digital e não grava, não soma e não duplica nada.
6. **Não mistura:** se a conta já tiver dados na nuvem (que não sejam esta migração) ou o banco novo já tiver
   progresso próprio, a migração **para** e explica.
7. **"Concluída" só após conferir:** relê o documento e os lotes de tentativas **da nuvem** e o banco novo, e
   compara XP, nível, Tinta, missões, estrelas, chefões, itens, questões vistas, recompensas registradas, respostas,
   o estado inteiro (hash) e a sessão/batalha em andamento. Qualquer divergência impede a conclusão.
8. **Retomável:** queda de internet ou fechamento no meio não deixa estado pela metade — repetir continua de onde parou.

## O que depende de você

1. Configurar o Firebase — [CLOUD_SETUP.md](CLOUD_SETUP.md), passos 1 a 5 (projeto, Google, app Android, Firestore + regras).
2. (Recomendado) restringir a conta: na EAS, ambiente `preview`:

   ```bash
   npx eas-cli@latest env:set --name EXPO_PUBLIC_LEGACY_EXPECTED_EMAIL --value "seu-email@gmail.com" --environment preview --visibility plaintext
   ```

3. Gerar a build de migração (assina com a **mesma chave** do APK atual — por isso instala por cima e o banco
   local é preservado):

   ```bash
   npx eas-cli@latest build --platform android --profile legacy-migration
   ```

   Se for gerar localmente, **limpe o cache do Metro** (`--clear`): ele não considera `EXPO_PUBLIC_*` e poderia
   reaproveitar um bundle feito com a flag no valor errado.

## No celular (passo a passo)

> **Não desinstale o QuestForge em nenhum momento deste procedimento.** Desinstalar apaga o `questforge.db`.

1. **Instale a build `legacy-migration` por cima** da atual (abra o link/APK e escolha *Atualizar*). Pacote e
   assinatura iguais, `versionCode` 5 > 4: o Android mantém os dados.
2. Abra o app. Aparece a tela **"Guarde a sua jornada"** → toque em **Entrar com o Google** e escolha a **conta correta**.
3. Como existe progresso antigo sem conta, o app abre a tela **"Associar o progresso antigo à sua conta"**
   (nenhum perfil novo é criado e nada é enviado antes disso). Siga os blocos:
   1. **O que há neste aparelho** — confira nível, XP, Tinta, missões, estrelas, itens, respostas. Anote.
   2. **Conta** — confira o e-mail; marque *Confirmo: é a minha conta*.
   3. **Backup fora do celular** — toque em *Criar backup e compartilhar*; salve o JSON no Drive/e-mail/outro lugar
      **fora do aparelho**; marque *Guardei o arquivo*.
   4. **Migrar agora** — acompanhe as etapas (conferindo → copiando → enviando → relendo). Ao final, a lista
      **antes × depois** deve estar toda com ✓ (a cópia na nuvem e o banco novo, idênticos ao legado).
4. Toque em **Concluir e abrir o QuestForge** e use o app normalmente por alguns dias.

Se algo der errado, a tela mostra o que divergiu; nada é marcado como concluído. Você pode **repetir** com segurança
ou tocar em **Agora não** (o app abre sem migrar; o banco antigo continua guardado).

## Depois: confirmar e só então limpar

- O banco `questforge.db` e o arquivo de backup **não são apagados automaticamente** — apague só depois de usar
  o app e confirmar que está tudo certo (regra 9 do pedido).
- **Teste de recuperação:** com o progresso já na nuvem **e o JSON guardado fora do celular**, instalar o app num
  segundo aparelho (ou desinstalar/reinstalar) e entrar com a mesma conta deve trazer tudo de volta. Atenção: no
  mesmo celular, **desinstalar apaga o banco legado** — só faça depois de confirmar.
- Para a Play Store: a troca de chave de assinatura também obriga a desinstalar; a mesma regra vale — migração
  conferida e backup guardado primeiro. Depois, publique pelo perfil `production` (rode antes
  `npm run verify:no-legacy`).

## Dúvidas frequentes

**E se eu entrar com a conta errada?** Com `EXPO_PUBLIC_LEGACY_EXPECTED_EMAIL` definido, a tela bloqueia e só
oferece *Sair e trocar de conta* ou *Agora não*. Sem a variável, a confirmação explícita com o e-mail à vista é a
salvaguarda — confira antes de marcar.

**E se eu usar uma build comum (`preview`/`production`) por engano?** O app abre normalmente, **sem** a tela de
migração, com um perfil novo para a conta. O banco antigo continua intacto no aparelho. Se você apenas entrar e sair, nada
foi criado na nuvem e a migração funciona depois. Se chegar a **concluir o onboarding** (o que cria dados na
conta), a migração depois **recusará** (para não misturar) — nesse caso, apague o documento
`users/{uid}/save/state` no console do Firebase (conta de teste, sem valor) e rode a migração.

**E se o banco antigo for de uma versão mais velha (esquema < v3)?** A tela avisa e não migra nada. Abra uma vez
a versão 0.2.x (ela atualiza o esquema sem apagar nada) e tente de novo. O seu APK atual (versionCode 4) já está no v3.

**A tela de migração aparece em toda abertura?** Enquanto houver progresso legado ainda não migrado para a conta
que entrou. *Agora não* a esconde só naquela abertura.

**Como remover a ferramenta de vez?** Publique a build `production` (sem a ferramenta). Para o código, basta apagar
`src/legacy/` e as duas condicionais `EXPO_PUBLIC_LEGACY_MIGRATION` em `src/state/session.ts` e `src/app/_layout.tsx`.
