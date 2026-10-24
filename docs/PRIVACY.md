# Privacidade, LGPD e Google Play — rascunhos

> Rascunhos técnicos para você revisar (e, se possível, validar com um profissional). Não são aconselhamento
> jurídico. Troque `<…>` pelos seus dados reais.

## O que o app guarda

| Dado | Onde | Para quê |
| --- | --- | --- |
| Identificador da conta (`uid`) | nuvem (Firestore) e aparelho | vincular o progresso à conta |
| Nome e e-mail da conta Google | **só no aparelho** (exibidos em *Conta e nuvem*); não são enviados ao Firestore | mostrar qual conta está em uso |
| Progresso: nome/apelido digitado, objetivo, meta diária, XP, nível, missões, itens, estatísticas por questão, histórico de respostas, ajustes | aparelho e nuvem | continuar o estudo, restaurar após reinstalar, usar em mais de um aparelho |

Não há anúncios, analytics, rastreamento, nem coleta de localização, contatos ou mídia. O apelido é opcional.

## Direitos do titular (LGPD, art. 18) e como o app atende

| Direito | No app |
| --- | --- |
| Acesso / portabilidade | Ajustes → **Exportar meus dados** (JSON legível, com checksum) |
| Correção | Ajustes → Perfil (nome, meta diária) |
| Eliminação | Ajustes → **Excluir conta e dados** (reconfirma com o Google; apaga nuvem, conta de login e banco local) |
| Reiniciar o progresso | Ajustes → **Apagar todo o progresso** (vale para a conta toda) |
| Revogar o consentimento | sair da conta e/ou excluir a conta; revogar o acesso em myaccount.google.com |

Segurança: tráfego criptografado (TLS); autorização por regras do Firestore (cada conta só acessa os próprios
dados); sessão guardada no cofre do sistema (Android Keystore). Backup automático do Android **desativado** para o app.

## Rascunho de política de privacidade (para publicar numa URL)

**QuestForge — Política de Privacidade** (última atualização: `<data>`)

O QuestForge é um aplicativo de estudo de matemática. Para guardar o seu progresso e permitir usá-lo em mais de
um aparelho, você entra com a sua conta Google. Tratamos apenas:

1. o identificador da sua conta (gerado pelo Firebase Authentication) e
2. o seu progresso no app (nível, XP, missões concluídas, itens, estatísticas de estudo e histórico de respostas).

O nome e o e-mail da sua conta Google são usados no próprio aparelho para mostrar qual conta está ativa e não são
armazenados em nossos servidores. Não usamos os dados para publicidade, não os vendemos e não os compartilhamos com
terceiros, exceto o provedor de infraestrutura (Google Firebase), que os processa em nosso nome.

Base legal: execução do serviço que você solicitou (LGPD, art. 7º, V) e o seu consentimento ao entrar com a conta.
Você pode, a qualquer momento, exportar ou excluir os seus dados pelo app (Ajustes) ou solicitando em `<e-mail ou
formulário>`. Atendemos pedidos de exclusão em até `<prazo>`. Menores de 18 anos devem usar o app com ciência de um
responsável. Controlador: `<seu nome/razão social>` — contato: `<e-mail>`.

## Google Play — formulário *Data safety* (guia)

- **Coleta de dados:** sim.
- **Tipos:** *Informações pessoais → ID de usuário* (o `uid`); *Atividade no app → interações no app / outro
  conteúdo gerado pelo usuário* (progresso). Marque *e-mail* e *nome* **somente se** você passar a enviá-los à
  nuvem (hoje não enviamos).
- **Finalidade:** funcionalidade do app / gerenciamento de conta. Nenhuma para publicidade ou analytics.
- **Compartilhamento com terceiros:** não (o Firebase atua como operador/provedor de serviço).
- **Criptografia em trânsito:** sim. **Pedido de exclusão:** sim — dentro do app **e** por URL pública
  (`<URL da página de exclusão de conta>`, obrigatória para apps com criação de conta).
- Declare que o app **não** é direcionado a crianças (público: estudantes do ensino médio) e confira a política de
  *Famílias* se o público incluir menores de 13.

## Pendências suas

- Publicar a política em uma URL e a página de exclusão de conta (a Play exige as duas).
- Definir controlador, contato e prazo de atendimento.
- Revisar com um profissional se o público incluir menores de 18 anos (consentimento parental, LGPD art. 14).
