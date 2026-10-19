# Ícone do QuestForge — 0.2.1

Arte fornecida pelo usuário: livro aberto, caminho dourado, montanhas, estrela de bússola e órbitas. O editor de imagens integrado removeu o fundo escuro externo à placa arredondada; o céu ilustrado dentro dela foi preservado.

- `assets/app-icon-cutout.png`: recorte 1024 × 1024 com cantos transparentes; ícone Android legado.
- `assets/icon.png`: versão opaca 1024 × 1024 para plataformas que exigem fundo preenchido.
- `assets/android-icon-foreground.png`: arte central de 600 px em tela transparente 1024 × 1024, com margem para as máscaras adaptativas. Fundo nativo azul `#071038`, sem o antigo `backgroundImage`.
- `assets/android-icon-monochrome.png`: adaptação branca do livro, estrela e órbita, em alpha, para ícones temáticos do Android 13+; símbolo central de 560 px.
- `assets/favicon.png`: 48 × 48. A tela de abertura mantém a arte anterior.

O editor fez o recorte e a adaptação monocromática. Depois, os arquivos foram normalizados para os tamanhos nativos sem redesenhar a arte. Dimensões, transparência e opacidade foram verificadas; as máscaras circular e quadrada arredondada foram conferidas visualmente. Tipos e lint também foram conferidos.

Ícones fazem parte do aplicativo nativo. A alteração exige APK 0.2.1, `versionCode` 5, com o mesmo pacote e a mesma chave de assinatura. O runtime passa a 0.2.1 pelo critério `appVersion`; APKs antigos continuam no runtime 0.2.0. Uma atualização EAS Update não troca o ícone instalado. Não é preciso desinstalar o aplicativo para instalar o APK novo por cima.

APK concluído em 19/10/2026 às 19h38 de Brasília: build EAS `1da63e0d-71bb-49fa-95d2-a1e541c7ccb8`, código `1c81fcc11bd98ab961115bc709658818610285ae`, perfil e canal `preview`. Pacote `com.questforge.app`, versão 0.2.1, versionCode 5 e runtime nativo 0.2.1 conferidos no arquivo final. Ícone extraído do APK conferido visualmente. A assinatura foi validada com a biblioteca oficial `apksig` e seu certificado SHA-256 é o mesmo das versões anteriores: `FAC61745DC0903786FB9EDE62A962B399F7348F0BB6F899B8332667591033B9C`.

Arquivo: 118.573.038 bytes. SHA-256 do APK: `FA10069787143B26DDC5FCCDAB9ACD333B2517A733804715B8C42585A95ECA66`. Não foi instalado em aparelho físico nesta validação.
