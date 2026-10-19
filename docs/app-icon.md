# Ícone do QuestForge — 0.2.1

Arte fornecida pelo usuário: livro aberto, caminho dourado, montanhas, estrela de bússola e órbitas. O editor de imagens integrado removeu o fundo escuro externo à placa arredondada; o céu ilustrado dentro dela foi preservado.

- `assets/app-icon-cutout.png`: recorte 1024 × 1024 com cantos transparentes; ícone Android legado.
- `assets/icon.png`: versão opaca 1024 × 1024 para plataformas que exigem fundo preenchido.
- `assets/android-icon-foreground.png`: arte central de 600 px em tela transparente 1024 × 1024, com margem para as máscaras adaptativas. Fundo nativo azul `#071038`, sem o antigo `backgroundImage`.
- `assets/android-icon-monochrome.png`: adaptação branca do livro, estrela e órbita, em alpha, para ícones temáticos do Android 13+; símbolo central de 560 px.
- `assets/favicon.png`: 48 × 48. A tela de abertura mantém a arte anterior.

O editor fez o recorte e a adaptação monocromática. Depois, os arquivos foram normalizados para os tamanhos nativos sem redesenhar a arte. Dimensões, transparência e opacidade foram verificadas; as máscaras circular e quadrada arredondada foram conferidas visualmente. Tipos e lint também foram conferidos.

Ícones fazem parte do aplicativo nativo. A alteração exige APK 0.2.1, `versionCode` 5, com o mesmo pacote e a mesma chave de assinatura. O runtime passa a 0.2.1 pelo critério `appVersion`; APKs antigos continuam no runtime 0.2.0. Uma atualização EAS Update não troca o ícone instalado. Não é preciso desinstalar o aplicativo para instalar o APK novo por cima.
