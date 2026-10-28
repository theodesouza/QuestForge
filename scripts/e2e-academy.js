/**
 * Teste ponta a ponta da Academia no navegador (pré-visualização web), com capturas de tela:
 * erro numa questão da expedição → nota da alternativa errada e ponte "Rever na Academia" →
 * aba Academia → curso → aula → etapa (laboratório com missão, exemplo guiado, verificação
 * com feedback) → modos Praticar (com dica) e Desafiar → uma segunda aula (cilindro).
 *
 * Uso (mesmo build de QA do e2e-web.js):
 *   EXPO_PUBLIC_QA=1 npx expo export --platform web --output-dir dist-web
 *   python3 -m http.server 8090 --directory dist-web &
 *   node scripts/e2e-academy.js e2e-academy-shots http://localhost:8090/
 *
 * Sai com código 1 se algum passo falhar ou se houver erro no console.
 */
const path = require('path');
let pw;
try { pw = require('playwright'); } catch { pw = require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); }
const OUT = process.argv[2] || 'e2e-academy-shots';
require('fs').mkdirSync(OUT, { recursive: true });
const URL = process.argv[3] || 'http://localhost:8090/';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await pw.chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
  let n = 0;
  const shot = async (name) => { await wait(600); await page.screenshot({ path: `${OUT}/${String(++n).padStart(2, '0')}-${name}.png` }); };
  const click = async (name, exact = false) => { await page.getByRole('button', { name, exact }).first().click(); await wait(350); };
  const state = () => page.evaluate(() => globalThis.__qf.store.getState());
  const current = () => page.evaluate(() => {
    const g = globalThis.__qf.store.getState().game;
    const id = g.session ? g.session.queue[g.session.index] : null;
    if (!id) return null;
    return { id, answer: globalThis.__qf.shown(id, g.session.id, globalThis.__qf.getQuestion(id).answer) };
  });
  const dismiss = async () => {
    for (let k = 0; k < 6; k++) {
      const s = await state();
      if (!s.celebrations.length && !s.reveals.length) break;
      await page.getByRole('button', { name: 'Continuar' }).last().click();
      await wait(600);
    }
  };

  await page.goto(URL);
  await wait(2500);
  await click('Começar a jornada');
  await page.getByLabel('Nome ou apelido').fill('Ana');
  await click('Continuar'); await click('Continuar'); await click('Continuar');
  await click('Primeira expedição');
  await wait(1200);

  // 1ª questão errada de propósito: o feedback mostra a nota da alternativa e a ponte para a Academia.
  for (let i = 0; i < 3; i++) {
    const q = await current();
    if (!q) break;
    const key = i === 0 ? ['A', 'B', 'C', 'D', 'E'].find((k) => k !== q.answer) : q.answer;
    await page.getByRole('radio', { name: new RegExp(`^Alternativa ${key}:`) }).click();
    await click('Confirmar resposta');
    await wait(500);
    if (i === 0) {
      await shot('feedback-erro-com-nota');
      const bridge = await page.getByRole('button', { name: /Academia/ }).count();
      if (!bridge) throw new Error('feedback sem ponte para a Academia');
    }
    await dismiss();
    const more = await page.evaluate(() => { const s = globalThis.__qf.store.getState().game.session; return s && s.queue[s.index]; });
    await click(more ? 'Próxima questão' : 'Concluir expedição');
  }
  await wait(1000);
  await dismiss();
  await click('Voltar ao acampamento');
  await wait(800);

  // Academia → Geometria plana → Círculo e circunferência.
  await page.getByRole('tab', { name: 'Academia' }).click();
  await wait(800);
  await shot('academia');
  await page.getByRole('button', { name: /^Geometria plana/ }).click();
  await wait(700);
  await shot('curso-geometria-plana');
  await page.getByRole('button', { name: /Círculo e circunferência/ }).first().click();
  await wait(700);
  await shot('aula-circulo');
  await click('Começar a aula');
  await wait(900);
  await shot('etapa-comprimento');

  // Laboratório: diâmetro de 20 cm para 50 cm (missão: 1,57 m por volta).
  for (let i = 0; i < 6; i++) await click('Aumentar Diâmetro da roda');
  const done = await page.getByText('Missão cumprida').count();
  if (!done) throw new Error('missão do laboratório não foi cumprida');
  await shot('lab-missao-cumprida');
  await click('Continuar', true);
  await wait(700);

  // Exemplo guiado: escolher o próximo passo antes de vê-lo.
  await page.getByRole('button', { name: /^C = 2πr = 2 × 3,14 × 50/ }).click();
  await click('Ver o passo');
  await click('Próximo passo');
  await shot('exemplo-guiado');
  await click('Continuar', true);
  await wait(600);

  // Verificação numérica: resposta errada (usar o raio em π × d) → feedback específico.
  await page.getByLabel('Resposta em m').fill('471');
  await click('Conferir');
  await wait(600);
  await shot('verificacao-feedback');
  const feedback = await page.getByText(/Isso usa o raio \(30 cm\)/).count();
  if (!feedback) throw new Error('feedback específico da verificação não apareceu');

  // Praticar: dica (lanterna) e resposta errada com feedback; Desafiar: sem dicas.
  await page.getByRole('tab', { name: 'Praticar' }).click();
  await wait(700);
  await page.getByRole('button', { name: /^Acender a lanterna 1/ }).first().click();
  await wait(400);
  await shot('praticar-com-dica');
  await page.getByLabel(/^Resposta/).first().fill('1');
  await click('Conferir');
  await wait(600);
  await shot('praticar-feedback');
  await page.getByRole('tab', { name: 'Desafiar' }).click();
  await wait(700);
  await shot('desafiar');
  if (await page.getByRole('button', { name: /^Acender a lanterna/ }).count()) throw new Error('o modo Desafiar não deveria ter dicas');

  // Segunda aula: Cilindros (laboratório com o desenho do cilindro).
  // Volta pela navegação do app (o servidor estático não atende rotas profundas).
  await click('Voltar à aula');
  await click('Voltar', true);
  await click('Voltar', true);
  await page.getByRole('tab', { name: 'Academia' }).click();
  await wait(700);
  await page.getByRole('button', { name: /^Geometria espacial/ }).click();
  await wait(700);
  await shot('curso-geometria-espacial');
  await page.getByRole('button', { name: /Cilindros/ }).first().click();
  await wait(700);
  await click('Começar a aula');
  await wait(900);
  await shot('etapa-cilindro');
  await page.getByText('Missão do laboratório').last().scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 260);
  await shot('lab-cilindro');

  const academy = (await state()).game.academy;
  const stages = Object.keys(academy);
  console.log('ETAPAS COM PROGRESSO', JSON.stringify(stages));
  if (!stages.some((k) => k.startsWith('circulo/'))) throw new Error('progresso da aula de círculo não foi salvo');
  console.log('ERRORS', JSON.stringify(errors.slice(0, 20), null, 1));
  await browser.close();
  if (errors.length) process.exit(1);
})().catch((e) => { console.error('FAILED', e); process.exit(1); });
