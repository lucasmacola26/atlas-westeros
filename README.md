# ATLAS DE WESTEROS — VERSÃO DE TRABALHO 3

Biblioteca visual para acompanhar os audiolivros de **As Crônicas de Gelo e Fogo** pelo iPhone. Esta é uma versão local para revisão; **nada foi publicado no GitHub**.

## Incluído nesta entrega

- **67 retratos**, provenientes exclusivamente do arquivo `ATLAS GoT.zip` enviado pelo usuário, convertidos de PNG para WebP para melhorar o desempenho. As fotos NÃO foram substituídas nem regeradas.
- **5 livros, 344 capítulos narrativos** na ordem brasileira (prólogos e epílogos incluídos, apêndices excluídos), conforme [Índice dos capítulos — Gelo e Fogo Wiki](https://wiki.geloefogo.com/index.php/%C3%8Dndice_dos_cap%C3%ADtulos).
- **67 registros de personagens**, todos com retratos: não foram acrescentados personagens da lista de ausentes, conforme sua decisão.
- **Fichas breves** com nome, casa/família, função, idade quando estimável, aparência quando descrita e nota contextual. Sem vinculação a elenco televisivo.
- **3 modos**: Neste capítulo; Conhecidos até aqui; Todos os retratos (após aviso de possíveis spoilers).
- **Retomada** em A Fúria dos Reis, capítulo 55, Catelyn VII, inicialmente não concluído.
- **Proteção editorial**: se o capítulo está em andamento, fichas do próprio capítulo não são liberadas ainda, com exceção do narrador explicitado no título. Participantes conhecidos de capítulos anteriores podem aparecer no filtro “Neste capítulo”, com aviso.
- **Gestão**: adicionar e editar fichas, cadastrar presenças, atualizar informações por fase, exportar/importar backup JSON, lembrar progresso e instalar como app.
- **Uso offline**: service worker armazena os arquivos do app e os 67 retratos completos/miniaturas após uma instalação online concluída (no GitHub Pages ou outro servidor HTTPS).

## Importantíssimo: o que AINDA NÃO está pronto

O **índice** de 344 capítulos está montado. A curadoria de presenças por capítulo **não** está completa. Sete capítulos receberam uma associação editorial inicial, explicitamente rotulada como **parcial**; nos demais, o app procura mostrar somente o narrador quando há uma imagem disponível. A informação da introdução de muitos personagens usa um marcador de liberação **conservador**, não um índice certificado de primeira aparição. Não se deve interpretar ausência do retrato como ausência do personagem na narrativa. Idades e cargos são fichas iniciais e precisarão de atualização ao longo dos cinco volumes. **Este programa não lê automaticamente os livros.**

Livro 3 em diante: navegação disponível, aparições dos participantes secundários ainda pendentes de revisão.

## Como pré-visualizar antes de publicar

### Sem instalar nada (computador)

1. Extraia o ZIP.
2. Abra `index.html` no navegador (Chrome, Edge, Safari ou Firefox). A galeria e os retratos são arquivos locais.
3. Se o navegador bloquear a gravação local ao abrir pelo protocolo `file://`, as alterações podem não persistir. Para usar todos os recursos, prefira rodar um servidor HTTP local.

### Servidor local (recomendado no PC, antes de publicar)

No diretório descompactado, abra um terminal e execute:

```bash
python -m http.server 8080
```

No navegador do mesmo computador, visite `http://localhost:8080`.

Se não houver Python instalado, use a extensão **Live Server** do VS Code ou outro servidor de arquivos estáticos.

### Futuramente, quando você aprovar o aplicativo

1. Crie um repositório GitHub (ex.: `atlas-westeros`).
2. Envie o **conteúdo** da pasta descompactada, preservando `retratos/`.
3. Nas configurações do repositório, habilite Pages para a branch `main`, pasta `/ (root)`.
4. Abra a URL do Pages no Safari do iPhone e adicione à Tela de Início.
5. Espere a primeira abertura online para o cache das imagens (7,6 MB aproximadamente). Depois, o app poderá funcionar offline, sujeito à política de armazenamento do iOS.

**Não publiquei nada nem usei sua conta do GitHub.** Se o repositório for público, os retratos ali incluídos também serão públicos.

## Dados pessoais / backups

- Os **retratos originais do seu ZIP** fazem parte dos arquivos do aplicativo.
- Alterações e fotos adicionais feitas pelo editor são armazenadas no navegador em IndexedDB; o progresso em localStorage.
- Faça backup pela engrenagem antes de atualizar o projeto ou limpar dados do navegador.
- O armazenamento do Safari e o de um app adicionado à Tela de Início podem ser independentes.
- Reiniciar o catálogo restaura as 67 fotos incorporadas, mas **apaga suas edições locais**.

## Estrutura

```
index.html           tela principal
style.css            estilos para iPhone e computador
app.js               navegação, edição e armazenamento local
data.js              livros e 344 capítulos
catalog.js           67 fichas com imagens
retratos/mini/       miniaturas leves para galeria
retratos/grandes/    retratos para fichas ampliadas
sw.js                cache offline
manifest.webmanifest instalação como PWA
CURADORIA.md         estado editorial e próximos passos
```

Esta é uma versão de trabalho; a próxima etapa é conferir sistematicamente as participações livro por livro, começando pelos volumes I e II, sem alterar os retratos existentes.
