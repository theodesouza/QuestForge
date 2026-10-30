/**
 * Teste ponta a ponta no navegador (pré-visualização web), jogando o fluxo do MVP:
 * onboarding → expedição → Região 1 (3 missões + Golem) → Região 2 (3 missões + Mercador)
 * → Região 3 (Quimera) → Região 4 (Colosso Euclidiano) → Região 5 (Arquiteto dos Sólidos)
 * → Região 6 (Leviatã dos Gráficos) → Região 7 (Esfinge do Acaso) → Região 8 (Hidra das Funções)
 * → Região 9 (Leviatã das Escalas)
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
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  if (process.argv.includes('--scaffold-only')) {
    await page.clock.setFixedTime(new Date('2026-10-19T18:00:00Z'));
    await page.addInitScript(() => {
      let seed = 104;
      Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    });
  }
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
  if (process.argv.includes('--solutions-only')) {
    // Somente na prévia QA: reutiliza a etapa de leitura para testar todo o catálogo.
    const fs = require('fs');
    const contentDir = path.join(__dirname, '../src/content/questions');
    const ids = fs.readdirSync(contentDir, { recursive: true }).filter(file => file.endsWith('.ts'))
      .flatMap(file => [...fs.readFileSync(path.join(contentDir, file), 'utf8').matchAll(/id:\s*['"]([A-Z]{3}-\d{3})['"]/g)].map(match => match[1]));
    if (ids.length === 0 || new Set(ids).size !== ids.length) throw new Error('Catálogo incompleto no teste visual');
    const original = await page.evaluate(() => globalThis.__qf.store.getState().game);
    await page.setViewportSize({ width: 320, height: 844 });
    await page.context().setOffline(true);
    for (const id of ids) {
      await page.evaluate(id => {
        const store = globalThis.__qf.store;
        const g = store.getState().game;
        const current = g.session.queue[g.session.index];
        store.setState({ game: { ...g, session: { ...g.session, scaffoldLesson: { sourceQuestionId: current, practiceQuestionId: current, exampleQuestionId: id } } } });
      }, id);
      const sheet = page.getByTestId('solution-sheet');
      await sheet.getByText(`QuestForge · ${id}`, { exact: true }).waitFor();
      const answer = await page.evaluate(id => {
        const q = globalThis.__qf.getQuestion(id);
        return q.alternatives[q.answer];
      }, id);
      await sheet.getByText(answer, { exact: true }).last().waitFor();
      const overflow = await sheet.evaluate(el => {
        const sheet = el.getBoundingClientRect();
        return [...el.querySelectorAll('[dir="auto"]')].filter(child => {
          const rect = child.getBoundingClientRect();
          return rect.width > 0 && (rect.left < sheet.left - 1 || rect.right > sheet.right + 1);
        }).map(child => child.textContent);
      });
      if (overflow.length) throw new Error(`${id} ultrapassou a folha: ${JSON.stringify(overflow)}`);
      if (['PCT-001', 'BAS-108', 'BAS-323', 'COM-004'].includes(id)) {
        const result = sheet.getByText(answer, { exact: true }).last();
        await result.scrollIntoViewIfNeeded();
        const resultBox = await result.boundingBox();
        const footerBox = await page.getByRole('button', { name: 'Agora vou tentar', exact: true }).boundingBox();
        if (!resultBox || !footerBox || resultBox.y < 0 || resultBox.y + resultBox.height > footerBox.y) throw new Error(`${id}: não foi possível ler o resultado ao rolar a folha`);
        await page.setViewportSize({ width: 390, height: 6000 });
        await sheet.screenshot({ path: `${OUT}/solution-${id}.png` });
        await page.setViewportSize({ width: 320, height: 844 });
      }
    }
    await page.evaluate(game => globalThis.__qf.store.setState({ game }), original);
    if (errors.length) throw new Error(JSON.stringify(errors));
    console.log(`SOLUTIONS_OK: ${ids.length} folhas, respostas finais, sem corte lateral em 320px, leitura offline; sem erros de console`);
    await browser.close();
    return;
  }
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
  const wrongQuestion = await answerOne(false);
  await dismissCelebrations('levelup');
  await page.getByTestId('solution-sheet').waitFor();
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

  // Evolução e consulta do erro: os dados reais da expedição aparecem sem conceder recompensas.
  const beforeReview = await page.evaluate(() => JSON.stringify(globalThis.__qf.store.getState().game));
  await click('Sua evolução');
  await page.getByText('Mapa do conhecimento', { exact: true }).waitFor();
  await page.getByText('2 acertos, sendo 2 sem marcar chute.', { exact: false }).waitFor();
  await shot('learning-progress');
  await click('Histórico de erros');
  await page.getByRole('button', { name: `Ver resolução · ${wrongQuestion.id}`, exact: true }).waitFor();
  await shot('learning-mistakes');
  await click(`Ver resolução · ${wrongQuestion.id}`);
  await page.getByText('Resolução passo a passo', { exact: true }).waitFor();
  await page.getByTestId('solution-sheet').waitFor();
  const correctText = await page.evaluate((id) => {
    const q = globalThis.__qf.getQuestion(id);
    return q.alternatives[q.answer];
  }, wrongQuestion.id);
  await page.getByText(`${correctText} · correta`, { exact: false }).waitFor();
  await shot('learning-review');
  const afterReview = await page.evaluate(() => JSON.stringify(globalThis.__qf.store.getState().game));
  if (beforeReview !== afterReview) throw new Error('Consultar o histórico alterou o progresso');
  await click('Voltar ao histórico');
  await page.getByRole('button', { name: 'Voltar', exact: true }).click();
  await page.getByRole('button', { name: 'Voltar', exact: true }).click();
  if (process.argv.includes('--learning-only')) {
    if (errors.length) throw new Error(JSON.stringify(errors));
    console.log('LEARNING_OK: evolução, histórico, resolução e progresso preservado; sem erros de console');
    await browser.close();
    return;
  }
  if (process.argv.includes('--scaffold-only')) {
    await click('Sua evolução');
    await click('Treinar este assunto');
    await answerOne(false);
    await click('Próxima questão');
    await answerOne(false);
    const setup = await page.evaluate(() => {
      const s = globalThis.__qf.store.getState().game.session;
      return { answers: s.answers.map(a => ({ id: a.questionId, subtopic: globalThis.__qf.getQuestion(a.questionId).subtopic, correct: a.correct })), queue: s.queue, scaffold: s.scaffoldLesson };
    });
    if (!setup.scaffold) throw new Error(`O cenário de teste não encontrou um exemplo separado: ${JSON.stringify(setup)}`);
    await page.getByRole('button', { name: 'Ver exemplo resolvido', exact: true }).waitFor();
    const beforeLesson = await page.evaluate(() => JSON.parse(JSON.stringify(globalThis.__qf.store.getState().game)));
    const lesson = beforeLesson.session.scaffoldLesson;
    if (!lesson || beforeLesson.session.queue.includes(lesson.exampleQuestionId)) throw new Error('O exemplo revelou uma questão avaliada');
    await click('Ver exemplo resolvido');
    await page.getByText('Exemplo resolvido', { exact: true }).waitFor();
    if (await page.getByRole('radio').count()) throw new Error('O exemplo está aceitando respostas');
    await shot('scaffold-lesson');
    // Sair da rota e retomá-la deve manter a leitura pendente.
    await page.goBack();
    await click('Retomar a sessão pausada');
    await page.getByText('Exemplo resolvido', { exact: true }).waitFor();
    await click('Agora vou tentar');
    await page.getByRole('button', { name: 'Confirmar resposta', exact: true }).waitFor();
    const afterLesson = await page.evaluate(() => JSON.parse(JSON.stringify(globalThis.__qf.store.getState().game)));
    beforeLesson.session.scaffoldLesson = null;
    if (JSON.stringify(beforeLesson) !== JSON.stringify(afterLesson)) throw new Error('Ler o exemplo alterou mais do que a etapa de leitura');
    if (afterLesson.session.queue[afterLesson.session.index] !== lesson.practiceQuestionId) throw new Error('Não voltou para a prática certa');
    await shot('scaffold-practice');
    await answerOne(true);
    await dismissCelebrations(null);
    await click('Próxima questão');
    if (await page.getByText('Exemplo resolvido', { exact: true }).count()) throw new Error('Não voltou ao treino normal');
    if (errors.length) throw new Error(JSON.stringify(errors));
    console.log('SCAFFOLD_OK: exemplo sem resposta/XP, retomada, prática e retorno ao treino; sem erros de console');
    await browser.close();
    return;
  }
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
    let qn = 0;
    while (await current()) {
      // Gráficos de barras, linhas e setores e tabelas: uma foto de cada questão da 1ª missão da Região 6.
      if (label === 'r6-m1') await shot(`${label}-q${++qn}`);
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
    if (['r1-m1', 'r2-m1', 'r3-m1', 'r4-m1', 'r5-m1', 'r6-m1', 'r7-m1', 'r8-m1', 'r9-m1'].includes(label)) await shot(`${label}-summary`);
    await click('Voltar ao acampamento');
    await wait(800);
  };

  const fightBoss = async (prefix, bossName, misses = [2]) => {
    await shot(`${prefix}-camp-ready`);
    await click('Enfrentar o chefão');
    await wait(2500);
    await shot(`${prefix}-intro`);
    await click(`Enfrentar ${bossName}`);
    await wait(1200);
    await shot(`${prefix}-battle`);
    let turns = 0;
    const headShots = new Set();
    // Colosso: vértices partidos; Arquiteto: camadas de concreto — uma foto a cada mudança.
    let lastMark = 0;
    let layersSeen = 0;
    let minScales = 99;
    let headsSeen = 0;
    let healedSeen = 0;
    let riddleSeen = false;
    let stageMark = 0;
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
      const riddleNow = prefix === 'esfinge' && (b.turns.length + 1) % (b.armorBroken ? 3 : 4) === 0;
      await answerOne(!misses.includes(turns), riddleNow ? 'Decifrar o Enigma' : 'Atacar');
      if (turns === 1) await shot(`${prefix}-hit`);
      if (turns === misses[0]) await shot(`${prefix}-miss`);
      await dismissCelebrations(null);
      const after = await page.evaluate(() => globalThis.__qf.store.getState().game.battle);
      const last = after.turns[after.turns.length - 1];
      if (prefix === 'leviata') {
        minScales = Math.min(minScales, after.scales);
        if (after.scales !== lastMark) { lastMark = after.scales; await shot(`${prefix}-scales-${after.scales}`); }
      }
      if (prefix === 'esfinge' && last.riddle && !riddleSeen) { riddleSeen = true; await shot(`${prefix}-riddle-${last.correct ? 'hit' : 'miss'}`); }
      if (prefix === 'hidra') {
        headsSeen = Math.max(headsSeen, after.hydraHeads || 0);
        healedSeen += last.healed || 0;
        if ((after.hydraHeads || 0) !== lastMark) { lastMark = after.hydraHeads || 0; await shot(`${prefix}-heads-${lastMark}`); }
      }
      if (prefix === 'escalas') {
        const stage = after.hp <= after.maxHp / 3 ? 2 : after.hp <= (after.maxHp * 2) / 3 ? 1 : 0;
        if (stage !== stageMark) {
          if (after.status === 'active' && !(after.resolve > b.resolve) && b.resolve < after.maxResolve) throw new Error('Concluir uma escala não devolveu Determinação');
          stageMark = stage;
          await shot(`${prefix}-stage-${stage}`);
        }
      }
      if (prefix === 'colosso' || prefix === 'arquiteto') {
        const mark = prefix === 'colosso' ? Object.values(after.facetHits || {}).filter((h) => h >= 2).length : after.layers || 0;
        layersSeen = Math.max(layersSeen, prefix === 'arquiteto' ? mark : 0);
        if (mark !== lastMark) {
          lastMark = mark;
          await shot(`${prefix}-${prefix === 'colosso' ? 'vertex' : 'layers'}-${mark}`);
        }
      }
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
    if (prefix === 'arquiteto' && layersSeen === 0) throw new Error('O Arquiteto não despejou concreto depois dos erros');
    if (prefix === 'leviata' && !(minScales < 4)) throw new Error('O Leviatã dos Gráficos não perdeu escamas');
    if (prefix === 'esfinge' && !riddleSeen) throw new Error('A Esfinge não propôs o Enigma');
    if (prefix === 'hidra' && (headsSeen === 0 || healedSeen === 0)) throw new Error('A Hidra não ganhou cabeça nem se regenerou depois do erro');
    if (prefix === 'escalas' && stageMark < 2) throw new Error('O Leviatã das Escalas não chegou à última escala');
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

  // Região 4: Torres Euclidianas e o Colosso Euclidiano (um erro depois de acertos reajusta um vértice).
  await page.getByRole('tab', { name: 'Acampamento' }).click();
  await wait(800);
  for (const m of ['r4-m1', 'r4-m2', 'r4-m3']) await playMission(m);
  await fightBoss('colosso', 'Colosso Euclidiano', [4]);
  await page.mouse.move(195, 500);
  await page.mouse.wheel(0, 1800);
  await shot('atlas-after-colosso');

  // Região 5: Cavernas Volumétricas e o Arquiteto dos Sólidos (dois erros: duas camadas de concreto).
  await page.getByRole('tab', { name: 'Acampamento' }).click();
  await wait(800);
  for (const m of ['r5-m1', 'r5-m2', 'r5-m3']) await playMission(m);
  await fightBoss('arquiteto', 'Arquiteto dos Sólidos', [2, 3]);
  await page.mouse.move(195, 500);
  await page.mouse.wheel(0, 2200);
  await shot('atlas-after-arquiteto');

  // Regiões 6 a 9: gráficos, acaso, funções e medidas — cada chefão com a sua mecânica.
  for (const [region, boss, name, misses, wheel] of [
    ['r6', 'leviata', 'Leviatã dos Gráficos', [2], 2600],
    ['r7', 'esfinge', 'Esfinge do Acaso', [2], 3000],
    ['r8', 'hidra', 'Hidra das Funções', [2], 3400],
    ['r9', 'escalas', 'Leviatã das Escalas', [2], 3800],
  ]) {
    await page.getByRole('tab', { name: 'Acampamento' }).click();
    await wait(800);
    for (const m of ['m1', 'm2', 'm3']) await playMission(`${region}-${m}`);
    await fightBoss(boss, name, misses);
    await page.mouse.move(195, 500);
    await page.mouse.wheel(0, wheel);
    await shot(`atlas-after-${boss}`);
  }

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
  await page.getByRole('button', { name: 'Bloqueados', exact: true }).click();
  await wait(400);
  await shot('hero-collection-locked');
  await page.getByRole('button', { name: 'Todos', exact: true }).click();
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
  for (const id of ['scene-pedreira', 'scene-mercado', 'scene-planicie', 'scene-torres', 'scene-cavernas', 'frame-torres', 'frame-geodo', 'title-geometra', 'title-volumetra', 'scene-mirante', 'scene-labirinto', 'scene-cordilheira', 'scene-ilhas', 'frame-observatorio', 'frame-labirinto', 'frame-cordilheira', 'frame-ilhas', 'title-analista', 'title-mestre-acaso', 'title-domador-curvas', 'title-navegador-escalas']) if (!g.inv.includes(id)) throw new Error(`Feito de chefão não concedeu ${id}`);
  console.log('ERRORS', JSON.stringify(errors.slice(0, 20), null, 1));
  await browser.close();
})().catch((e) => { console.error('FAILED', e); process.exit(1); });
