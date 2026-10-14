/**
 * Teste ponta a ponta no navegador (pré-visualização web), jogando o fluxo do MVP:
 * onboarding → expedição → 3 missões → chefão, com capturas de tela.
 *
 * Uso:
 *   EXPO_PUBLIC_QA=1 npx expo export --platform web --output-dir dist-web
 *   python3 -m http.server 8090 --directory dist-web &
 *   node scripts/e2e-web.js e2e-shots http://localhost:8090/
 *
 * Requer Playwright com Chromium disponível (global ou local).
 * EXPO_PUBLIC_QA=1 expõe um gancho de leitura do estado (globalThis.__qf) usado só por este script.
 */
const path = require('path');
let pw;
try { pw = require('playwright'); } catch { pw = require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); }
const { chromium } = pw;
const OUT = process.argv[2] || 'e2e-shots';
require('fs').mkdirSync(OUT, { recursive: true });
const URL = process.argv[3] || 'http://localhost:8090/';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
  let n = 0;
  const shot = async (name) => { await wait(700); await page.screenshot({ path: `${OUT}/${String(++n).padStart(2, '0')}-${name}.png` }); };
  const click = async (name) => { await page.getByRole('button', { name, exact: false }).first().click(); };
  const current = () => page.evaluate(() => {
    const g = globalThis.__qf.store.getState().game;
    const id = g.session ? g.session.queue[g.session.index] : g.battle ? g.battle.currentQuestionId : null;
    return id ? { id, answer: globalThis.__qf.getQuestion(id).answer } : null;
  });
  const answerOne = async (correct, confirmLabel = 'Confirmar resposta') => {
    const q = await current();
    if (!q) return null;
    const keys = ['A', 'B', 'C', 'D', 'E'];
    const key = correct ? q.answer : keys.find((k) => k !== q.answer);
    await page.getByRole('radio', { name: new RegExp(`^Alternativa ${key}:`) }).click();
    await click(confirmLabel);
    await wait(500);
    return q;
  };

  await page.goto(URL);
  await wait(3000);
  await shot('onboarding-welcome');
  await click('Começar a jornada');
  await page.getByLabel('Nome ou apelido').fill('Ana');
  await shot('onboarding-name');
  await click('Continuar');
  await shot('onboarding-goal');
  await click('Continuar');
  await shot('onboarding-level');
  await click('Continuar');
  await shot('onboarding-time');
  await click('Primeira expedição');
  await wait(1500);
  await shot('question');
  // Seleciona e mostra o estado selecionado
  let q = await current();
  await page.getByRole('radio', { name: new RegExp(`^Alternativa ${q.answer}:`) }).click();
  await shot('question-selected');
  await click('Confirmar resposta');
  await shot('feedback-correct');
  await click('Próxima questão');
  await answerOne(false);
  await shot('feedback-wrong');
  await click('Próxima questão');
  await click('Dica');
  await shot('hint');
  await answerOne(true);
  await click('Concluir expedição');
  await wait(1200);
  if (await page.evaluate(() => globalThis.__qf.store.getState().celebrations.length)) {
    await shot('levelup');
    await click('Continuar');
  }
  await shot('summary');
  await click('Voltar ao acampamento');
  await wait(800);
  await shot('camp');
  await page.mouse.wheel(0, 700);
  await shot('camp-scrolled');
  await page.getByRole('tab', { name: 'Atlas' }).click();
  await shot('atlas');
  await page.getByRole('tab', { name: 'Herói' }).click();
  await shot('hero');
  await page.getByRole('tab', { name: 'Acampamento' }).click();
  await wait(500);

  // Três missões para desbloquear o chefão
  for (let m = 0; m < 3; m++) {
    await click('Começar missão');
    await wait(1000);
    while (await current()) {
      await answerOne(true);
      if (m === 0) {
        const lv = await page.evaluate(() => globalThis.__qf.store.getState().celebrations.length);
        if (lv) { await shot('levelup-midsession'); await click('Continuar'); await wait(300); }
      }
      const s = await page.evaluate(() => globalThis.__qf.store.getState().game.session);
      const more = s && s.queue[s.index];
      for (let i = 0; i < 3; i++) {
        const c = await page.evaluate(() => globalThis.__qf.store.getState().celebrations.length);
        if (!c) break;
        await click('Continuar'); await wait(300);
      }
      await click(more ? 'Próxima questão' : 'Concluir expedição');
      await wait(400);
    }
    await wait(800);
    // fecha celebrações pendentes
    for (let i = 0; i < 3; i++) {
      const c = await page.evaluate(() => globalThis.__qf.store.getState().celebrations.length);
      if (!c) break;
      await click('Continuar'); await wait(400);
    }
    if (m === 0) await shot('mission-summary');
    await click('Voltar ao acampamento');
    await wait(800);
  }
  await shot('camp-boss-ready');
  await click('Enfrentar o chefão');
  await wait(2500);
  await shot('boss-intro');
  await click('Enfrentar o Golem');
  await wait(1200);
  await shot('boss-battle');
  let turns = 0;
  while (turns++ < 30) {
    const b = await page.evaluate(() => globalThis.__qf.store.getState().game.battle);
    if (!b || b.status !== 'active') break;
    await answerOne(turns !== 2, 'Atacar');
    if (turns === 1) await shot('boss-hit');
    if (turns === 2) await shot('boss-miss');
    for (let i = 0; i < 3; i++) {
      const c = await page.evaluate(() => globalThis.__qf.store.getState().celebrations.length);
      if (!c) break;
      if (turns > 2) await shot('boss-levelup');
      await click('Continuar'); await wait(300);
    }
    const after = await page.evaluate(() => globalThis.__qf.store.getState().game.battle);
    if (after.status !== 'active') await shot('boss-final-blow');
    await click(after.status === 'active' ? 'Próximo golpe' : 'Ver resultado');
    await wait(400);
  }
  for (let i = 0; i < 3; i++) {
    const c = await page.evaluate(() => globalThis.__qf.store.getState().celebrations.length);
    if (!c) break;
    await click('Continuar'); await wait(400);
  }
  await shot('boss-result');
  await page.mouse.wheel(0, 600);
  await shot('boss-result-loot');
  await click('Voltar ao Atlas');
  await wait(800);
  await shot('atlas-after');
  await page.getByRole('tab', { name: 'Herói' }).click();
  await shot('hero-after');
  const g = await page.evaluate(() => { const g = globalThis.__qf.store.getState().game; return { xp: g.profile.xp, inv: Object.keys(g.inventory), bosses: g.bosses, equipped: g.profile.equipped }; });
  console.log(JSON.stringify(g));
  console.log('ERRORS', JSON.stringify(errors.slice(0, 20), null, 1));
  await browser.close();
})().catch((e) => { console.error('FAILED', e); process.exit(1); });
