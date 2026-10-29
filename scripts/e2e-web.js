/**
 * Teste ponta a ponta no navegador (pré-visualização web), jogando o fluxo do MVP:
 * onboarding → expedição → Região 1 (3 missões + Golem) → Região 2 (3 missões + Mercador)
 * → encomendas → Oficina → ajustes, com capturas de tela.
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
  // Alternativas embaralhadas: `answer` é a letra EXIBIDA da alternativa correta.
  const current = () => page.evaluate(() => {
    const g = globalThis.__qf.store.getState().game;
    const id = g.session ? g.session.queue[g.session.index] : g.battle ? g.battle.currentQuestionId : null;
    if (!id) return null;
    const key = g.session ? g.session.id : g.battle.id;
    return { id, answer: globalThis.__qf.shown(id, key, globalThis.__qf.getQuestion(id).answer) };
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

  // Cerimônia de revelação de item: espera a carga (raros+), fotografa a primeira de cada raridade.
  const seenRarity = new Set();
  const dismissReveals = async () => {
    for (let i = 0; i < 6; i++) {
      const r = await page.evaluate(() => {
        const s = globalThis.__qf.store.getState();
        const path = location.pathname;
        return s.reveals.length && s.celebrations.length === 0 && path !== '/session' && path !== '/boss' ? s.reveals[0].itemId : null;
      });
      if (!r) break;
      await wait(1700);
      const rarity = await page.evaluate((id) => globalThis.__qf.getItem ? globalThis.__qf.getItem(id).rarity : 'x', r);
      if (!seenRarity.has(rarity)) {
        seenRarity.add(rarity);
        await shot(`reveal-${rarity}-${r}`);
      }
      await page.getByRole('button', { name: 'Continuar', exact: false }).last().click();
      await wait(500);
    }
  };

  const dismissCelebrations = async (shotName) => {
    for (let i = 0; i < 4; i++) {
      const c = await page.evaluate(() => globalThis.__qf.store.getState().celebrations.length);
      if (!c) break;
      if (shotName) await shot(shotName);
      await click('Continuar'); await wait(300);
    }
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
  await dismissCelebrations('levelup');
  await shot('feedback-correct');
  await click('Próxima questão');
  // Rever a questão anterior: seleciona uma alternativa na atual, vai rever a 1ª e volta sem perder a seleção.
  q = await current();
  await page.getByRole('radio', { name: new RegExp(`^Alternativa ${q.answer}:`) }).click();
  await click('Rever a questão anterior');
  await page.getByText('Revendo a questão 1').waitFor({ timeout: 5000 });
  await shot('review-previous');
  await click('Voltar à questão atual');
  await wait(500);
  // A web não expõe aria-selected: a alternativa selecionada é a de borda latão (brass).
  const radio = page.getByRole('radio', { name: new RegExp(`^Alternativa ${q.answer}:`) });
  const border = await radio.evaluate((el) => getComputedStyle(el).borderTopColor);
  if (border !== 'rgb(242, 181, 74)') throw new Error(`A seleção da questão atual se perdeu ao voltar da revisão (borda ${border})`);
  await shot('review-returned');
  await answerOne(false);
  await dismissCelebrations('levelup');
  await shot('feedback-wrong');
  await click('Próxima questão');
  await click('Dica');
  await shot('hint');
  await answerOne(true);
  await dismissCelebrations('levelup');
  await click('Concluir expedição');
  await wait(1200);
  if (await page.evaluate(() => globalThis.__qf.store.getState().celebrations.length)) {
    await shot('levelup');
    await click('Continuar');
  }
  await dismissReveals();
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

  const playMission = async (label) => {
    await click('Começar missão');
    await wait(1000);
    while (await current()) {
      await answerOne(true);
      await dismissCelebrations(label === 'r1-m1' ? 'levelup-midsession' : null);
      const s = await page.evaluate(() => globalThis.__qf.store.getState().game.session);
      const more = s && s.queue[s.index];
      await click(more ? 'Próxima questão' : 'Concluir expedição');
      await wait(400);
    }
    await wait(800);
    await dismissCelebrations(null);
    await dismissReveals();
    if (label === 'r1-m1' || label === 'r2-m1' || label === 'r3-m1') await shot(`${label}-summary`);
    await click('Voltar ao acampamento');
    await wait(800);
  };

  const fightBoss = async (prefix, bossName) => {
    await shot(`${prefix}-camp-ready`);
    await click('Enfrentar o chefão');
    await wait(2500);
    await shot(`${prefix}-intro`);
    await click(`Enfrentar ${bossName}`);
    await wait(1200);
    await shot(`${prefix}-battle`);
    let turns = 0;
    const headShots = new Set();
    while (turns++ < 40) {
      const b = await page.evaluate(() => globalThis.__qf.store.getState().game.battle);
      if (!b || b.status !== 'active') break;
      // Batalha: rever o golpe anterior e voltar (uma vez, no 1º chefão).
      if (prefix === 'golem' && turns === 3) {
        await click('Rever a questão anterior');
        await page.getByText(/Revendo o golpe 2/).waitFor({ timeout: 5000 });
        await shot(`${prefix}-review`);
        await click('Voltar à questão atual');
        await wait(400);
      }
      await answerOne(turns !== 2, 'Atacar');
      if (turns === 1) await shot(`${prefix}-hit`);
      if (turns === 2) await shot(`${prefix}-miss`);
      await dismissCelebrations(null);
      const after = await page.evaluate(() => globalThis.__qf.store.getState().game.battle);
      // Quimera: uma foto quando cada cabeça cai (vida ≤ 1/2 e ≤ 1/6 da máxima).
      for (const [n, ratio] of [[1, 0.5], [2, 1 / 6]]) {
        if (prefix === 'quimera' && after.hp <= after.maxHp * ratio && !headShots.has(n)) {
          headShots.add(n);
          await shot(`${prefix}-head${n}-down`);
        }
      }
      if (after.status !== 'active') await shot(`${prefix}-final-blow`);
      await click(after.status === 'active' ? 'Próximo golpe' : 'Ver resultado');
      await wait(400);
    }
    await dismissCelebrations(null);
    await shot(`${prefix}-result`);
    await click('Voltar ao Atlas');
    await wait(800);
    await dismissReveals();
  };

  // Região 1: três missões e o Golem.
  for (const m of ['r1-m1', 'r1-m2', 'r1-m3']) await playMission(m);
  await fightBoss('golem', 'Golem Proporcional');
  await shot('atlas-after-golem');
  await page.getByRole('tab', { name: 'Acampamento' }).click();
  await wait(800);

  // Região 2: Mercado de Âmbar e o Mercador Composto.
  for (const m of ['r2-m1', 'r2-m2', 'r2-m3']) await playMission(m);
  await fightBoss('mercador', 'Mercador Composto');
  await page.mouse.move(195, 500);
  await page.mouse.wheel(0, 900);
  await shot('atlas-after-mercador');

  // Região 3: Planícies Numéricas e a Quimera Fracionária.
  await page.getByRole('tab', { name: 'Acampamento' }).click();
  await wait(800);
  for (const m of ['r3-m1', 'r3-m2', 'r3-m3']) await playMission(m);
  await fightBoss('quimera', 'Quimera Fracionária');
  await page.mouse.move(195, 500);
  await page.mouse.wheel(0, 1400);
  await shot('atlas-after-quimera');

  // Encomendas.
  await page.getByRole('tab', { name: 'Acampamento' }).click();
  await wait(800);
  await page.mouse.move(195, 500);
  await page.mouse.wheel(0, 700);
  await shot('camp-quests');
  await page.getByRole('button', { name: /Encomendas do dia/ }).click();
  await wait(800);
  await shot('quests');
  await page.mouse.move(195, 500);
  await page.mouse.wheel(0, 900);
  await shot('quests-weekly');
  await page.getByRole('button', { name: 'Voltar' }).first().click();
  await wait(600);

  // Oficina: compra em dois toques.
  await page.getByRole('button', { name: /Abrir a Oficina/ }).click();
  await wait(800);
  await shot('workshop');
  const before = await page.evaluate(() => globalThis.__qf.store.getState().game.profile.ink);
  await page.getByRole('button', { name: /^Comprar · / }).first().click();
  await wait(300);
  await shot('workshop-confirm');
  await page.getByRole('button', { name: /^Confirmar · / }).first().click();
  await wait(800);
  await dismissReveals();
  await shot('workshop-bought');
  const after = await page.evaluate(() => globalThis.__qf.store.getState().game.profile.ink);
  if (!(after < before)) throw new Error(`Compra não descontou Tinta: ${before} → ${after}`);

  // Cenários: filtrar a vitrine, experimentar antes de comprar, comprar e ver atrás do herói.
  await page.getByRole('button', { name: /^Cenários/ }).click();
  await wait(500);
  await shot('workshop-scenes');
  const sceneBefore = await page.evaluate(() => globalThis.__qf.store.getState().game.profile.equipped.scene);
  await page.getByRole('button', { name: /^Experimentar/ }).first().click();
  await wait(1600);
  await shot('workshop-tryon-scene');
  const equippedDuringTryOn = await page.evaluate(() => globalThis.__qf.store.getState().game.profile.equipped.scene);
  if (equippedDuringTryOn !== sceneBefore) throw new Error('Experimentar não pode equipar o cenário');
  await page.getByRole('button', { name: /Fechar/ }).last().click();
  await wait(500);
  await page.getByRole('button', { name: /^Comprar · / }).first().click();
  await page.getByRole('button', { name: /^Confirmar · / }).first().click();
  await wait(1800);
  await shot('workshop-scene-reveal');
  await dismissReveals();
  const sceneBought = await page.evaluate(() => globalThis.__qf.store.getState().game.profile.equipped.scene);
  if (!sceneBought) throw new Error('Cenário comprado não foi equipado');
  await page.getByRole('button', { name: 'Voltar' }).first().click();
  await wait(600);
  await shot('camp-scene');

  await page.getByRole('tab', { name: 'Herói' }).click();
  await shot('hero-after');
  // Coleção: filtros por espaço e por posse; remover e recolocar o cenário.
  await page.getByRole('button', { name: /^Cenário \d+\/\d+/ }).click();
  await wait(500);
  await shot('hero-collection-scenes');
  await page.getByRole('button', { name: 'Remover cenário' }).click();
  await wait(500);
  if (await page.evaluate(() => globalThis.__qf.store.getState().game.profile.equipped.scene)) throw new Error('Remover cenário não limpou o espaço');
  await page.getByRole('button', { name: 'Bloqueados' }).click();
  await wait(400);
  await shot('hero-collection-locked');
  await page.getByRole('button', { name: 'Todos' }).click();
  await wait(300);
  // Experimentar um núcleo (prévia com transformação) — inclusive um bloqueado.
  await page.getByRole('button', { name: /^Núcleo/ }).first().click();
  await wait(500);
  await page.getByRole('button', { name: /^Núcleo do Tesouro/ }).click();
  await wait(1400);
  await shot('hero-tryon-locked');
  await page.getByRole('button', { name: 'Fechar', exact: false }).last().click();
  await wait(500);
  await page.getByRole('tab', { name: 'Acampamento' }).click();
  await wait(500);
  await page.getByRole('button', { name: 'Ajustes' }).click();
  await wait(700);
  await page.mouse.move(195, 500);
  await page.mouse.wheel(0, 700);
  await shot('settings');
  const g = await page.evaluate(() => { const g = globalThis.__qf.store.getState().game; return { xp: g.profile.xp, ink: g.profile.ink, inv: Object.keys(g.inventory), bosses: g.bosses, equipped: g.profile.equipped, quests: g.quests }; });
  console.log(JSON.stringify(g));
  for (const id of ['scene-pedreira', 'scene-mercado', 'scene-planicie']) if (!g.inv.includes(id)) throw new Error(`Feito de chefão não concedeu ${id}`);
  console.log('ERRORS', JSON.stringify(errors.slice(0, 20), null, 1));
  await browser.close();
})().catch((e) => { console.error('FAILED', e); process.exit(1); });
