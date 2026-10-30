/**
 * Aula: Regra de três inversa — grandezas inversamente proporcionais (produto constante),
 * montar a proporção invertida com horas e minutos e diferenças de tempo, mudanças
 * percentuais (verba fixa, capacidade), peças e área, engrenagens, mudanças no meio do
 * caminho (estoque, máquinas, equipe), frotas e intervalos, ida e volta.
 */
import {
  askStep,
  check,
  choice,
  classify,
  data,
  draftNumeric,
  example,
  gen,
  key,
  lab,
  lesson,
  no,
  numeric,
  ok,
  p,
  reveal,
  sample,
  stage,
  step,
  strategy,
  table,
  text,
  tip,
  warn,
} from '../../kit/build';
import { brl, hm, num, round } from '../../kit/format';
import type { Rand } from '../../types';

const divisorsIn = (n: number, lo: number, hi: number) => {
  const out: number[] = [];
  for (let d = lo; d <= hi; d++) if (n % d === 0) out.push(d);
  return out;
};

// ———————————————————————————————————————————————— geradores

interface InvCtx {
  ks: number[];
  lo: number;
  hi: number;
  given: (x: number, y: number) => string;
  ask: (x: number) => string;
  unit?: string;
  prefix?: string;
  fy: (v: number) => string;
  skip?: (k: number, x1: number, x2: number) => boolean;
}

const INVERSE_CTX: InvCtx[] = [
  {
    ks: [48, 60, 72, 90, 120],
    lo: 2,
    hi: 15,
    given: (x, y) => `${x} pedreiros, todos no mesmo ritmo, constroem um muro em ${num(y, 2)} dias.`,
    ask: (x) => `Em quantos dias ${x} pedreiros, no mesmo ritmo, construiriam o mesmo muro?`,
    unit: 'dias',
    fy: (v) => `${num(v, 2)} dias`,
    skip: (k, x1, x2) => k === 60 && x1 === 6 && x2 === 4,
  },
  {
    ks: [60, 72, 84, 90, 120],
    lo: 2,
    hi: 8,
    given: (x, y) => `${x} torneiras iguais, abertas juntas, enchem um tanque em ${num(y, 2)} minutos.`,
    ask: (x) => `Em quantos minutos ${x} torneiras iguais encheriam o mesmo tanque?`,
    unit: 'min',
    fy: (v) => `${num(v, 2)} min`,
  },
  {
    ks: [1200, 1800, 2400, 3600],
    lo: 3,
    hi: 12,
    given: (x, y) => `Um produto é vendido em ${x} parcelas mensais iguais de ${brl(y)}, sem juros.`,
    ask: (x) => `Qual seria o valor de cada parcela em ${x} parcelas iguais, também sem juros?`,
    prefix: 'R$',
    fy: brl,
  },
  {
    ks: [360, 480, 600, 720],
    lo: 10,
    hi: 60,
    given: (x, y) => `Um rolo de fita rende ${num(y, 2)} pedaços de ${x} cm, sem sobra.`,
    ask: (x) => `Quantos pedaços de ${x} cm o mesmo rolo renderia, sem sobra?`,
    unit: 'pedaços',
    fy: (v) => `${num(v, 2)} pedaços`,
  },
];

/** Produto constante: x₁ · y₁ = x₂ · y₂. */
function inverseGen(r: Rand) {
  for (;;) {
    const c = r.pick(INVERSE_CTX);
    const k = r.pick(c.ks);
    const ds = divisorsIn(k, c.lo, c.hi);
    if (ds.length < 2) continue;
    const [x1, x2] = r.shuffle(ds).slice(0, 2);
    if (c.skip?.(k, x1, x2)) continue;
    const y1 = k / x1;
    const y2 = k / x2;
    if (!Number.isInteger(round(y1 * 100, 6)) || !Number.isInteger(round(y2 * 100, 6))) continue;
    return draftNumeric({
      prompt: [p(c.given(x1, y1))],
      ask: c.ask(x2),
      unit: c.unit,
      prefix: c.prefix,
      answer: round(y2, 2),
      wrong: [
        { value: round((y1 * x2) / x1, 2), feedback: 'Isso trata as grandezas como diretamente proporcionais. Aqui, quando uma aumenta, a outra DIMINUI na mesma proporção.' },
        { value: round(y1 - (x2 - x1), 2), feedback: 'Somar ou subtrair a diferença não mantém o produto constante. Inversamente proporcional é dividir, não subtrair.' },
        { value: k, feedback: `${num(k)} é o produto constante (${x1} × ${c.fy(y1)}). Divida-o por ${x2}.` },
      ].filter((w) => w.value > 0),
      hints: ['O que fica constante? O PRODUTO das duas grandezas.', `${x1} × ${num(y1, 2)} = ${num(k)}; agora divida por ${x2}.`],
      solution: [`$${x1} × ${num(y1, 2)} = ${x2} × y → y = ${num(k)} ÷ ${x2} = ${num(y2, 2)}`],
    });
  }
}

/** Velocidade × tempo constante (ou tamanho de arquivo): tempo em minutos e diferenças. */
function speedTimeGen(r: Rand) {
  for (;;) {
    if (r.next() < 0.3) {
      const size = r.pick([1200, 1800, 2400, 3600, 4800]);
      const [a, b] = r.shuffle([15, 20, 25, 30, 40, 50, 60]).slice(0, 2).sort((x, y) => x - y);
      const tA = size / a;
      const tB = size / b;
      if (!Number.isInteger(tA) || !Number.isInteger(tB) || (size === 2400 && a === 20 && b === 30)) continue;
      return draftNumeric({
        prompt: [p(`Um arquivo de ${num(size)} MB pode ser baixado por uma conexão de ${a} MB/s ou por outra de ${b} MB/s, ambas sem oscilação.`)],
        ask: 'Quantos segundos se economizam usando a conexão mais rápida?',
        unit: 's',
        answer: tA - tB,
        wrong: [
          { value: tB, feedback: `${tB} s é o tempo na conexão mais rápida. A economia é a diferença para a mais lenta.` },
          { value: tA, feedback: `${tA} s é o tempo na conexão mais lenta. Falta subtrair o da mais rápida.` },
          { value: round(size / (b - a), 2), feedback: `Dividir pela diferença das velocidades (${b} − ${a}) não dá a diferença dos tempos. Calcule cada tempo e subtraia.` },
        ],
        hints: ['Tempo = tamanho ÷ velocidade, para cada conexão.', `${num(size)} ÷ ${a} e ${num(size)} ÷ ${b}.`],
        solution: [`$${num(size)} ÷ ${a} = ${tA} s; ${num(size)} ÷ ${b} = ${tB} s`, `$Economia: ${tA} − ${tB} = ${tA - tB} s`],
      });
    }
    const D = r.pick([120, 150, 180, 240, 300, 360, 420, 480]);
    const [v1, v2] = r.shuffle([40, 45, 48, 50, 60, 72, 75, 80, 90, 100, 120]).slice(0, 2);
    const m1 = (D / v1) * 60;
    const m2 = (D / v2) * 60;
    if (!Number.isInteger(m1) || !Number.isInteger(m2)) continue;
    if (D === 240 && v1 === 80 && v2 === 60) continue; // questão do banco
    const askDiff = r.next() < 0.45;
    const slower = v2 < v1;
    return draftNumeric({
      prompt: [p(`Um ônibus faz um trajeto em ${hm(m1 / 60)}, a ${v1} km/h de velocidade média.`)],
      ask: askDiff
        ? `Se a velocidade média fosse ${v2} km/h, quantos minutos a ${slower ? 'mais' : 'menos'} a viagem levaria?`
        : `Quantos minutos o ônibus levaria no mesmo trajeto a ${v2} km/h?`,
      unit: 'min',
      answer: askDiff ? Math.abs(m2 - m1) : m2,
      wrong: askDiff
        ? [
            { value: m2, feedback: `${m2} min é o tempo todo a ${v2} km/h. A pergunta é a diferença para os ${m1} min.` },
            { value: Math.abs(v1 - v2), feedback: 'A diferença de velocidades não é a diferença de tempo. Calcule os dois tempos e subtraia.' },
            { value: round(Math.abs((m1 * v2) / v1 - m1), 2), feedback: 'Isso usa uma proporção direta. Velocidade e tempo são inversamente proporcionais.' },
          ]
        : [
            { value: round((m1 * v2) / v1, 2), feedback: `Isso trata como direta: com ${slower ? 'MENOS' : 'MAIS'} velocidade, o ônibus leva ${slower ? 'MAIS' : 'MENOS'} tempo.` },
            { value: round(m2 / 60, 2), feedback: `${num(m2 / 60, 2)} é o tempo em HORAS. A pergunta pede minutos.` },
            { value: m1, feedback: 'O tempo muda quando a velocidade muda: a distância é que fica fixa.' },
          ],
      hints: [`Converta: ${hm(m1 / 60)} = ${m1} min. A distância é fixa: velocidade × tempo é constante.`, `${v1} × ${m1} = ${v2} × t.`],
      solution: [
        `$Distância: ${v1} km/h × ${hm(m1 / 60)} = ${D} km`,
        `$A ${v2} km/h: ${D} ÷ ${v2} = ${hm(m2 / 60)} = ${m2} min`,
        ...(askDiff ? [`$Diferença: ${Math.abs(m2 - m1)} min`] : []),
      ],
    });
  }
}

/** Verba ou carga fixa: o preço (ou a capacidade) muda p% e a quantidade se ajusta na inversa. */
function percentInverseGen(r: Rand) {
  for (;;) {
    const change = r.pick([-50, -40, -25, -20, 20, 25, 50, 60]);
    const f = 1 + change / 100;
    const truck = r.next() < 0.4;
    const q = truck ? r.int(6, 30) : r.int(10, 60);
    const nq = q / f;
    if (!Number.isInteger(round(nq, 9))) continue;
    if (!truck && q === 24 && change === -25) continue; // questão do banco
    if (truck && q === 12 && change === -20) continue; // questão do banco
    const pct = Math.abs(change);
    const naive = q * (1 - change / 100);
    const same = q * f;
    if (truck) {
      return draftNumeric({
        prompt: [p(`Uma carga seria levada em ${q} viagens completas por um caminhão. Um veículo substituto leva ${pct}% ${change < 0 ? 'menos' : 'mais'} carga por viagem, e também fará viagens completas.`)],
        ask: 'Quantas viagens o substituto vai precisar fazer?',
        unit: 'viagens',
        answer: nq,
        wrong: [
          { value: round(naive, 2), feedback: `${pct}% ${change < 0 ? 'a menos' : 'a mais'} por viagem não dá ${pct}% ${change < 0 ? 'a mais' : 'a menos'} de viagens: o número de viagens fica DIVIDIDO por ${num(f, 2)}.` },
          { value: round(same, 2), feedback: `Isso muda as viagens no MESMO sentido da capacidade. Com ${change < 0 ? 'menos' : 'mais'} carga por viagem, são necessárias ${change < 0 ? 'MAIS' : 'MENOS'} viagens.` },
        ],
        hints: [`A nova capacidade é ${num(f, 2)} da antiga.`, `Viagens × capacidade é constante: ${q} ÷ ${num(f, 2)}.`],
        solution: [`$Capacidade nova: × ${num(f, 2)}`, `$Viagens: ${q} ÷ ${num(f, 2)} = ${num(nq)}`],
      });
    }
    const price = r.pick([12, 15, 18, 20, 24, 30, 36, 40, 45]);
    const np = price * f;
    if (!Number.isInteger(round(np * 100, 6))) continue;
    return draftNumeric({
      prompt: [p(`Uma escola compra todo mês ${q} caixas de papel a ${brl(price)} cada uma. Neste mês, o preço ${change < 0 ? 'caiu' : 'subiu'} ${pct}%, e a escola vai gastar exatamente a mesma verba.`)],
      ask: 'Quantas caixas a escola poderá comprar?',
      unit: 'caixas',
      answer: nq,
      wrong: [
        { value: round(naive, 2), feedback: `${pct}% no preço não dá ${pct}% na quantidade: a quantidade fica DIVIDIDA por ${num(f, 2)} (verba ÷ novo preço).` },
        { value: round(same, 2), feedback: `Isso muda a quantidade no MESMO sentido do preço. Com o preço ${change < 0 ? 'menor' : 'maior'}, a mesma verba compra ${change < 0 ? 'MAIS' : 'MENOS'} caixas.` },
        { value: q, feedback: 'A quantidade muda quando o preço muda: a verba é que fica fixa.' },
      ],
      hints: [`Verba: ${q} × ${brl(price)} = ${brl(q * price)}.`, `Novo preço: ${brl(price)} × ${num(f, 2)} = ${brl(np)}.`],
      solution: [`$Verba: ${q} × ${num(price, 2)} = ${num(q * price, 2)}`, `$Novo preço: ${num(price, 2)} × ${num(f, 2)} = ${num(np, 2)}`, `$Caixas: ${num(q * price, 2)} ÷ ${num(np, 2)} = ${num(nq)}`],
    });
  }
}

const TILE_PAIRS: [number, number][] = [
  [20, 40],
  [25, 50],
  [30, 60],
  [20, 50],
  [40, 50],
  [40, 60],
  [30, 50],
  [60, 30],
  [50, 25],
];

/** Peças quadradas: a quantidade é inversa à área (lado²). */
function tilesGen(r: Rand) {
  for (;;) {
    const [a, b] = r.pick(TILE_PAIRS);
    const n = r.int(2, 30) * 10;
    const m = (n * a * a) / (b * b);
    if (!Number.isInteger(m) || m < 10) continue;
    return draftNumeric({
      prompt: [p(`Para cobrir um piso, seriam necessárias ${n} peças quadradas de ${a} cm de lado. A cliente preferiu peças quadradas de ${b} cm de lado.`)],
      ask: `Quantas peças de ${b} cm cobrem o mesmo piso, sem perdas?`,
      unit: 'peças',
      answer: m,
      wrong: [
        { value: round((n * a) / b, 2), feedback: 'Isso usa a razão dos LADOS. A quantidade de peças depende da ÁREA de cada uma (lado × lado).' },
        { value: round((n * b * b) / (a * a), 2), feedback: `Isso trata como direta: peças ${b > a ? 'maiores' : 'menores'} exigem ${b > a ? 'MENOS' : 'MAIS'} peças para o mesmo piso.` },
      ],
      hints: [`Área de cada peça: ${a}² = ${num(a * a)} cm² e ${b}² = ${num(b * b)} cm².`, `Área total: ${n} × ${num(a * a)} cm²; divida pela área da peça nova.`],
      solution: [`$Área do piso: ${n} × ${num(a * a)} = ${num(n * a * a)} cm²`, `$Peças de ${b} cm: ${num(n * a * a)} ÷ ${num(b * b)} = ${num(m)}`],
    });
  }
}

/** Engrenagens acopladas: dentes × voltas é constante. */
function gearGen(r: Rand) {
  for (;;) {
    const tA = r.pick([24, 30, 36, 40, 45, 48, 60, 72]);
    const tB = r.pick([12, 15, 16, 18, 20, 24, 30, 36]);
    const vA = r.pick([20, 25, 30, 40, 45, 50, 60, 80]);
    if (tA === tB) continue;
    const vB = (tA * vA) / tB;
    if (!Number.isInteger(vB * 2)) continue;
    return draftNumeric({
      prompt: [p(`Duas engrenagens estão acopladas: a engrenagem A tem ${tA} dentes, e a B tem ${tB} dentes. A engrenagem A dá ${vA} voltas por minuto.`)],
      ask: 'Quantas voltas por minuto dá a engrenagem B?',
      unit: 'voltas/min',
      answer: vB,
      wrong: [
        { value: round((vA * tB) / tA, 2), feedback: `Isso trata como direta. A engrenagem com ${tB < tA ? 'MENOS' : 'MAIS'} dentes gira ${tB < tA ? 'MAIS' : 'MENOS'} depressa: dentes × voltas é constante.` },
        { value: vA, feedback: 'As duas só dariam o mesmo número de voltas se tivessem o mesmo número de dentes.' },
        { value: tA * vA, feedback: `${num(tA * vA)} é o número de dentes que passam por minuto. Divida pelos ${tB} dentes de B.` },
      ],
      hints: ['No ponto de contato, passa o mesmo número de dentes nas duas engrenagens.', `${tA} × ${vA} = ${tB} × v.`],
      solution: [`$${tA} × ${vA} = ${tB} × v → v = ${num(tA * vA)} ÷ ${tB} = ${num(vB, 2)} voltas/min`],
    });
  }
}

/** Estoque que muda de consumidores no meio do caminho. */
function stockGen(r: Rand) {
  for (;;) {
    const N = r.pick([10, 12, 15, 16, 18, 20, 24, 30]);
    const D = r.pick([12, 15, 18, 20, 24, 30]);
    const d = r.int(2, Math.floor(D / 2));
    const left = N * (D - d);
    const maxMode = r.next() < 0.4;
    if (maxMode) {
      const E = r.int(Math.ceil((D - d) / 2), D - d - 1);
      const fit = left / E;
      if (Number.isInteger(fit) || Math.floor(fit) - N < 2) continue;
      if (N === 15 && D === 24 && d === 6 && E === 12) continue; // questão do banco
      const add = Math.floor(fit) - N;
      return draftNumeric({
        prompt: [p(`Um abrigo tem ração para ${N} cães durante ${D} dias. Depois de ${d} dias de consumo normal, quer receber novos cães e garantir ração para todos por mais ${E} dias completos, sem nova compra. Todos comem a mesma quantidade por dia.`)],
        ask: 'Qual é o maior número de novos cães que o abrigo pode receber?',
        unit: 'cães',
        answer: add,
        wrong: [
          { value: add + 1, feedback: `Com ${add + 1} novos cães, seriam ${N + add + 1} cães, e a ração restante (${left} porções) não dura ${E} dias. Arredonde para BAIXO.` },
          { value: Math.floor(fit), feedback: `${Math.floor(fit)} é o total de cães que a ração sustenta. Os novos são ${Math.floor(fit)} − ${N}.` },
          { value: round((N * D) / E - N, 2), feedback: `Isso ignora os ${d} dias já consumidos: restam só ${N} × ${D - d} = ${left} porções.` },
        ],
        hints: [`Porções restantes: ${N} × (${D} − ${d}) = ${left}.`, `Por ${E} dias, a ração sustenta ${left} ÷ ${E} = ${num(fit, 2)} cães.`],
        solution: [`$Restam ${N} × ${D - d} = ${left} porções`, `$${left} ÷ ${E} = ${num(fit, 2)} → no máximo ${Math.floor(fit)} cães → ${add} novos`],
      });
    }
    const k = r.int(2, 15);
    const days = left / (N + k);
    if (!Number.isInteger(days)) continue;
    if (N === 20 && D === 15 && d === 5 && k === 5) continue; // questão do banco
    return draftNumeric({
      prompt: [p(`Um haras tem ração para ${N} cavalos durante ${D} dias. Depois de ${d} dias de consumo normal, chegam mais ${k} cavalos, que comem a mesma quantidade diária que os outros.`)],
      ask: 'A partir da chegada, a ração restante dura quantos dias?',
      unit: 'dias',
      answer: days,
      wrong: [
        { value: round((N * D) / (N + k), 2), feedback: `Isso refaz a conta com o estoque inteiro, mas ${d} dias já foram consumidos: restam ${N} × ${D - d} porções.` },
        { value: D - d, feedback: `${D - d} dias seria o restante se nenhum cavalo chegasse. Com ${N + k} cavalos, a ração acaba antes.` },
        { value: round((N * D) / (N + k) - d, 2), feedback: `Subtrair os ${d} dias depois de dividir não acompanha o consumo. Calcule o que resta e divida por ${N + k}.` },
      ],
      hints: [`Porções restantes: ${N} × (${D} − ${d}).`, `Agora divida pelos ${N + k} cavalos.`],
      solution: [`$Restam ${N} × ${D - d} = ${left} porções`, `$${left} ÷ ${N + k} = ${days} dias`],
    });
  }
}

/** Máquinas que param (ou entram) no meio do serviço. */
function crewChangeGen(r: Rand) {
  for (;;) {
    const N = r.int(4, 12);
    const T = r.int(6, 20);
    const t = r.int(1, T - 2);
    const remove = r.next() < 0.65;
    const k = r.int(1, remove ? N - 2 : 6);
    const M = remove ? N - k : N + k;
    const after = (N * (T - t)) / M;
    if (!Number.isInteger(after * 2)) continue;
    if (remove && N === 6 && T === 10 && t === 2 && k === 2) continue; // questão do banco
    const total = t + after;
    const askTotal = r.next() < 0.6;
    return draftNumeric({
      prompt: [p(`${N} bombas iguais esvaziariam um reservatório em ${T} horas. Depois de ${t} ${t === 1 ? 'hora' : 'horas'} funcionando juntas, ${remove ? `${k} ${k === 1 ? 'bomba é desligada' : 'bombas são desligadas'}` : `${k} ${k === 1 ? 'bomba igual é ligada' : 'bombas iguais são ligadas'} também`}.`)],
      ask: askTotal ? 'Quanto tempo leva o esvaziamento, no total, desde o início?' : 'Depois da mudança, quanto tempo falta para o reservatório esvaziar?',
      unit: 'h',
      answer: askTotal ? total : after,
      wrong: [
        { value: round((N * T) / M, 2), feedback: `Isso refaz o serviço inteiro com ${M} bombas, mas as primeiras ${t} h com ${N} bombas já fizeram parte dele.` },
        ...(askTotal
          ? [{ value: after, feedback: `${num(after, 2)} h é só o tempo DEPOIS da mudança. Some as ${t} h iniciais.` }]
          : [{ value: total, feedback: `${num(total, 2)} h é o tempo total, desde o início. A pergunta é só o que falta.` }]),
        { value: askTotal ? T : T - t, feedback: `Esse seria o tempo sem a mudança. Com ${M} bombas, o ritmo ${remove ? 'cai' : 'aumenta'}.` },
      ],
      hints: [`Trabalho total: ${N} × ${T} = ${N * T} bombas-hora; já foram feitos ${N} × ${t}.`, `O restante, ${N * (T - t)} bombas-hora, dividido por ${M} bombas.`],
      solution: [`$Restante: ${N} × (${T} − ${t}) = ${N * (T - t)} bombas-hora`, `$Com ${M} bombas: ${N * (T - t)} ÷ ${M} = ${num(after, 2)} h${askTotal ? `; total: ${t} + ${num(after, 2)} = ${num(total, 2)} h` : ''}`],
    });
  }
}

/** Descobrir a equipe original: n · d₁ = (n ∓ k) · d₂. */
function originalCrewGen(r: Rand) {
  for (;;) {
    const n = r.int(6, 30);
    const k = r.int(2, Math.floor(n / 2));
    const fewer = r.next() < 0.6;
    const d1 = r.int(6, 30);
    const work = n * d1;
    const m = fewer ? n - k : n + k;
    const d2 = work / m;
    if (!Number.isInteger(d2)) continue;
    if (fewer && n === 20 && k === 4 && d1 === 20) continue; // questão do banco
    return draftNumeric({
      prompt: [p(`Uma equipe faria uma vistoria completa em ${d1} dias. Antes de começar, ${fewer ? `${k} integrantes foram deslocados para outra tarefa, e os demais` : `a equipe recebeu ${k} reforços, e todos juntos`} concluíram a mesma vistoria em ${d2} dias. Todos têm a mesma produtividade.`)],
      ask: 'Quantos integrantes tinha a equipe original?',
      unit: 'integrantes',
      answer: n,
      wrong: [
        { value: m, feedback: `${m} é o número de integrantes que ${fewer ? 'FICARAM' : 'trabalharam depois do reforço'}. A pergunta é a equipe original.` },
        { value: work, feedback: `${work} é o trabalho total (integrantes × dias), não o número de integrantes.` },
        { value: fewer ? n + k : n - k, feedback: `Confira: a equipe original n satisfaz n × ${d1} = (n ${fewer ? '−' : '+'} ${k}) × ${d2}.` },
      ],
      hints: [`O trabalho (integrantes × dias) é o mesmo: n × ${d1} = (n ${fewer ? '−' : '+'} ${k}) × ${d2}.`, 'Distribua e isole n.'],
      solution: [`$n × ${d1} = (n ${fewer ? '−' : '+'} ${k}) × ${d2}`, `$${d1}n = ${d2}n ${fewer ? '−' : '+'} ${k * d2} → n = ${n}`],
    });
  }
}

// ———————————————————————————————————————————————— aula

export const REGRA_DE_TRES_INVERSA = lesson({
  id: 'regra-de-tres-inversa',
  topic: 'razao-proporcao',
  subtopics: ['regra-de-tres-inversa'],
  title: 'Regra de três inversa',
  summary:
    'Quando uma grandeza sobe e a outra desce na mesma proporção: produto constante, velocidade e tempo, verba e preço, peças e área, engrenagens, equipes que mudam no meio do caminho.',
  requires: ['regra-de-tres'],
  stages: [
    stage('inversas', 'descoberta', 'Grandezas inversamente proporcionais', 'Reconhecer grandezas inversamente proporcionais pelo produto constante e prever o efeito de dobrar, triplicar ou reduzir uma delas.', () => ({
      learn: [
        text('Duas grandezas são **inversamente proporcionais** quando o **produto** entre elas é constante: se uma dobra, a outra cai pela metade; se uma triplica, a outra fica dividida por 3. Um muro que exige 48 "pedreiros-dia" fica pronto em 6 dias com 8 pedreiros, em 4 dias com 12 e em 12 dias com 4.'),
        lab({
          title: 'Mutirão',
          intro: 'Uma obra exige 48 pedreiros-dia de trabalho. Escolha quantos pedreiros trabalham nela.',
          params: [{ key: 'n', label: 'Pedreiros', min: 1, max: 12, step: 1, value: 4, format: (v) => `${v}` }],
          readouts: ({ n }) => [
            { label: 'Dias de obra', value: `48 ÷ ${n} = ${num(48 / n, 2)} dias`, big: true, tone: 'brass' },
            { label: 'Pedreiros × dias', value: `${n} × ${num(48 / n, 2)} = 48 (constante)` },
          ],
          viz: ({ n }) => ({
            kind: 'chart',
            xLabel: 'pedreiros',
            yLabel: 'dias',
            xMin: 1,
            xMax: 12,
            yMin: 0,
            yMax: 48,
            series: [{ label: 'dias = 48 ÷ pedreiros', tone: 'brass', points: sample(1, 12, 44, (x) => 48 / x) }],
            markers: [{ x: n, y: 48 / n, label: `${n} pedreiros: ${num(48 / n, 2)} dias`, tone: 'sky' }],
            summary: `Com ${n} pedreiros, a obra leva ${num(48 / n, 2)} dias`,
          }),
          goal: {
            task: 'Descubra com quantos pedreiros a obra fica pronta em exatamente 6 dias.',
            done: ({ n }) => n === 8,
            success: 'Isso: 8 × 6 = 48. Repare que, de 4 para 8 pedreiros (o dobro), os dias caíram de 12 para 6 (a metade).',
          },
          insight: 'O gráfico de grandezas inversamente proporcionais é uma curva (hipérbole), e não uma reta: os primeiros pedreiros a mais fazem muito mais diferença que os últimos.',
        }),
        key('Produto constante', 'Inversamente proporcionais: x₁ · y₁ = x₂ · y₂. (Nas diretamente proporcionais, é a razão que fica constante: x₁ / y₁ = x₂ / y₂.)'),
        warn('"Uma sobe e a outra desce" não basta', 'Uma grandeza pode diminuir quando a outra aumenta sem ser inversamente proporcional. Conforme um carro envelhece, o preço de revenda cai — mas dobrar a idade não divide o preço pela metade. Confira se o produto se mantém.'),
        example('Parcelas sem juros', 'Uma TV custa 8 parcelas de R$ 225,00, sem juros. Em quantos reais fica cada parcela se o pagamento for em 10 parcelas iguais, também sem juros?', [
          askStep('Primeiro, o que não muda.', 'Qual grandeza fica constante?', [
            ok('O valor total: 8 × 225 = R$ 1.800,00'),
            no('O valor de cada parcela', 'Se a parcela ficasse igual, o total mudaria. Sem juros, o TOTAL é que não muda.'),
          ], '8 × 225 = 1.800'),
          step('Agora o total dividido por 10:', '1.800 ÷ 10 = R$ 180,00'),
        ], 'Cada parcela fica em R$ 180,00 (mais parcelas, parcela menor).'),
        check(classify({
          ask: 'As grandezas são diretamente proporcionais, inversamente proporcionais ou nenhuma das duas?',
          bins: ['Diretamente', 'Inversamente', 'Nenhuma'],
          items: [
            { text: 'Velocidade e tempo para fazer o mesmo percurso', bin: 1 },
            { text: 'Número de torneiras iguais e tempo para encher um tanque', bin: 1 },
            { text: 'Litros de gasolina e distância percorrida (consumo fixo)', bin: 0 },
            { text: 'Idade de um carro e seu preço de revenda', bin: 2, why: 'O preço cai, mas não na proporção inversa da idade.' },
            { text: 'Comprimento de cada pedaço e número de pedaços de uma mesma fita', bin: 1 },
            { text: 'Lado de um quadrado e sua área', bin: 2, why: 'A área cresce com o quadrado do lado: não é proporcional.' },
          ],
          solution: ['Inversas: o produto é constante (velocidade × tempo = distância; pedaços × comprimento = fita).'],
        })),
        check(numeric({
          prompt: [p('A 90 km/h, uma viagem leva 2 horas.')],
          ask: 'Quantas horas ela leva a 72 km/h?',
          unit: 'h',
          answer: 2.5,
          wrong: [
            { value: 1.6, feedback: 'Isso trata como direta (2 × 72 ÷ 90): com MENOS velocidade, a viagem leva MAIS tempo.' },
            { value: 2.3, feedback: '2 h 30 min = 2,5 h, e não 2,3 h: 30 minutos são meia hora.' },
          ],
          solution: ['$Distância: 90 × 2 = 180 km', '$180 ÷ 72 = 2,5 h (2 h 30 min)'],
        })),
      ],
      practice: [
        gen(inverseGen),
        numeric({
          prompt: [p('Uma fita pode ser cortada em 30 pedaços de 24 cm, sem sobra.')],
          ask: 'Quantos pedaços de 40 cm ela renderia, sem sobra?',
          unit: 'pedaços',
          answer: 18,
          wrong: [
            { value: 50, feedback: 'Isso trata como direta (30 × 40 ÷ 24): pedaços MAIORES rendem MENOS pedaços.' },
            { value: 14, feedback: 'Subtrair a diferença de comprimento (40 − 24 = 16) dos pedaços não mantém a fita: 30 × 24 = 720 cm.' },
            { value: 720, feedback: '720 cm é o comprimento da fita. Divida por 40 cm.' },
          ],
          hints: ['Comprimento da fita: 30 × 24.', 'Divida pelo novo comprimento de pedaço.'],
          solution: ['$30 × 24 = 720 cm', '$720 ÷ 40 = 18 pedaços'],
        }),
        choice({
          ask: 'Se o número de máquinas iguais triplica, o tempo para fazer o mesmo serviço…',
          options: [
            ok('fica dividido por 3'),
            no('triplica', 'Isso seria proporção direta. Com mais máquinas, o serviço termina MAIS rápido.'),
            no('diminui 3 horas', 'Inversamente proporcional não é subtrair: o tempo é DIVIDIDO por 3.'),
            no('fica igual', 'Com mais máquinas trabalhando, o serviço é repartido entre elas: o tempo cai.'),
          ],
          hints: ['Máquinas × tempo = serviço (constante).', 'Se as máquinas são multiplicadas por 3, o tempo…'],
          solution: ['Máquinas × tempo é constante: 3 vezes mais máquinas, um terço do tempo.'],
        }),
      ],
      challenge: [
        gen(inverseGen),
        numeric({
          prompt: [p('Cinco bombas iguais esvaziam um reservatório em 12 horas.')],
          ask: 'Em quantas horas oito bombas iguais esvaziariam o mesmo reservatório?',
          unit: 'h',
          answer: 7.5,
          wrong: [
            { value: 19.2, feedback: 'Isso trata como direta (12 × 8 ÷ 5): mais bombas esvaziam o reservatório em MENOS tempo.' },
            { value: 9, feedback: 'Subtrair 3 horas (pelas 3 bombas a mais) não mantém o produto: 5 × 12 = 60 bombas-hora.' },
            { value: 7.3, feedback: '7 h 30 min = 7,5 h: meia hora é 0,5 h, e não 0,3 h.' },
          ],
          solution: ['$5 × 12 = 60 bombas-hora', '$60 ÷ 8 = 7,5 h'],
        }),
        numeric({
          prompt: [p('Com a verba do mês, uma família compra 18 pacotes de café a R$ 20,00 cada. O preço do pacote subiu para R$ 24,00.')],
          ask: 'Quantos pacotes a família poderá comprar com a mesma verba?',
          unit: 'pacotes',
          answer: 15,
          wrong: [
            { value: 21.6, feedback: 'Isso trata como direta (18 × 24 ÷ 20): com o preço MAIOR, a mesma verba compra MENOS pacotes.' },
            { value: 14, feedback: 'Subtrair os R$ 4,00 de aumento dos pacotes não faz sentido: a verba é 18 × 20 = R$ 360,00.' },
          ],
          solution: ['$Verba: 18 × 20 = R$ 360,00', '$360 ÷ 24 = 15 pacotes'],
        }),
      ],
      recap: [
        'Inversamente proporcionais: o PRODUTO é constante (x₁ · y₁ = x₂ · y₂).',
        'Dobrou uma, a outra cai pela metade; triplicou, a outra fica dividida por 3.',
        'Descubra o que fica fixo: a obra, o percurso, o total pago, a fita inteira.',
        '"Uma sobe e a outra desce" não basta: confira o produto.',
      ],
    })),

    stage('montar', 'fundamentos', 'Montar e resolver a regra de três inversa', 'Montar a regra de três inversa (invertendo uma das razões ou usando o produto constante), trabalhar com horas e minutos e calcular quanto tempo se ganha ou se perde.', () => ({
      learn: [
        text('Na regra de três **inversa**, as setas da tabela apontam em sentidos opostos: para montar a proporção, inverta uma das colunas — ou use direto o produto constante. Uma impressora a 30 páginas por minuto imprime uma tiragem em 72 minutos; a 40 páginas por minuto: 30 × 72 = 40 × t → t = 54 min.'),
        data(table(['Páginas por minuto', 'Tempo (min)'], [['30', '72'], ['40', 't']], 'Velocidade maior, tempo menor: inversamente proporcionais')),
        lab({
          title: 'Velocidade e tempo',
          intro: 'Uma viagem de 240 km. Mude a velocidade média e veja o tempo de viagem.',
          params: [{ key: 'v', label: 'Velocidade média', min: 40, max: 120, step: 5, value: 60, format: (v) => `${v} km/h` }],
          readouts: ({ v }) => [
            { label: 'Tempo', value: `240 ÷ ${v} = ${num(240 / v, 2)} h`, big: true, tone: 'brass' },
            { label: 'Em horas e minutos', value: hm(240 / v) },
            { label: 'Velocidade × tempo', value: '240 km (constante)' },
          ],
          viz: ({ v }) => ({
            kind: 'chart',
            xLabel: 'km/h',
            yLabel: 'horas',
            xMin: 40,
            xMax: 120,
            yMin: 0,
            yMax: 6,
            series: [{ label: 'tempo = 240 ÷ velocidade', tone: 'brass', points: sample(40, 120, 32, (x) => 240 / x) }],
            markers: [{ x: v, y: 240 / v, label: `${v} km/h: ${hm(240 / v)}`, tone: 'sky' }],
            summary: `A ${v} km/h, os 240 km levam ${hm(240 / v)}`,
          }),
          goal: {
            task: 'Encontre a velocidade que faz a viagem em exatamente 3 h 12 min.',
            done: ({ v }) => v === 75,
            success: 'Isso: 3 h 12 min = 3,2 h, e 240 ÷ 3,2 = 75 km/h.',
          },
          insight: 'Passar de 40 para 60 km/h economiza 2 horas; de 100 para 120 km/h, só 24 minutos.',
        }),
        example('Quanto tempo a mais?', 'Um trem faz 360 km a 120 km/h. Se a velocidade cair para 90 km/h, quantos minutos a mais leva a viagem?', [
          step('A 120 km/h:', '360 ÷ 120 = 3 h'),
          askStep('A 90 km/h, a distância é a mesma.', 'Qual é o novo tempo?', [
            ok('120 × 3 = 90 × t → t = 4 h'),
            no('3 × 90 ÷ 120 = 2,25 h', 'Essa conta é de proporção direta: com MENOS velocidade, o trem leva MAIS tempo.'),
          ]),
          step('Diferença:', '4 − 3 = 1 h = 60 min'),
        ], 'A viagem leva 60 minutos a mais.'),
        warn('Horas e minutos na inversa', 'Converta tudo para minutos (ou horas decimais) antes da conta: 2 h 24 min = 144 min. No fim, volte: 180 min = 3 h.'),
        check(numeric({
          prompt: [p('Uma bomba de 400 litros por minuto enche uma piscina em 2 h 15 min.')],
          ask: 'Em quantos minutos uma bomba de 600 litros por minuto enche a mesma piscina?',
          unit: 'min',
          answer: 90,
          wrong: [
            { value: 202.5, feedback: 'Isso trata como direta (135 × 600 ÷ 400): a bomba mais potente enche em MENOS tempo.' },
            { value: 135, feedback: '135 min é o tempo da bomba de 400 L/min. Com 600 L/min, o tempo cai.' },
            { value: 1.5, feedback: '1,5 é o tempo em HORAS. A pergunta pede minutos.' },
          ],
          solution: ['$2 h 15 min = 135 min', '$400 × 135 = 600 × t → t = 90 min'],
        })),
      ],
      practice: [
        gen(speedTimeGen),
        gen(inverseGen),
        numeric({
          prompt: [p('Para dar a volta numa pista, Rui dá 1.200 passos de 80 cm.')],
          ask: 'Quantos passos de 60 cm ele daria na mesma volta?',
          unit: 'passos',
          answer: 1600,
          wrong: [
            { value: 900, feedback: 'Isso trata como direta (1.200 × 60 ÷ 80): passos MENORES exigem MAIS passos.' },
            { value: 960, feedback: '960 m é o comprimento da pista (1.200 × 0,8 m), não o número de passos.' },
            { value: 1220, feedback: 'Somar a diferença de comprimento (80 − 60 = 20) aos passos não mantém a pista fixa.' },
          ],
          hints: ['Comprimento da pista: 1.200 × 80 cm.', 'Divida pelo novo comprimento de passo.'],
          solution: ['$1.200 × 80 = 96.000 cm', '$96.000 ÷ 60 = 1.600 passos'],
        }),
      ],
      challenge: [
        gen(speedTimeGen),
        gen(inverseGen),
        numeric({
          prompt: [p('Um carregador de 20 W carrega um tablet em 2 h 30 min. Considere o tempo de carga inversamente proporcional à potência do carregador.')],
          ask: 'Em quantos minutos um carregador de 30 W carregaria o mesmo tablet?',
          unit: 'min',
          answer: 100,
          wrong: [
            { value: 225, feedback: 'Isso trata como direta (150 × 30 ÷ 20): o carregador mais potente carrega em MENOS tempo.' },
            { value: 1.67, feedback: '1,67 é o tempo em HORAS (1 h 40 min). A pergunta pede minutos.' },
            { value: 92, feedback: '2 h 30 min são 150 min, e não "2,30 h". Com 150 min: 150 × 20 ÷ 30 = 100 min.' },
          ],
          solution: ['$2 h 30 min = 150 min', '$20 × 150 = 30 × t → t = 100 min (1 h 40 min)'],
        }),
      ],
      recap: [
        'Inversa: setas em sentidos opostos — inverta uma das razões ou use x₁ · y₁ = x₂ · y₂.',
        'Converta horas e minutos antes da conta.',
        '"Quanto a mais ou a menos" é a diferença entre os dois tempos.',
      ],
    })),

    stage('percentual', 'interpretacao', 'Porcentagens, áreas e engrenagens', 'Traduzir mudanças percentuais em fatores (−25% → × 0,75), usar a proporção inversa com áreas (peças maiores, menos peças) e com engrenagens (mais dentes, menos voltas).', () => ({
      learn: [
        text('Se o preço de um produto cai 20%, ele passa a valer 0,8 do anterior — e, com a mesma verba, a quantidade comprada fica **dividida por 0,8**, isto é, multiplicada por 1,25: aumenta 25%, e não 20%.'),
        lab({
          title: 'Desconto e quantidade',
          intro: 'Uma verba de R$ 600,00 compra itens de R$ 30,00. Aplique um desconto no preço.',
          params: [{ key: 'd', label: 'Desconto no preço', min: 0, max: 60, step: 5, value: 0, format: (v) => `${v}%` }],
          readouts: ({ d }) => {
            const price = 30 * (1 - d / 100);
            const items = 600 / price;
            return [
              { label: 'Novo preço', value: brl(price) },
              { label: 'Itens com a verba', value: `${num(items, 2)} (${Math.floor(items + 1e-9)} inteiros)`, big: true, tone: 'brass' },
              { label: 'Aumento na quantidade', value: `${num((items / 20 - 1) * 100, 1)}%` },
            ];
          },
          viz: ({ d }) => ({
            kind: 'bars',
            bars: [
              { label: 'Antes', value: 20, text: '20 itens', tone: 'parchment' },
              { label: 'Com desconto', value: 600 / (30 * (1 - d / 100)), text: `${num(600 / (30 * (1 - d / 100)), 2)} itens`, tone: 'brass' },
            ],
            max: 50,
            summary: `Com ${d}% de desconto, a verba compra ${num(600 / (30 * (1 - d / 100)), 2)} itens`,
          }),
          goal: {
            task: 'Ache o desconto que faz a verba render exatamente o dobro de itens.',
            done: ({ d }) => d === 50,
            success: 'Isso: com 50% de desconto o preço cai à metade, e a quantidade dobra. Já 20% de desconto aumentam a quantidade em 25%.',
          },
          insight: 'Desconto e aumento da quantidade não têm o mesmo percentual: a quantidade é multiplicada por 1 ÷ (1 − desconto).',
        }),
        key('Peças e área', 'A quantidade de peças para cobrir um piso é inversamente proporcional à ÁREA de cada peça. Trocar peças de 20 cm por peças de 40 cm de lado (área 4 vezes maior) divide a quantidade por 4 — e não por 2.'),
        example('Engrenagens', 'Duas engrenagens estão acopladas: a maior tem 60 dentes e a menor, 15. Se a maior dá 40 voltas por minuto, quantas voltas por minuto dá a menor?', [
          askStep('No ponto de contato passa o mesmo número de dentes nas duas.', 'Qual produto é constante?', [
            ok('dentes × voltas'),
            no('dentes ÷ voltas', 'Se fosse a razão, a engrenagem com menos dentes daria menos voltas — mas ela gira MAIS depressa.'),
          ]),
          step('Produto constante:', '60 × 40 = 15 × v → v = 160 voltas por minuto'),
        ], 'A menor dá 160 voltas por minuto: com 1/4 dos dentes, gira 4 vezes mais.'),
        warn('Porcentagem não se inverte trocando o sinal', '−25% no preço não dá +25% na quantidade: dá × 1/0,75 = × 4/3, ou seja, cerca de +33,3%.'),
        check(numeric({
          prompt: [p('Um caminhão faria uma mudança em 10 viagens. Outro caminhão, que carrega 25% a mais por viagem, fará viagens com carga completa.')],
          ask: 'Quantas viagens o segundo caminhão fará?',
          unit: 'viagens',
          answer: 8,
          wrong: [
            { value: 7.5, feedback: '25% a mais de carga não dá 25% a menos de viagens: as viagens ficam DIVIDIDAS por 1,25.' },
            { value: 12.5, feedback: 'Isso muda as viagens no mesmo sentido da carga. Carregando mais, o caminhão faz MENOS viagens.' },
          ],
          solution: ['$Viagens × carga é constante: 10 ÷ 1,25 = 8 viagens'],
        })),
      ],
      practice: [gen(percentInverseGen), gen(tilesGen), gen(gearGen)],
      challenge: [
        gen(percentInverseGen),
        gen(tilesGen),
        gen(gearGen),
        numeric({
          prompt: [p('Um piso seria coberto com 250 lajotas quadradas de 40 cm de lado. A cliente escolheu lajotas de 50 cm de lado, e o pedreiro compra sempre 8% a mais do que o calculado, para cobrir quebras e recortes.')],
          ask: 'Quantas lajotas de 50 cm devem ser compradas?',
          unit: 'lajotas',
          answer: 173,
          wrong: [
            { value: 160, feedback: '160 é a quantidade exata, sem a margem de 8%. Com ela: 160 × 1,08 = 172,8 → 173.' },
            { value: 216, feedback: 'Isso usa a razão dos lados (250 × 40 ÷ 50 = 200) e depois a margem. A quantidade depende da ÁREA das lajotas.' },
            { value: 172.8, feedback: 'Lajotas são compradas inteiras: 172,8 vira 173 (para cima, para não faltar).' },
          ],
          solution: ['$Área: 250 × 1.600 = 400.000 cm²; 400.000 ÷ 2.500 = 160 lajotas', '$Com 8% a mais: 160 × 1,08 = 172,8 → 173 lajotas'],
        }),
      ],
      recap: [
        'Preço −p%: novo preço = (1 − p/100) × antigo; quantidade = verba ÷ novo preço.',
        'Com verba fixa, −20% no preço dá +25% na quantidade.',
        'Peças para um piso: inversamente proporcionais à ÁREA (lado²).',
        'Engrenagens: dentes × voltas é constante.',
      ],
    })),

    stage('meio-do-caminho', 'aplicacoes', 'Mudanças no meio do caminho', 'Resolver problemas em que o número de trabalhadores, animais ou máquinas muda durante o processo, trabalhando só com a parte que falta.', () => ({
      learn: [
        text('Quando algo muda no meio (chegam mais animais, bombas são desligadas, a equipe diminui), trabalhe com **o que falta**. Ração para 12 cães por 20 dias são 240 porções; depois de 5 dias, restam 12 × 15 = 180 porções. Se chegam 6 cães, os 18 cães têm 180 ÷ 18 = 10 dias.'),
        lab({
          title: 'O estoque de ração',
          intro: 'Um abrigo tem ração para 12 cães durante 20 dias. Escolha quando chegam novos cães e quantos são.',
          params: [
            { key: 'd', label: 'Dias até a chegada', min: 0, max: 19, step: 1, value: 5, format: (v) => `${v} dias` },
            { key: 'n', label: 'Novos cães', min: 0, max: 12, step: 1, value: 6, format: (v) => `${v}` },
          ],
          readouts: ({ d, n }) => {
            const left = 12 * (20 - d);
            return [
              { label: 'Porções restantes', value: `12 × ${20 - d} = ${left}` },
              { label: 'Cães depois da chegada', value: `${12 + n}` },
              { label: 'A ração restante dura', value: `${num(left / (12 + n), 2)} dias`, big: true, tone: 'brass' },
            ];
          },
          viz: ({ d }) => ({
            kind: 'parts',
            segments: [
              { label: 'consumida', value: Math.max(12 * d, 0.001), tone: 'ember' },
              { label: 'restante', value: 12 * (20 - d), tone: 'verdigris' },
            ],
            summary: `${12 * d} porções consumidas e ${12 * (20 - d)} restantes`,
          }),
          goal: {
            task: 'Com 4 cães novos, escolha o dia da chegada para que a ração restante dure exatamente 9 dias.',
            done: ({ d, n }) => n === 4 && d === 8,
            success: 'Isso: depois de 8 dias restam 12 × 12 = 144 porções, e 144 ÷ 16 cães = 9 dias.',
          },
          insight: 'O que já foi consumido não volta: a proporção inversa vale só para o estoque restante.',
        }),
        example('Bombas que quebram', 'Oito bombas iguais esvaziariam um tanque em 9 horas. Depois de 3 horas, duas bombas quebram. Quanto tempo leva o esvaziamento, no total?', [
          step('Trabalho total:', '8 × 9 = 72 bombas-hora'),
          step('Em 3 h, as 8 bombas fizeram 24 bombas-hora; faltam 48.'),
          askStep('Agora são 6 bombas.', 'Quanto tempo levam os 48 bombas-hora restantes?', [
            ok('48 ÷ 6 = 8 h'),
            no('9 × 8 ÷ 6 = 12 h', 'Isso refaz o serviço inteiro com 6 bombas, mas um terço dele já foi feito nas primeiras 3 horas.'),
          ]),
          step('Total:', '3 + 8 = 11 h'),
        ], 'O esvaziamento leva 11 horas no total.'),
        key('Unidade de trabalho', 'Trabalhador-dia, bomba-hora, porção-dia: multiplicar quem trabalha (ou consome) pelo tempo dá a "quantidade de trabalho". Ela não muda quando a equipe muda — só é dividida de outro jeito.'),
        tip('Descobrir a equipe original', 'Se, com 3 pessoas a menos, uma obra passa de 12 para 16 dias: n × 12 = (n − 3) × 16 → 12n = 16n − 48 → n = 12.'),
        check(numeric({
          prompt: [p('Uma obra seria feita por 10 pedreiros em 18 dias. Depois de 6 dias de trabalho, 2 pedreiros saem da obra.')],
          ask: 'A partir daí, em quantos dias a obra termina?',
          unit: 'dias',
          answer: 15,
          wrong: [
            { value: 22.5, feedback: 'Isso refaz a obra inteira com 8 pedreiros (18 × 10 ÷ 8), mas 6 dias de trabalho já foram feitos.' },
            { value: 21, feedback: '21 dias é o tempo TOTAL (6 + 15). A pergunta começa depois da saída.' },
            { value: 9.6, feedback: 'Isso trata como direta (12 × 8 ÷ 10): com menos pedreiros, a obra leva MAIS tempo.' },
          ],
          solution: ['$Total: 10 × 18 = 180 pedreiros-dia; feitos: 10 × 6 = 60', '$Restam 120: 120 ÷ 8 = 15 dias'],
        })),
      ],
      practice: [gen(stockGen), gen(crewChangeGen), gen(originalCrewGen)],
      challenge: [
        gen(stockGen),
        gen(crewChangeGen),
        gen(originalCrewGen),
        numeric({
          prompt: [p('Um acampamento tem comida para 30 pessoas durante 12 dias. Depois de 2 dias, os organizadores querem receber visitantes e garantir comida para todos por mais 8 dias completos, sem nova compra.')],
          ask: 'Qual é o maior número de visitantes que podem ser recebidos?',
          unit: 'visitantes',
          answer: 7,
          wrong: [
            { value: 8, feedback: 'Com 8 visitantes seriam 38 pessoas, que consomem 304 porções em 8 dias; só restam 300. Arredonde para baixo.' },
            { value: 7.5, feedback: 'Não existe meia pessoa: 300 ÷ 8 = 37,5 → no máximo 37 pessoas, 7 visitantes.' },
            { value: 15, feedback: 'Isso ignora os 2 dias já consumidos (30 × 12 ÷ 8 − 30). Restam só 30 × 10 = 300 porções.' },
          ],
          solution: ['$Restam 30 × 10 = 300 porções', '$300 ÷ 8 = 37,5 → 37 pessoas → 7 visitantes'],
        }),
      ],
      recap: [
        'Trabalho (ou estoque) = quantidade × tempo: ele não muda quando a equipe muda.',
        'Desconte o que já foi feito ou consumido; aplique a inversa só ao restante.',
        'Tempo total = antes da mudança + depois dela.',
        'Equipe original: n × d₁ = (n − k) × d₂.',
        '"Maior número" com resultado quebrado: arredonde para baixo.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: inversas nos problemas difíceis', 'Resolver problemas inéditos com grandezas inversamente proporcionais: frotas e intervalos, ida e volta com velocidades diferentes e equipes que mudam.', () => ({
      learn: [
        strategy('O que é constante?', 'Encontre o produto que não muda: obra (pessoas × dias), percurso (velocidade × tempo), volta de uma linha (ônibus × intervalo), estoque (consumidores × dias). Depois monte a equação com ele.'),
        lab({
          title: 'Ônibus na linha',
          intro: 'Uma linha circular tem 12 ônibus igualmente espaçados, passando a cada 8 minutos. Uma volta completa leva sempre 96 minutos. Mude a frota.',
          params: [{ key: 'n', label: 'Ônibus na linha', min: 2, max: 16, step: 1, value: 12, format: (v) => `${v}` }],
          readouts: ({ n }) => [
            { label: 'Intervalo em cada ponto', value: `96 ÷ ${n} = ${num(96 / n, 1)} min`, big: true, tone: 'brass' },
            { label: 'Ônibus × intervalo', value: '96 min, uma volta (constante)' },
            { label: 'Dentro do limite de 15 min?', value: 96 / n <= 15 ? 'sim' : 'não', tone: 96 / n <= 15 ? 'verdigris' : 'ember' },
          ],
          viz: ({ n }) => ({
            kind: 'chart',
            xLabel: 'ônibus',
            yLabel: 'intervalo (min)',
            xMin: 2,
            xMax: 16,
            yMin: 0,
            yMax: 48,
            series: [{ label: 'intervalo = 96 ÷ ônibus', tone: 'brass', points: sample(2, 16, 42, (x) => 96 / x) }],
            markers: [{ x: n, y: 96 / n, label: `${n} ônibus: ${num(96 / n, 1)} min`, tone: 'sky' }],
            summary: `Com ${n} ônibus, passa um a cada ${num(96 / n, 1)} minutos`,
          }),
          goal: {
            task: 'Encontre o MENOR número de ônibus que mantém o intervalo em no máximo 15 minutos.',
            done: ({ n }) => n === 7,
            success: 'Isso: 96 ÷ 15 = 6,4, e 6 ônibus dariam 16 min. São precisos 7 ônibus (13,7 min) — arredondar para cima.',
          },
          insight: 'Retirar ônibus aumenta o intervalo na proporção inversa: o limite do intervalo vira um número mínimo de ônibus.',
        }),
        example('Ida e volta', 'Um ciclista vai a 20 km/h e volta pelo mesmo caminho a 30 km/h, gastando 2 h 30 min no total. Qual é a distância de ida?', [
          step('Tempos: ida d/20 e volta d/30.'),
          askStep('O tempo total é 2,5 h.', 'Que equação resolve o problema?', [
            ok('d/20 + d/30 = 2,5'),
            no('2d ÷ 25 = 2,5 (velocidade média de 25 km/h)', 'A velocidade média de ida e volta NÃO é a média das velocidades: o ciclista passa mais tempo no trecho mais lento.'),
          ]),
          step('MMC de 20 e 30 = 60:', '3d/60 + 2d/60 = 2,5 → 5d = 150 → d = 30 km'),
        ], 'A distância é de 30 km (1,5 h na ida e 1 h na volta).'),
        reveal('Por que a velocidade média de ida e volta não é a média das velocidades?', 'Porque se gasta mais TEMPO no trecho mais lento. Indo a 20 km/h e voltando a 30 km/h num trajeto de 30 km, são 1,5 h + 1 h = 2,5 h para 60 km: média de 24 km/h, e não 25 km/h.'),
        check(numeric({
          prompt: [p('Uma bicicleta tem coroa de 44 dentes e catraca de 11 dentes. O ciclista dá 60 pedaladas por minuto, e a roda avança 2,1 m a cada volta.')],
          ask: 'Quantos metros a bicicleta percorre por minuto?',
          unit: 'm',
          answer: 504,
          wrong: [
            { value: 126, feedback: '126 m ignora a transmissão (60 × 2,1). A catraca, com 1/4 dos dentes, gira 4 vezes a cada pedalada.' },
            { value: 31.5, feedback: 'A transmissão ficou invertida (60 × 11 ÷ 44): a engrenagem com MENOS dentes gira MAIS.' },
            { value: 30.24, feedback: '30,24 é a velocidade em km/h. A pergunta pede metros por minuto.' },
          ],
          solution: ['$Voltas da roda: 60 × 44 ÷ 11 = 240 por minuto', '$240 × 2,1 = 504 m por minuto'],
        })),
      ],
      practice: [
        numeric({
          prompt: [p('Uma linha circular opera com 12 ônibus igualmente espaçados, um a cada 7 minutos em cada ponto. O tempo de uma volta não muda. O intervalo máximo permitido é de 15 minutos, e os ônibus que ficarem continuarão igualmente espaçados.')],
          ask: 'Quantos ônibus podem ser retirados, no máximo?',
          unit: 'ônibus',
          answer: 6,
          wrong: [
            { value: 7, feedback: 'Retirando 7, ficam 5 ônibus, e o intervalo vai a 84 ÷ 5 = 16,8 min, acima de 15.' },
            { value: 8, feedback: 'A diferença de intervalos (15 − 7 = 8 min) não é um número de ônibus. Uma volta leva 12 × 7 = 84 min.' },
            { value: 5.6, feedback: '5,6 = 84 ÷ 15 é o número mínimo de ônibus, ainda sem arredondar: precisam ficar 6, e saem 6.' },
          ],
          hints: ['Uma volta: 12 × 7 = 84 min.', 'Com n ônibus, o intervalo é 84 ÷ n ≤ 15.'],
          solution: ['$Volta: 12 × 7 = 84 min', '$84 ÷ n ≤ 15 → n ≥ 5,6 → ficam 6 ônibus', '$Retirados: 12 − 6 = 6'],
        }),
        numeric({
          prompt: [p('Um barco desce um rio a 30 km/h e sobe pelo mesmo trajeto a 18 km/h, gastando 4 h no total, sem paradas.')],
          ask: 'Qual é a extensão do trajeto (só a ida)?',
          unit: 'km',
          answer: 45,
          wrong: [
            { value: 48, feedback: 'Isso usa a média das velocidades (24 km/h) por 2 h em cada sentido. A volta, mais lenta, leva mais tempo.' },
            { value: 90, feedback: '90 km é a ida e a volta juntas. A pergunta é só a ida.' },
            { value: 96, feedback: 'Isso usa a média das velocidades nas 4 h. A equação certa é d/30 + d/18 = 4.' },
          ],
          hints: ['Tempo de ida: d/30; de volta: d/18.', 'd/30 + d/18 = 4; o MMC de 30 e 18 é 90.'],
          solution: ['$d/30 + d/18 = 4 → 3d/90 + 5d/90 = 4', '$8d = 360 → d = 45 km'],
        }),
        gen(crewChangeGen),
      ],
      challenge: [
        numeric({
          prompt: [p('Uma equipe faria um trabalho em 15 dias. Com 5 pessoas a mais, todas com a mesma produtividade, o trabalho terminaria em 10 dias.')],
          ask: 'Quantas pessoas tem a equipe?',
          unit: 'pessoas',
          answer: 10,
          wrong: [
            { value: 15, feedback: '15 seria a equipe COM os 5 reforços (10 + 5).' },
            { value: 5, feedback: '5 é o número de reforços, não a equipe original.' },
            { value: 150, feedback: '150 é o trabalho total em pessoas-dia (10 × 15).' },
          ],
          solution: ['$n × 15 = (n + 5) × 10 → 15n = 10n + 50 → n = 10'],
        }),
        numeric({
          prompt: [p('Um carro vai de A até B a 80 km/h e volta pelo mesmo caminho a 120 km/h.')],
          ask: 'Qual foi a velocidade média na viagem toda, ida e volta?',
          unit: 'km/h',
          answer: 96,
          wrong: [
            { value: 100, feedback: '100 km/h é a média das velocidades, mas o carro passa MAIS tempo a 80 km/h. Velocidade média = distância total ÷ tempo total.' },
            { value: 200, feedback: '200 é a soma das velocidades. Velocidade média = distância total ÷ tempo total.' },
          ],
          solution: ['Com d km de cada lado: tempo = d/80 + d/120 = 5d/240 = d/48.', '$Média: 2d ÷ (d/48) = 96 km/h'],
        }),
        gen(stockGen),
        gen(gearGen),
      ],
      recap: [
        'Ache o produto constante: obra, percurso, volta da linha, estoque.',
        'Frota e intervalo: ônibus × intervalo = tempo de uma volta.',
        'Ida e volta: some os TEMPOS (d/v₁ + d/v₂); a média das velocidades engana.',
        'Mudanças no meio: trabalhe com o que falta.',
      ],
    })),
  ],
});
