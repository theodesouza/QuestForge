/**
 * Aula: Combinações — quando a ordem não importa (dividir pelas ordens repetidas), a fórmula
 * C(n, k) e a simetria, grupos com condições (produto de combinações, alguém incluído ou
 * excluído, líder e grupo), "pelo menos um" pelo complemento e maestria com campeonatos.
 */
import {
  askStep,
  check,
  classify,
  draftNumeric,
  example,
  gen,
  lab,
  lesson,
  math,
  no,
  numeric,
  ok,
  p,
  reveal,
  stage,
  step,
  strategy,
  text,
  warn,
} from '../../kit/build';
import { num } from '../../kit/format';
import type { Rand } from '../../types';

const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
/** n × (n − 1) × … (k fatores): arranjos, a ordem importa. */
const A = (n: number, k: number) => Array.from({ length: k }, (_, i) => n - i).reduce((a, b) => a * b, 1);
/** Combinações: a ordem não importa. */
const C = (n: number, k: number) => (k < 0 || k > n ? 0 : A(n, k) / fact(k));
const factors = (n: number, k: number) => Array.from({ length: k }, (_, i) => n - i).join(' × ');
const kfact = (k: number) => Array.from({ length: k }, (_, i) => k - i).join(' × ');
/** "C(n, k) = (n × … ) ÷ (k × … ) = valor". */
const cline = (n: number, k: number) => (k <= 1 ? `C(${n}, ${k}) = ${num(C(n, k))}` : `C(${n}, ${k}) = (${factors(n, k)}) ÷ (${kfact(k)}) = ${num(C(n, k))}`);

// ———————————————————————————————————————————————— geradores: a ordem importa?

const SCENES = [
  { ordered: true, intro: (n: number, k: number) => `Um clube com ${n} sócios vai escolher ${k === 2 ? 'um presidente e um vice' : 'presidente, vice e tesoureiro'}, e ninguém acumula cargos.`, ask: 'De quantas formas a escolha pode ser feita?' },
  { ordered: true, intro: (n: number, k: number) => `Numa prova com ${n} nadadores, ${k === 2 ? 'o 1º e o 2º lugares serão premiados com medalhas diferentes' : 'o 1º, o 2º e o 3º lugares receberão medalhas de ouro, prata e bronze'}.`, ask: 'De quantas formas a premiação pode ficar?' },
  { ordered: false, intro: (n: number, k: number) => `De um grupo de ${n} voluntários, ${k} serão escolhidos para uma comissão em que todos têm a mesma função.`, ask: 'Quantas comissões diferentes podem ser formadas?' },
  { ordered: false, intro: (n: number, k: number) => `Uma sorveteria tem ${n} sabores, e um copinho leva ${k} sabores diferentes (a ordem das bolas não importa).`, ask: 'Quantos copinhos diferentes podem ser montados?' },
];

/** Decidir se a ordem importa antes de contar: arranjo ou combinação. */
function orderOrNotGen(r: Rand) {
  for (;;) {
    const s = r.pick(SCENES);
    const n = r.int(5, 12);
    const k = r.int(2, 3);
    if (!s.ordered && n === 8 && k === 3) continue; // a conta da questão do banco
    const ans = s.ordered ? A(n, k) : C(n, k);
    return draftNumeric({
      prompt: [p(s.intro(n, k))],
      ask: s.ask,
      answer: ans,
      wrong: s.ordered
        ? [
            { value: C(n, k), feedback: `Isso divide por ${k}!, como se a ordem não importasse. Aqui as posições são diferentes: trocar quem fica em cada uma muda o resultado.` },
            { value: n * k, feedback: `Isso multiplica ${n} por ${k}. Multiplique as opções de cada posição: ${factors(n, k)}.` },
          ]
        : [
            { value: A(n, k), feedback: `Isso conta como fila (${factors(n, k)}), em que a ordem importa. Aqui, cada grupo aparece ${k}! = ${fact(k)} vezes: divida.` },
            { value: n * k, feedback: `Isso multiplica ${n} por ${k}. Conte as filas (${factors(n, k)}) e divida pelas ${fact(k)} ordens de cada grupo.` },
          ],
      hints: ['Pergunte: trocar a ordem dos escolhidos muda o resultado?', s.ordered ? `Muda: conte como fila, ${factors(n, k)}.` : `Não muda: conte como fila (${factors(n, k)}) e divida por ${k}! = ${fact(k)}.`],
      solution: [s.ordered ? `$${factors(n, k)} = ${num(ans)}` : `$(${factors(n, k)}) ÷ ${fact(k)} = ${num(ans)}`],
    });
  }
}

const PAIRS = [
  { intro: (n: number) => `Numa reunião com ${n} pessoas, cada uma cumprimenta cada outra com um aperto de mão, uma única vez.`, ask: 'Quantos apertos de mão acontecem?' },
  { intro: (n: number) => `Num torneio de xadrez com ${n} jogadores, cada jogador enfrenta cada outro uma única vez.`, ask: 'Quantas partidas são disputadas?' },
  { intro: (n: number) => `Há ${n} pontos numa circunferência, e cada par de pontos é ligado por um segmento.`, ask: 'Quantos segmentos são traçados?' },
];

/** Pares sem ordem: n × (n − 1) ÷ 2. */
function pairsGen(r: Rand) {
  for (;;) {
    const g = r.pick(PAIRS);
    const n = r.int(5, 16);
    if (n === 10) continue; // laboratório da teoria (45 jogos)
    if (n === 7) continue; // exercício da teoria
    const ans = C(n, 2);
    return draftNumeric({
      prompt: [p(g.intro(n))],
      ask: g.ask,
      answer: ans,
      wrong: [
        { value: n * (n - 1), feedback: `Isso conta cada par duas vezes (A com B e B com A). Divida ${n} × ${n - 1} por 2.` },
        { value: n * n, feedback: `Isso inclui cada um com ele mesmo e conta os pares duas vezes. Cada um forma par com os outros ${n - 1}.` },
        { value: 2 * n, feedback: `Isso multiplica ${n} por 2. Cada um dos ${n} se liga a ${n - 1} outros, e cada par foi contado duas vezes.` },
      ],
      hints: [`Cada um dos ${n} forma par com os outros ${n - 1}: ${n} × ${n - 1}.`, 'Assim, cada par foi contado duas vezes: divida por 2.'],
      solution: [`$${n} × ${n - 1} ÷ 2 = ${num(ans)}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: a fórmula

const GROUPS = [
  { intro: (n: number, k: number) => `Uma professora vai sortear ${k} dos ${n} estudantes de um grupo para apresentar um trabalho juntos.`, ask: 'Quantos grupos diferentes podem ser sorteados?' },
  { intro: (n: number, k: number) => `Uma pessoa vai escolher ${k} dos ${n} livros de uma lista para levar nas férias.`, ask: 'De quantas formas ela pode escolher os livros?' },
  { intro: (n: number, k: number) => `Um técnico precisa escolher ${k} dos ${n} jogadores do elenco para cobrar pênaltis, em qualquer ordem que decidirá depois.`, ask: 'Quantos grupos de cobradores ele pode formar?' },
];

/** C(n, k) com simplificação. */
function combGen(r: Rand) {
  for (;;) {
    const g = r.pick(GROUPS);
    const n = r.int(6, 15);
    const k = r.int(2, 5);
    if (k >= n - 1) continue;
    if (n === 8 && k === 3) continue; // questão do banco
    if (n === 10 && k === 3) continue; // exemplo da teoria
    const ans = C(n, k);
    return draftNumeric({
      prompt: [p(g.intro(n, k))],
      ask: g.ask,
      answer: ans,
      wrong: [
        { value: A(n, k), feedback: `Isso conta como se a ordem importasse (${factors(n, k)}). Num grupo, a ordem não muda nada: divida por ${k}! = ${fact(k)}.` },
        { value: n * k, feedback: `Isso multiplica ${n} por ${k}. Use C(${n}, ${k}) = (${factors(n, k)}) ÷ ${k}!.` },
        { value: A(n, k) / k, feedback: `Isso divide por ${k}, e não por ${k}! = ${fact(k)}: cada grupo aparece em ${fact(k)} ordens diferentes.` },
      ],
      hints: [`A ordem não importa: C(${n}, ${k}).`, `Numerador: ${k} fatores a partir de ${n} (${factors(n, k)}); denominador: ${k}! = ${fact(k)}.`],
      solution: [`$${cline(n, k)}`],
    });
  }
}

/** Escolher quem vai é o mesmo que escolher quem fica: C(n, k) = C(n, n − k). */
function symmetryGen(r: Rand) {
  for (;;) {
    const n = r.int(8, 15);
    const out = r.int(1, 3);
    const k = n - out;
    const ans = C(n, k);
    const ctx = r.pick([
      { intro: `Uma turma de ${n} estudantes tem ${k} vagas para uma excursão, e todos querem ir.`, ask: 'De quantas formas diferentes podem ser escolhidos os estudantes que vão?' },
      { intro: `Um técnico tem ${n} jogadores e vai convocar ${k} para um torneio.`, ask: 'Quantas convocações diferentes ele pode fazer?' },
    ]);
    return draftNumeric({
      prompt: [p(ctx.intro)],
      ask: ctx.ask,
      answer: ans,
      wrong: [
        { value: A(n, out), feedback: `Isso escolhe os ${out} que ficam de fora, mas com ordem (${factors(n, out)}). Os que ficam formam um grupo: divida por ${out}!.` },
        { value: n * k, feedback: `Isso multiplica ${n} por ${k}. Escolher quem vai é escolher quem fica: C(${n}, ${out}).` },
        ...(out > 1 ? [{ value: n, feedback: `Isso só valeria se ficasse 1 de fora. Ficam ${out}: C(${n}, ${out}).` }] : [{ value: n - 1, feedback: `Isso subtrai 1 de ${n}. Fica 1 de fora, e qualquer um dos ${n} pode ser esse: são ${n} formas.` }]),
      ],
      hints: [`Escolher os ${k} que vão é o mesmo que escolher os ${out} que ficam.`, `Calcule C(${n}, ${out}), bem mais curto que C(${n}, ${k}).`],
      solution: [`$C(${n}, ${k}) = C(${n}, ${out})`, `$${cline(n, out)}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: grupos com condições

const MIXES = [
  { a: ['menina', 'meninas'], b: ['menino', 'meninos'], fa: true, intro: (na: number, nb: number) => `Uma escola tem ${na} meninas e ${nb} meninos inscritos para a equipe de robótica.` },
  { a: ['professora', 'professoras'], b: ['estudante', 'estudantes'], fa: true, intro: (na: number, nb: number) => `Para a comissão de formatura, há ${na} professoras e ${nb} estudantes disponíveis.` },
  { a: ['enfermeiro', 'enfermeiros'], b: ['médico', 'médicos'], fa: false, intro: (na: number, nb: number) => `Um hospital tem ${na} enfermeiros e ${nb} médicos disponíveis para um plantão especial.` },
];

/** Composição fixa: C(a, x) × C(b, y). */
function productCombGen(r: Rand) {
  for (;;) {
    const g = r.pick(MIXES);
    const na = r.int(4, 8);
    const nb = r.int(3, 7);
    const x = r.int(1, 3);
    const y = r.int(1, 3);
    if (x >= na || y >= nb) continue;
    if (na === 5 && nb === 4 && x === 3 && y === 2) continue; // exemplo da teoria
    const ans = C(na, x) * C(nb, y);
    return draftNumeric({
      prompt: [p(g.intro(na, nb))],
      ask: `De quantas formas é possível escolher ${x} ${x === 1 ? g.a[0] : g.a[1]} e ${y} ${y === 1 ? g.b[0] : g.b[1]}?`,
      answer: ans,
      wrong: [
        { value: C(na, x) + C(nb, y), feedback: `Isso soma as escolhas. Cada grupo de ${g.a[1]} combina com cada grupo de ${g.b[1]}: é "e", então multiplique.` },
        { value: C(na + nb, x + y), feedback: `Isso escolhe ${x + y} pessoas quaisquer, sem garantir a composição pedida.` },
        { value: A(na, x) * A(nb, y), feedback: 'Isso conta com ordem dentro de cada grupo. A ordem dos escolhidos não importa: use combinações.' },
      ],
      hints: [`Escolha ${g.fa ? 'as' : 'os'} ${g.a[1]}: C(${na}, ${x}). Escolha os ${g.b[1]}: C(${nb}, ${y}).`, 'As duas escolhas formam juntas o mesmo grupo: multiplique.'],
      solution: [`$${cline(na, x)}`, `$${cline(nb, y)}`, `$${num(C(na, x))} × ${num(C(nb, y))} = ${num(ans)}`],
    });
  }
}

/** Alguém obrigatoriamente dentro (ou fora) do grupo. */
function includeGen(r: Rand) {
  for (;;) {
    const n = r.int(7, 14);
    const k = r.int(3, 5);
    const inside = r.next() < 0.5;
    if (k >= n - 1) continue;
    if (inside && n === 10 && k === 3) continue; // exercício da teoria
    const name = r.pick(['Carla', 'Diego', 'Helena', 'Rafael']);
    const ans = inside ? C(n - 1, k - 1) : C(n - 1, k);
    return draftNumeric({
      prompt: [p(`Uma comissão de ${k} pessoas será formada entre ${n} candidatos. ${name} ${inside ? 'precisa fazer parte da comissão' : 'não pode fazer parte da comissão, por já participar de outra'}.`)],
      ask: 'Quantas comissões diferentes podem ser formadas?',
      answer: ans,
      wrong: [
        { value: C(n, k), feedback: `Esse é o total sem a condição sobre ${name}.` },
        inside
          ? { value: C(n - 1, k), feedback: `Isso tira ${name} e escolhe as ${k} vagas entre os outros. ${name} já ocupa uma vaga: escolha só ${k - 1} entre os ${n - 1} restantes.` }
          : { value: C(n - 1, k - 1), feedback: `Isso reserva uma vaga para ${name}. ${name} está fora: as ${k} vagas são escolhidas entre os ${n - 1} outros.` },
        { value: A(n - 1, inside ? k - 1 : k), feedback: 'Isso conta com ordem. Numa comissão, a ordem dos membros não importa: divida pelo fatorial.' },
      ],
      hints: [inside ? `${name} já está dentro: sobram ${k - 1} vagas.` : `${name} está fora: sobram ${n - 1} candidatos.`, inside ? `Escolha ${k - 1} entre os outros ${n - 1}: C(${n - 1}, ${k - 1}).` : `Escolha ${k} entre ${n - 1}: C(${n - 1}, ${k}).`],
      solution: [`$${cline(n - 1, inside ? k - 1 : k)}`],
    });
  }
}

/** Um líder e um grupo: n × C(n − 1, k − 1). */
function leaderGen(r: Rand) {
  for (;;) {
    const n = r.int(6, 12);
    const k = r.int(3, 5);
    if (k >= n) continue;
    const ans = n * C(n - 1, k - 1);
    return draftNumeric({
      prompt: [p(`Entre ${n} funcionários, será formada uma equipe de ${k} pessoas, e um dos ${k} será o coordenador.`)],
      ask: 'De quantas formas a equipe com seu coordenador pode ser escolhida?',
      answer: ans,
      wrong: [
        { value: C(n, k), feedback: `Isso escolhe a equipe, mas esquece de escolher o coordenador. Ele tem uma função diferente dos outros.` },
        { value: A(n, k), feedback: `Isso dá uma função diferente a cada um dos ${k}. Só o coordenador é diferente; os outros ${k - 1} formam um grupo.` },
        { value: n * C(n, k - 1), feedback: `Depois de escolher o coordenador, sobram ${n - 1} pessoas para as outras ${k - 1} vagas.` },
      ],
      hints: [`Escolha o coordenador: ${n} opções.`, `Depois, os outros ${k - 1} entre os ${n - 1} restantes: C(${n - 1}, ${k - 1}).`],
      solution: [`$${cline(n - 1, k - 1)}`, `$${n} × ${num(C(n - 1, k - 1))} = ${num(ans)}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: pelo menos um

/** "Pelo menos um" do grupo X: total − nenhum. */
function atLeastGen(r: Rand) {
  for (;;) {
    const g = r.pick(MIXES);
    const na = r.int(2, 6);
    const nb = r.int(4, 9);
    const k = r.int(3, 5);
    if (k > nb || k > na + nb - 1) continue;
    if (na === 4 && nb === 6 && k === 4) continue; // questão do banco
    if (na === 5 && nb === 7 && k === 3) continue; // exemplo da teoria
    if (na === 3 && nb === 8 && k === 4) continue; // exercício da teoria
    const total = C(na + nb, k);
    const none = C(nb, k);
    const ans = total - none;
    const [one, many] = g.a;
    const um = g.fa ? 'uma' : 'um';
    const nenhum = g.fa ? 'nenhuma' : 'nenhum';
    return draftNumeric({
      prompt: [p(`${g.intro(na, nb)} Será formado um grupo de ${k} pessoas.`)],
      ask: `Quantos grupos diferentes têm pelo menos ${um} ${one}?`,
      answer: ans,
      wrong: [
        { value: total, feedback: `Esse é o total, sem a condição. Tire os grupos sem ${nenhum} ${one}.` },
        { value: none, feedback: `Esses são os grupos sem ${nenhum} ${one}: C(${nb}, ${k}). A resposta é o total menos eles.` },
        { value: na * C(na + nb - 1, k - 1), feedback: `Isso fixa ${um} ${one} e completa com quaisquer ${k - 1}, contando várias vezes os grupos com mais de ${um}. Use o complemento.` },
        { value: na * C(nb, k - 1), feedback: `Esses são os grupos com exatamente ${um} ${one}. "Pelo menos ${um}" inclui os grupos com mais ${many}.` },
      ],
      hints: [`Total de grupos: C(${na + nb}, ${k}) = ${num(total)}.`, `Sem ${nenhum} ${one}: C(${nb}, ${k}) = ${num(none)}.`],
      solution: [`$${cline(na + nb, k)}`, `$${cline(nb, k)}`, `$${num(total)} − ${num(none)} = ${num(ans)}`],
    });
  }
}

/** "No máximo um": os casos com zero e com exatamente um. */
function atMostGen(r: Rand) {
  for (;;) {
    const na = r.int(3, 6);
    const nb = r.int(4, 8);
    const k = r.int(3, 4);
    if (k > nb) continue;
    const zero = C(nb, k);
    const one = na * C(nb, k - 1);
    const ans = zero + one;
    return draftNumeric({
      prompt: [p(`Numa caixa há ${na} lâmpadas queimadas e ${nb} boas. Serão retiradas ${k} lâmpadas ao mesmo tempo.`)],
      ask: 'Quantas retiradas diferentes têm no máximo uma lâmpada queimada?',
      answer: ans,
      wrong: [
        { value: one, feedback: 'Esses são só os casos com exatamente uma queimada. "No máximo uma" também inclui nenhuma.' },
        { value: zero, feedback: 'Esses são só os casos sem nenhuma queimada. "No máximo uma" também inclui exatamente uma.' },
        { value: C(na + nb, k) - ans, feedback: 'Esses são os casos com duas ou mais queimadas, o contrário do que se pede.' },
      ],
      hints: ['"No máximo uma" = nenhuma ou exatamente uma.', `Nenhuma: C(${nb}, ${k}); exatamente uma: ${na} × C(${nb}, ${k - 1}).`],
      solution: [`$nenhuma: ${cline(nb, k)}`, `$exatamente uma: ${na} × C(${nb}, ${k - 1}) = ${na} × ${num(C(nb, k - 1))} = ${num(one)}`, `$${num(zero)} + ${num(one)} = ${num(ans)}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: maestria

/** Campeonatos: turno único (combinação) ou turno e returno (arranjo). */
function tournamentGen(r: Rand) {
  const n = r.int(6, 20);
  const twice = r.next() < 0.5;
  const ans = twice ? n * (n - 1) : C(n, 2);
  return draftNumeric({
    prompt: [p(`Num campeonato com ${n} times, cada time enfrenta cada um dos outros ${twice ? 'duas vezes, uma em casa e outra fora (turno e returno)' : 'uma única vez'}.`)],
    ask: 'Quantas partidas serão disputadas?',
    answer: ans,
    wrong: twice
      ? [
          { value: C(n, 2), feedback: 'Isso conta um jogo por par de times. Com turno e returno, cada par joga duas vezes: em casa de um e em casa do outro.' },
          { value: n * n, feedback: 'Isso inclui cada time jogando contra ele mesmo.' },
        ]
      : [
          { value: n * (n - 1), feedback: 'Isso conta cada partida duas vezes (A × B e B × A). Com turno único, divida por 2.' },
          { value: n * n, feedback: 'Isso inclui cada time jogando contra ele mesmo e conta cada partida duas vezes.' },
        ],
    hints: [`Cada time enfrenta os outros ${n - 1}.`, twice ? 'Com mando de campo, A × B e B × A são partidas diferentes: não divida.' : 'A × B e B × A são a mesma partida: divida por 2.'],
    solution: [twice ? `$${n} × ${n - 1} = ${num(ans)}` : `$${n} × ${n - 1} ÷ 2 = ${num(ans)}`],
  });
}

// ———————————————————————————————————————————————— aula

export const COMBINACAO = lesson({
  id: 'combinacao',
  topic: 'combinatoria',
  subtopics: ['combinacao'],
  title: 'Combinações',
  summary: 'Grupos em que a ordem não importa: dividir as filas pelas ordens repetidas, a fórmula C(n, k) e a simetria, grupos com condições, "pelo menos um" pelo complemento e campeonatos de turno único ou com returno.',
  requires: ['principio-multiplicativo'],
  stages: [
    stage('ordem', 'descoberta', 'A ordem importa?', 'Distinguir situações em que a ordem importa (arranjos) daquelas em que não importa (combinações) e contar grupos dividindo as filas pelas ordens repetidas.', () => ({
      learn: [
        text('Em muitos problemas, a **ordem não importa**: a comissão {Ana, Bia, Caio} é a mesma que {Caio, Ana, Bia}. Um jeito seguro de contar esses grupos é contar como se fossem filas (com o princípio multiplicativo) e depois **dividir pelas ordens repetidas**: cada grupo de k pessoas aparece em k! filas diferentes.'),
        lab({
          title: 'Filas e grupos',
          intro: 'Escolha quantas pessoas há (n) e quantas serão escolhidas (k). Compare as filas, em que a ordem importa, com os grupos, em que não importa.',
          params: [
            { key: 'n', label: 'Pessoas (n)', min: 3, max: 12, step: 1, value: 4, format: (v) => String(v) },
            { key: 'k', label: 'Escolhidas (k)', min: 1, max: 4, step: 1, value: 2, format: (v) => String(v) },
          ],
          readouts: ({ n, k }) => [
            { label: 'Filas (ordem importa)', value: k <= n ? `${factors(n, k)} = ${num(A(n, k))}` : '—' },
            { label: 'Cada grupo aparece', value: `${k}! = ${fact(k)} vezes` },
            { label: 'Grupos (ordem não importa)', value: k <= n ? num(C(n, k)) : '0', big: true, tone: 'ember' },
          ],
          viz: ({ n, k }) => ({
            kind: 'bars',
            bars: [
              { label: 'Filas', value: k <= n ? A(n, k) : 0, tone: 'mist' },
              { label: 'Grupos', value: k <= n ? C(n, k) : 0, tone: 'ember' },
            ],
            summary: `Com ${n} pessoas e ${k} escolhidas: ${num(k <= n ? A(n, k) : 0)} filas e ${num(k <= n ? C(n, k) : 0)} grupos`,
          }),
          goal: {
            task: 'Num torneio em que cada time joga uma única vez contra cada outro, ache quantos times dão 45 jogos.',
            done: ({ n, k }) => k === 2 && n === 10,
            success: 'Isso: cada jogo é um par de times, sem ordem. Com 10 times, são 10 × 9 = 90 filas, e cada par aparece 2 vezes: 45 jogos.',
          },
          insight: 'Quanto maior k, mais ordens cada grupo tem (k!) e maior a diferença entre filas e grupos.',
        }),
        example('Dois sabores no copinho', 'Uma sorveteria tem 4 sabores (morango, uva, coco e limão). Quantos copinhos com 2 sabores diferentes podem ser montados, se a ordem das bolas não importa?', [
          step('Como fila:', '4 × 3 = 12 filas (morango-uva, uva-morango, …)'),
          askStep('Mas morango-uva e uva-morango são o mesmo copinho.', 'Quantas vezes cada par aparece entre as 12 filas?', [
            ok('2 vezes'),
            no('1 vez', 'Cada par aparece nas duas ordens, então as 12 filas contam cada copinho duas vezes.'),
          ]),
          step('Grupos:', '12 ÷ 2 = 6 copinhos'),
        ], 'São 6 copinhos: cada par de sabores conta uma vez só.'),
        check(classify({
          ask: 'Em cada situação, a ordem dos escolhidos importa?',
          bins: ['A ordem importa', 'A ordem não importa'],
          items: [
            { text: 'Pódio de uma corrida (ouro, prata e bronze)', bin: 0, why: 'Trocar quem fica com o ouro muda o pódio.' },
            { text: 'Comissão de 3 pessoas com a mesma função', bin: 1, why: '{Ana, Bia, Caio} é a mesma comissão em qualquer ordem.' },
            { text: 'Senha de 4 algarismos', bin: 0, why: '1234 e 4321 são senhas diferentes.' },
            { text: 'Salada com 3 frutas escolhidas entre 8', bin: 1, why: 'A salada é a mesma, não importa a ordem em que as frutas foram escolhidas.' },
            { text: 'Presidente e vice de um grêmio', bin: 0, why: 'Os cargos são diferentes.' },
            { text: 'Apertos de mão entre duas pessoas', bin: 1, why: 'A com B é o mesmo aperto que B com A.' },
          ],
          solution: ['Se trocar a ordem dos escolhidos produz outra situação (cargos, posições, senhas), a ordem importa. Se não muda nada (grupos, comissões, misturas), não importa.'],
        })),
      ],
      practice: [gen(orderOrNotGen), gen(pairsGen), gen(orderOrNotGen)],
      challenge: [gen(pairsGen), gen(orderOrNotGen), gen(pairsGen)],
      recap: [
        'Trocar a ordem muda o resultado? Então é fila (arranjo).',
        'Não muda? É grupo (combinação): filas ÷ k!.',
        'Pares sem ordem: n × (n − 1) ÷ 2.',
      ],
    })),

    stage('formula', 'fundamentos', 'Calculando combinações', 'Calcular C(n, k) simplificando antes de multiplicar e usar a simetria C(n, k) = C(n, n − k).', () => ({
      learn: [
        text('O número de grupos de k elementos escolhidos entre n é a **combinação** C(n, k): as filas de k elementos (n × (n − 1) × …, com k fatores) divididas por k!. Na prática, escreva só os k fatores de cima e os k de baixo e **simplifique antes de multiplicar**. E lembre a **simetria**: escolher os k que vão é o mesmo que escolher os n − k que ficam, então C(n, k) = C(n, n − k).'),
        math('C(n, k) = [[n!|k! · (n − k)!]] = [[n × (n − 1) × … (k fatores)|k!]]', 'C(8, 2) = [[8 × 7|2 × 1]] = 28'),
        example('Uma comissão de 3 entre 10', 'Quantas comissões de 3 pessoas podem ser formadas com 10 candidatos?', [
          askStep('Monte a fração.', 'Quantos fatores ficam no numerador?', [
            ok('3: 10 × 9 × 8'),
            no('10: o 10! inteiro', 'Os fatores de (10 − 3)! = 7! se cancelam com os de baixo: sobram só 3 fatores no numerador.'),
          ]),
          step('Simplifique e calcule:', 'C(10, 3) = (10 × 9 × 8) ÷ (3 × 2 × 1)', '= 720 ÷ 6 = 120'),
        ], 'São 120 comissões.'),
        reveal('Por que C(12, 10) = C(12, 2)?', 'Escolher os 10 que vão a uma excursão é o mesmo que escolher os 2 que ficam. Por isso C(12, 10) = C(12, 2) = (12 × 11) ÷ 2 = 66 — e a conta com 2 fatores é muito mais curta que com 10.'),
        check(numeric({
          prompt: [p('Numa reunião com 7 pessoas, cada uma cumprimenta cada outra com um aperto de mão, uma única vez.')],
          ask: 'Quantos apertos de mão acontecem?',
          answer: 21,
          wrong: [
            { value: 42, feedback: 'Isso conta cada aperto duas vezes (A com B e B com A). Divida 7 × 6 por 2.' },
            { value: 49, feedback: 'Isso inclui cada pessoa cumprimentando a si mesma e conta cada aperto duas vezes.' },
            { value: 14, feedback: 'Isso multiplica 7 por 2. Cada pessoa cumprimenta as outras 6, e cada aperto envolve 2 pessoas.' },
          ],
          solution: ['$C(7, 2) = (7 × 6) ÷ 2 = 21'],
        })),
      ],
      practice: [gen(combGen), gen(symmetryGen), gen(combGen)],
      challenge: [gen(symmetryGen), gen(combGen), gen(orderOrNotGen)],
      recap: [
        'C(n, k) = (k fatores a partir de n) ÷ k!.',
        'Simplifique antes de multiplicar.',
        'C(n, k) = C(n, n − k): escolher quem vai = escolher quem fica.',
      ],
    })),

    stage('condicoes', 'aplicacoes', 'Grupos com condições', 'Formar grupos com composição fixa, com alguém obrigatoriamente dentro ou fora e com um líder, combinando combinações com o princípio multiplicativo.', () => ({
      learn: [
        text('Quando o grupo tem **composição definida** (2 meninas E 3 meninos), escolha cada parte separadamente e **multiplique**. Se alguém **precisa estar** no grupo, ele já ocupa uma vaga: escolha as outras entre os restantes. Se **não pode estar**, tire-o da lista. E se um dos escolhidos tem **função especial** (coordenador), escolha-o primeiro e depois o grupo.'),
        lab({
          title: 'Quantas meninas na equipe?',
          intro: 'Uma escola tem 5 meninas e 7 meninos inscritos, e a equipe terá 4 pessoas. Escolha quantas meninas a equipe terá.',
          params: [{ key: 'w', label: 'Meninas na equipe', min: 0, max: 4, step: 1, value: 0, format: (v) => String(v) }],
          readouts: ({ w }) => [
            { label: 'Conta', value: `C(5, ${w}) × C(7, ${4 - w}) = ${C(5, w)} × ${C(7, 4 - w)}` },
            { label: 'Equipes', value: num(C(5, w) * C(7, 4 - w)), big: true, tone: 'ember' },
          ],
          viz: ({ w }) => ({
            kind: 'bars',
            bars: [0, 1, 2, 3, 4].map((j) => ({ label: `${j}`, value: C(5, j) * C(7, 4 - j), tone: j === w ? ('ember' as const) : ('mist' as const) })),
            summary: `Com ${w} meninas e ${4 - w} meninos, há ${num(C(5, w) * C(7, 4 - w))} equipes; somando todos os casos, ${num(C(12, 4))}`,
          }),
          goal: {
            task: 'Ache quantas meninas na equipe permitem o maior número de equipes diferentes.',
            done: ({ w }) => w === 2,
            success: 'Isso: C(5, 2) × C(7, 2) = 10 × 21 = 210 equipes. Somando todos os casos (35 + 175 + 210 + 70 + 5), dá 495 = C(12, 4), o total sem condição.',
          },
          insight: 'Cada barra é um produto de duas combinações; juntas, as barras somam o total de equipes sem condição.',
        }),
        example('Composição fixa', 'De 5 meninas e 4 meninos, quantas equipes com 3 meninas e 2 meninos podem ser formadas?', [
          step('Cada parte:', 'meninas: C(5, 3) = 10', 'meninos: C(4, 2) = 6'),
          askStep('Agora, junte as partes.', 'Somar ou multiplicar?', [
            ok('Multiplicar: cada trio de meninas combina com cada dupla de meninos'),
            no('Somar: 10 + 6 = 16', 'As duas escolhas formam juntas a mesma equipe: é "e", então multiplica.'),
          ]),
          step('Total:', '10 × 6 = 60 equipes'),
        ], 'São 60 equipes.'),
        check(numeric({
          prompt: [p('Uma comissão de 3 pessoas será formada entre 10 candidatos, e Carla precisa fazer parte dela.')],
          ask: 'Quantas comissões diferentes podem ser formadas?',
          answer: 36,
          wrong: [
            { value: 120, feedback: 'Esse é o total sem a condição, C(10, 3).' },
            { value: 84, feedback: 'Isso escolhe as 3 vagas entre os outros 9, deixando Carla de fora. Ela já ocupa uma vaga: escolha 2 entre 9.' },
            { value: 72, feedback: 'Isso conta com ordem (9 × 8). Na comissão, a ordem não importa: divida por 2.' },
          ],
          solution: ['$Carla já está: faltam 2 vagas entre 9 pessoas', '$C(9, 2) = (9 × 8) ÷ 2 = 36'],
        })),
      ],
      practice: [gen(productCombGen), gen(includeGen), gen(leaderGen)],
      challenge: [gen(leaderGen), gen(productCombGen), gen(includeGen)],
      recap: [
        'Composição fixa: C(a, x) × C(b, y).',
        'Alguém dentro: C(n − 1, k − 1). Alguém fora: C(n − 1, k).',
        'Função especial: escolha-a primeiro e depois o grupo.',
      ],
    })),

    stage('pelo-menos', 'aprofundamento', 'Pelo menos um', 'Contar grupos com "pelo menos um" pelo complemento e grupos com "no máximo um" somando casos, evitando a contagem dupla.', () => ({
      learn: [
        text('"**Pelo menos um**" junta vários casos (exatamente um, exatamente dois, …). O caminho mais curto é o **complemento**: total de grupos menos os grupos sem nenhum. Já "**no máximo um**" é a soma de dois casos: nenhum e exatamente um. Cuidado com o atalho "escolho um e completo com quaisquer": ele conta várias vezes os grupos que têm mais de um.'),
        example('Pelo menos uma menina', 'De 5 meninas e 7 meninos, quantas equipes de 3 têm pelo menos uma menina?', [
          askStep('Há dois caminhos.', 'Qual é o mais curto?', [
            ok('Total menos as equipes sem nenhuma menina'),
            no('Somar os casos com 1, 2 e 3 meninas', 'Também dá certo (5 × 21 + 10 × 7 + 10 = 185), mas são três contas. O complemento resolve com duas.'),
          ]),
          step('Pelo complemento:', 'total: C(12, 3) = 220', 'sem meninas: C(7, 3) = 35', '220 − 35 = 185'),
        ], 'São 185 equipes com pelo menos uma menina.'),
        warn('O atalho que conta demais', 'Escolher "uma menina obrigatória" (5 opções) e completar com 2 quaisquer (C(11, 2) = 55) dá 275, mais que o total de 220! Uma equipe com duas meninas foi contada duas vezes — uma vez para cada menina "obrigatória".'),
        reveal('Quando usar o complemento?', 'Sempre que o oposto for mais simples de contar. "Pelo menos um" tem como oposto "nenhum", que costuma ser uma combinação só. "No máximo um" é curto do jeito direto: nenhum mais exatamente um.'),
        check(numeric({
          prompt: [p('Um grupo de amigos tem 3 vegetarianos e 8 pessoas que comem carne. Quatro deles serão sorteados para cozinhar um jantar.')],
          ask: 'Quantos grupos de 4 têm pelo menos um vegetariano?',
          answer: 260,
          wrong: [
            { value: 330, feedback: 'Esse é o total de grupos, C(11, 4). Tire os grupos sem nenhum vegetariano.' },
            { value: 70, feedback: 'Esses são os grupos sem vegetarianos, C(8, 4). A resposta é o total menos eles.' },
            { value: 360, feedback: 'Isso fixa um vegetariano e completa com quaisquer 3 (3 × C(10, 3)), contando várias vezes os grupos com mais de um vegetariano.' },
            { value: 168, feedback: 'Esses são os grupos com exatamente um vegetariano (3 × C(8, 3)). "Pelo menos um" inclui os com dois ou três.' },
          ],
          solution: ['$total: C(11, 4) = 330', '$sem vegetarianos: C(8, 4) = 70', '$330 − 70 = 260'],
        })),
      ],
      practice: [gen(atLeastGen), gen(atMostGen), gen(atLeastGen)],
      challenge: [gen(atMostGen), gen(atLeastGen), gen(productCombGen)],
      recap: [
        '"Pelo menos um" = total − nenhum.',
        '"No máximo um" = nenhum + exatamente um.',
        'Fixar um e completar com quaisquer conta grupos repetidos.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: combinações no ENEM', 'Resolver problemas inéditos que exigem decidir se a ordem importa, montar grupos com condições e usar o complemento.', () => ({
      learn: [
        strategy('Grupos em 4 passos', '1) A ordem importa? Se não, combinação. 2) Há condições? Separe as partes do grupo (composição, alguém dentro ou fora, função especial). 3) "Pelo menos um": complemento. 4) Junte as partes: "e" multiplica, casos alternativos somam.'),
        example('Turno e returno', 'Num campeonato com 12 times, cada time enfrenta cada outro duas vezes, uma em casa e outra fora. Quantas partidas há?', [
          step('Cada time recebe os outros 11 em casa:', '12 times × 11 jogos em casa'),
          askStep('Com mando de campo, A em casa contra B é diferente de B em casa contra A.', 'A ordem importa?', [
            ok('Sim: são 12 × 11 = 132 partidas'),
            no('Não: são C(12, 2) = 66 partidas', 'Isso vale para turno único. Com returno, cada par de times joga duas vezes.'),
          ]),
        ], 'São 132 partidas — o dobro das 66 de um turno único.'),
        reveal('Combinação ou princípio multiplicativo?', 'Os dois andam juntos. A combinação conta um grupo; o princípio multiplicativo junta etapas (escolher o líder E o grupo; as meninas E os meninos). A maioria dos problemas usa os dois.'),
        check(numeric({
          prompt: [p('Entre 9 funcionários, será formada uma equipe de 4 pessoas, e um dos 4 será o coordenador.')],
          ask: 'De quantas formas a equipe com seu coordenador pode ser escolhida?',
          answer: 504,
          wrong: [
            { value: 126, feedback: 'Isso escolhe a equipe (C(9, 4)), mas esquece de escolher o coordenador entre os 4.' },
            { value: 3024, feedback: 'Isso dá uma função diferente a cada um (9 × 8 × 7 × 6). Só o coordenador é diferente.' },
            { value: 756, feedback: 'Depois de escolher o coordenador, sobram 8 pessoas para as outras 3 vagas: C(8, 3), e não C(9, 3).' },
          ],
          solution: ['$coordenador: 9 opções', '$os outros 3: C(8, 3) = 56', '$9 × 56 = 504'],
        })),
      ],
      practice: [gen(tournamentGen), gen(atLeastGen), gen(includeGen)],
      challenge: [gen(atLeastGen), gen(tournamentGen), gen(leaderGen), gen(symmetryGen)],
      recap: [
        'Ordem importa → arranjo; não importa → combinação.',
        'Condições: separe o grupo em partes e multiplique.',
        'Pelo menos um → complemento.',
      ],
    })),
  ],
});
