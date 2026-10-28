/**
 * Aula: Velocidade e tempo — velocidade média com o tempo em horas (base 60, e não 100),
 * distância e duração de viagens, km/h ↔ m/s, horários de chegada, encontros e
 * ultrapassagens, e maestria (média de ida e volta, combustível e ritmo de corrida).
 */
import {
  askStep,
  check,
  compare,
  draftChoice,
  draftNumeric,
  example,
  gen,
  key,
  lab,
  lesson,
  math,
  no,
  numeric,
  numericOptions,
  ok,
  p,
  stage,
  step,
  strategy,
  text,
  warn,
} from '../../kit/build';
import { brl, frac, hm, num, round } from '../../kit/format';
import type { Rand } from '../../types';

/** Minutos em horas: decimal quando exato em centésimos; senão, fração. */
const hours = (min: number) => (Math.abs(round(min / 60, 2) - min / 60) < 1e-9 ? `${num(min / 60)} h` : `${frac(min, 60)} h`);
/** Horário de relógio a partir dos minutos desde a meia-noite: 615 → "10h15". */
const clock = (min: number) => {
  const t = ((min % 1440) + 1440) % 1440;
  return `${Math.floor(t / 60)}h${String(t % 60).padStart(2, '0')}`;
};

// ———————————————————————————————————————————————— geradores: tempo e velocidade média

/** Velocidade média = distância ÷ tempo em horas (a prova da questão do banco fica de fora). */
function avgSpeedGen(r: Rand) {
  for (;;) {
    const t = r.pick([15, 20, 30, 40, 45, 50, 75, 90, 100, 120, 150]);
    const v = r.pick([6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36, 48, 60, 72, 80, 90]);
    const d = (v * t) / 60;
    if (!Number.isInteger(d * 2)) continue;
    if (d === 10 && t === 50) continue; // questão do banco
    if (d === 6 && t === 90) continue; // exemplo da teoria
    const T = hm(t / 60);
    const misread = Math.floor(t / 60) + (t % 60) / 100; // "1 h 15 min" lido como 1,15 h
    const who =
      v <= 15
        ? `Durante um treino, um corredor percorreu ${num(d)} km em ${T}.`
        : v <= 36
          ? `Uma ciclista pedalou ${num(d)} km numa ciclovia em ${T}.`
          : `Um ônibus percorreu ${num(d)} km entre duas cidades em ${T}.`;
    return draftNumeric({
      prompt: [p(who)],
      ask: 'Qual foi a velocidade média, em km/h?',
      unit: 'km/h',
      answer: v,
      wrong: [
        { value: round(d / t, 4), feedback: `Isso dá quilômetros por minuto. Para km/h, use o tempo em horas: ${t} min = ${hours(t)}.` },
        ...(t % 60 !== 0 ? [{ value: round(d / misread, 2), feedback: `Isso usa ${num(misread)} h para ${T}. Uma hora tem 60 minutos, e não 100: ${T} = ${hours(t)}.` }] : []),
        { value: round((d * t) / 60, 2), feedback: 'Isso multiplica a distância pelo tempo. Velocidade é distância dividida por tempo.' },
      ],
      hints: [`Passe o tempo para horas: ${t} min = ${hours(t)}.`, `Velocidade = ${num(d)} km ÷ ${hours(t)}.`],
      solution: [`$${t} min = [[${t}|60]] h`, `$v = ${num(d)} ÷ [[${t}|60]] = [[${num(d)} × 60|${t}]] = ${v} km/h`],
    });
  }
}

/** Horas decimais ↔ minutos: a parte decimal é fração de hora. */
function decimalTimeGen(r: Rand) {
  if (r.next() < 0.5) {
    const h = r.pick([1.2, 1.25, 1.5, 1.75, 2.6, 0.8, 3.25]); // 2,4 h: exercício da teoria
    const hi = Math.floor(h);
    const dec = round(h - hi, 4);
    return draftNumeric({
      prompt: [p(`Um aplicativo de mapas estima ${num(h)} h para uma viagem.`)],
      ask: 'Quantos minutos são?',
      unit: 'min',
      answer: round(h * 60, 4),
      wrong: [
        { value: round(h * 100, 4), feedback: 'Isso multiplica por 100. Uma hora tem 60 minutos: multiplique por 60.' },
        { value: hi * 60 + round(dec * 100, 4), feedback: `Isso lê ${num(h)} h como ${hi} h ${round(dec * 100, 4)} min. A parte decimal é fração de hora: ${num(dec)} × 60 = ${num(dec * 60)} min.` },
      ],
      hints: ['Uma hora tem 60 minutos.', `${hi} h = ${hi * 60} min; a parte decimal, ${num(dec)} h, vale ${num(dec)} × 60 min.`],
      solution: [`$${num(h)} × 60 = ${num(h * 60)} min`, `Ou seja, ${hm(h)}.`],
    });
  }
  const m = r.pick([75, 90, 105, 135, 150, 165, 45, 36, 84]);
  const hi = Math.floor(m / 60);
  return draftNumeric({
    prompt: [p(`Um filme tem ${m} minutos de duração.`)],
    ask: 'Quanto é essa duração em horas, na forma decimal?',
    unit: 'h',
    answer: round(m / 60, 4),
    wrong: [
      { value: m / 100, feedback: 'Isso divide por 100. Uma hora tem 60 minutos: divida por 60.' },
      { value: hi + (m % 60) / 100, feedback: `Isso escreve ${hm(m / 60)} como ${num(hi + (m % 60) / 100)} h. Os ${m % 60} min são ${m % 60}/60 de hora: ${num((m % 60) / 60, 4)} h.` },
    ],
    hints: ['Uma hora tem 60 minutos: divida os minutos por 60.', `${m} ÷ 60 = ?`],
    solution: [`$${m} ÷ 60 = ${num(m / 60, 4)} h`, `Ou seja, ${hm(m / 60)}.`],
  });
}

/** Distância = velocidade × tempo em horas. */
function distanceGen(r: Rand) {
  for (;;) {
    const v = r.pick([40, 50, 60, 72, 80, 90, 100]);
    const t = r.pick([15, 20, 30, 40, 45, 75, 90, 100, 135]);
    const d = (v * t) / 60;
    if (!Number.isInteger(d * 2)) continue;
    const T = hm(t / 60);
    const misread = Math.floor(t / 60) + (t % 60) / 100;
    return draftNumeric({
      prompt: [p(`Um carro manteve ${v} km/h durante ${T} numa rodovia.`)],
      ask: 'Quantos quilômetros ele percorreu nesse tempo?',
      unit: 'km',
      answer: d,
      wrong: [
        { value: v * t, feedback: `Isso multiplica a velocidade em km/h pelos minutos. Passe o tempo para horas: ${t} min = ${hours(t)}.` },
        ...(t % 60 !== 0 ? [{ value: round(v * misread, 2), feedback: `Isso usa ${num(misread)} h para ${T}. Em horas, ${T} = ${hours(t)}.` }] : []),
        { value: round(v / (t / 60), 2), feedback: 'Isso divide a velocidade pelo tempo. Distância = velocidade × tempo.' },
      ],
      hints: [`Tempo em horas: ${t} min = ${hours(t)}.`, `d = ${v} × ${hours(t)}.`],
      solution: [`$${t} min = [[${t}|60]] h`, `$d = ${v} × [[${t}|60]] = ${num(d)} km`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: viagens

/** Duração da viagem = distância ÷ velocidade, em minutos. */
function travelTimeGen(r: Rand) {
  for (;;) {
    const v = r.pick([48, 60, 72, 75, 80, 90, 96, 100, 120]);
    const d = r.pick([60, 90, 120, 150, 180, 200, 240, 270, 300, 360]);
    const tMin = (d / v) * 60;
    if (!Number.isInteger(tMin) || tMin < 30) continue;
    const h = d / v;
    const hi = Math.floor(h);
    const cents = round((h - hi) * 100, 6);
    return draftNumeric({
      prompt: [p(`Uma viagem de ${d} km será feita a uma velocidade média de ${v} km/h.`)],
      ask: 'Quantos minutos a viagem vai durar?',
      unit: 'min',
      answer: tMin,
      wrong: [
        { value: round(h, 4), feedback: `Esse é o tempo em horas (${d} ÷ ${v}). Em minutos: × 60.` },
        ...(cents > 0 && Number.isInteger(cents) ? [{ value: hi * 60 + cents, feedback: `Isso lê ${num(h, 4)} h como ${hi} h ${cents} min. A parte decimal é fração de hora: ${num(h - hi, 4)} × 60 = ${num((h - hi) * 60)} min.` }] : []),
        { value: round((v / d) * 60, 4), feedback: 'Isso divide a velocidade pela distância. Tempo = distância ÷ velocidade.' },
      ],
      hints: ['Tempo = distância ÷ velocidade, em horas.', 'Depois, multiplique por 60 para ter minutos.'],
      solution: [`$t = [[${d}|${v}]] h = [[${d} × 60|${v}]] min = ${tMin} min`, `Ou seja, ${hm(h)}.`],
    });
  }
}

/** km/h ↔ m/s (÷ 3,6 e × 3,6). */
function kmhMsGen(r: Rand) {
  if (r.next() < 0.5) {
    const kmh = r.pick([18, 36, 54, 108, 126, 144, 180]); // 72 e 90 km/h: laboratório e exemplo da teoria
    const ms = kmh / 3.6;
    return draftNumeric({
      prompt: [p(kmh <= 54 ? `Um ciclista desce uma ladeira a ${kmh} km/h.` : `Um trem viaja a ${kmh} km/h.`)],
      ask: 'Qual é essa velocidade em metros por segundo?',
      unit: 'm/s',
      answer: round(ms, 4),
      wrong: [
        { value: round(kmh * 3.6, 2), feedback: 'Isso multiplica por 3,6. De km/h para m/s, divida: 1 km/h = 1.000 m em 3.600 s.' },
        { value: round(kmh / 60, 4), feedback: 'Isso divide só por 60, como se a hora tivesse 60 segundos, e esquece que 1 km = 1.000 m. Divida por 3,6.' },
        { value: round((kmh * 1000) / 60, 2), feedback: 'Isso dá metros por minuto. Um minuto tem 60 segundos: divida por 60 de novo.' },
      ],
      hints: ['1 km = 1.000 m e 1 h = 3.600 s.', `${kmh} km/h = ${num(kmh * 1000)} m em 3.600 s.`],
      solution: [`$${kmh} km/h = [[${num(kmh * 1000)} m|3.600 s]] = ${num(ms)} m/s`, 'Atalho: km/h ÷ 3,6 = m/s.'],
    });
  }
  const ms = r.pick([5, 8, 10, 12, 15, 30, 35, 40]); // 20 e 25 m/s: laboratório e exemplo da teoria
  const kmh = round(ms * 3.6, 4);
  return draftNumeric({
    prompt: [p(ms <= 8 ? `Um ciclista pedala a ${ms} m/s.` : ms <= 12 ? `No auge de uma prova de 100 m, um velocista chega a ${ms} m/s.` : `Numa tempestade, o vento chegou a ${ms} m/s.`)],
    ask: 'Qual é essa velocidade em km/h?',
    unit: 'km/h',
    answer: kmh,
    wrong: [
      { value: round(ms / 3.6, 4), feedback: 'Isso divide por 3,6. De m/s para km/h, multiplique: em 1 h há 3.600 s, e 3.600 m = 3,6 km.' },
      { value: ms * 3600, feedback: `Isso converte o tempo para horas, mas deixa a distância em metros: são ${num(ms * 3600)} m por hora = ${num(kmh)} km/h.` },
    ],
    hints: ['Em 1 hora há 3.600 segundos.', `${ms} m por segundo → ${ms} × 3.600 m por hora; depois, passe para km.`],
    solution: [`$${ms} × 3.600 = ${num(ms * 3600)} m por hora = ${num(kmh)} km/h`, 'Atalho: m/s × 3,6 = km/h.'],
  });
}

/** Horário de chegada: some a duração (em h e min) ao horário de saída. */
function arrivalGen(r: Rand) {
  for (;;) {
    const start = r.int(6, 15) * 60 + r.pick([0, 10, 15, 20, 30, 40, 45]);
    const v = r.pick([60, 72, 80, 90, 100]);
    const d = r.pick([90, 120, 150, 180, 200, 240, 270]);
    const h = d / v;
    const tMin = h * 60;
    if (!Number.isInteger(tMin) || tMin % 60 === 0 || h < 1) continue;
    const hi = Math.floor(h);
    const cents = round((h - hi) * 100, 6);
    const rest = tMin - hi * 60;
    return draftChoice({
      prompt: [p(`Um ônibus sai da rodoviária às ${clock(start)} para uma viagem de ${d} km, a uma velocidade média de ${v} km/h.`)],
      ask: 'A que horas ele chega?',
      options: numericOptions({ value: start + tMin, text: clock(start + tMin) }, [
        ...(Number.isInteger(cents) ? [{ value: start + hi * 60 + cents, text: clock(start + hi * 60 + cents), feedback: `Isso lê ${num(h, 4)} h como ${hi} h ${cents} min. A parte decimal é fração de hora: ${num(h - hi, 4)} × 60 = ${num(rest)} min.` }] : []),
        { value: start + hi * 60, text: clock(start + hi * 60), feedback: `Isso soma só as horas inteiras e esquece os ${rest} minutos restantes: a viagem dura ${hm(h)}.` },
        { value: start + Math.ceil(h) * 60, text: clock(start + Math.ceil(h) * 60), feedback: `Isso arredonda a viagem para ${Math.ceil(h)} h. Ela dura ${hm(h)}.` },
      ]),
      hints: ['Tempo = distância ÷ velocidade, em horas.', 'Transforme a parte decimal das horas em minutos (× 60) antes de somar ao horário.'],
      solution: [`$t = [[${d}|${v}]] h = ${num(h, 4)} h = ${hm(h)}`, `$${clock(start)} + ${hm(h)} = ${clock(start + tMin)}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: encontros

/** Sentidos opostos: as velocidades se somam (a questão do banco, 300 km a 70 e 80 km/h, fica de fora). */
function meetGen(r: Rand) {
  for (;;) {
    const D = r.pick([120, 150, 180, 210, 240, 270, 360, 400, 450]);
    const v1 = r.pick([40, 50, 60, 70, 80, 90]);
    const v2 = r.pick([40, 50, 60, 70, 80, 90]);
    const tMin = (D / (v1 + v2)) * 60;
    if (!Number.isInteger(tMin)) continue;
    return draftNumeric({
      prompt: [p(`Duas cidades estão a ${D} km uma da outra. Às 8h, um caminhão sai de uma delas a ${v1} km/h, e uma van sai da outra a ${v2} km/h, pela mesma estrada, indo ao encontro do caminhão.`)],
      ask: 'Quantos minutos depois das 8h eles se encontram?',
      unit: 'min',
      answer: tMin,
      wrong: [
        { value: round(D / (v1 + v2), 4), feedback: 'Esse é o tempo em horas. Multiplique por 60 para ter minutos.' },
        ...(v1 !== v2 ? [{ value: round((D / Math.abs(v1 - v2)) * 60, 2), feedback: `Isso subtrai as velocidades, como se um perseguisse o outro. Indo um ao encontro do outro, a distância encurta ${v1} + ${v2} = ${v1 + v2} km a cada hora.` }] : []),
        { value: round((D / v1) * 60, 2), feedback: 'Isso considera só o caminhão andando. A van também se move: a distância encurta pela soma das velocidades.' },
      ],
      hints: [`A cada hora, a distância entre eles diminui ${v1} + ${v2} = ${v1 + v2} km.`, `Tempo = ${D} ÷ ${v1 + v2} h; depois, × 60.`],
      solution: [`$aproximação: ${v1} + ${v2} = ${v1 + v2} km/h`, `$t = [[${D}|${v1 + v2}]] h = ${tMin} min (${hm(tMin / 60)})`],
    });
  }
}

/** Mesmo sentido: o mais rápido tira a diferença das velocidades por hora. */
function catchUpGen(r: Rand) {
  for (;;) {
    const vs = r.pick([40, 50, 60, 70]);
    const vf = vs + r.pick([10, 20, 30, 40]);
    const head = r.pick([0.5, 1, 1.5, 2]);
    if (vs === 60 && vf === 90 && head === 1) continue; // exemplo da teoria
    const gap = vs * head;
    const tMin = (gap / (vf - vs)) * 60;
    if (!Number.isInteger(tMin) || tMin > 300) continue;
    return draftNumeric({
      prompt: [p(`Um ônibus saiu de uma cidade a ${vs} km/h. ${hm(head)} depois, um carro saiu do mesmo ponto, pela mesma estrada e no mesmo sentido, a ${vf} km/h.`)],
      ask: 'Quantos minutos depois de sair o carro alcança o ônibus?',
      unit: 'min',
      answer: tMin,
      wrong: [
        { value: round((gap / (vf + vs)) * 60, 2), feedback: `Isso soma as velocidades, como se fossem um ao encontro do outro. No mesmo sentido, o carro tira só ${vf} − ${vs} = ${vf - vs} km por hora.` },
        { value: round((gap / vf) * 60, 2), feedback: 'Isso considera o ônibus parado. Ele continua andando: o carro se aproxima à diferença das velocidades.' },
        { value: round(gap / (vf - vs), 4), feedback: 'Esse é o tempo em horas. Multiplique por 60 para ter minutos.' },
      ],
      hints: [`Quando o carro sai, o ônibus já está ${vs} × ${num(head)} = ${num(gap)} km à frente.`, `O carro tira ${vf} − ${vs} = ${vf - vs} km por hora dessa vantagem.`],
      solution: [`$vantagem: ${vs} × ${num(head)} = ${num(gap)} km`, `$t = [[${num(gap)}|${vf - vs}]] h = ${tMin} min (${hm(tMin / 60)})`],
    });
  }
}

/** Ponto de encontro: cada um percorre a parte proporcional à sua velocidade. */
function meetPointGen(r: Rand) {
  for (;;) {
    const D = r.pick([18, 24, 30, 36, 45, 60]);
    const v1 = r.pick([10, 12, 15, 18, 20]);
    const v2 = r.pick([10, 12, 15, 18, 20]);
    if (v1 === v2) continue;
    const d1 = (D * v1) / (v1 + v2);
    if (!Number.isInteger(d1 * 2)) continue;
    return draftNumeric({
      prompt: [p(`Dois ciclistas estão a ${D} km um do outro numa estrada e partem ao mesmo tempo, um em direção ao outro: Ana a ${v1} km/h e Beto a ${v2} km/h.`)],
      ask: 'A quantos quilômetros do ponto de partida de Ana eles se encontram?',
      unit: 'km',
      answer: d1,
      wrong: [
        { value: D / 2, feedback: `O encontro só seria no meio se as velocidades fossem iguais. Ana é ${v1 > v2 ? 'mais' : 'menos'} rápida, então percorre ${v1 > v2 ? 'mais' : 'menos'} da metade.` },
        { value: round((D * v2) / (v1 + v2), 2), feedback: 'Essa é a distância até o ponto de partida de Beto. A pergunta é a partir de Ana.' },
        { value: round(D / (v1 + v2), 4), feedback: 'Esse é o tempo até o encontro, em horas. Multiplique pela velocidade de Ana para achar a distância dela.' },
      ],
      hints: [`Tempo até o encontro: ${D} ÷ (${v1} + ${v2}) h.`, `Distância percorrida por Ana: ${v1} × tempo.`],
      solution: [`$t = [[${D}|${v1 + v2}]] h`, `$Ana: ${v1} × [[${D}|${v1 + v2}]] = ${num(d1)} km`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: maestria

/** Pares (ida, volta) com média de ida e volta inteira. */
const ROUND_TRIPS: [number, number][] = [[60, 40], [30, 20], [90, 60], [120, 80], [60, 30], [120, 60], [90, 45], [75, 50], [150, 100]];

/** Média de ida e volta: distância total ÷ tempo total (não é a média das velocidades). */
function roundTripGen(r: Rand) {
  for (;;) {
    const [a, b] = r.pick(ROUND_TRIPS);
    const [v1, v2] = r.next() < 0.5 ? [a, b] : [b, a];
    const d = r.pick([60, 90, 120, 180]);
    if (v1 === 60 && v2 === 40 && d === 120) continue; // exemplo da teoria
    const t1 = d / v1;
    const t2 = d / v2;
    if ([t1, t2].some((t) => Math.abs(round(t, 2) - t) > 1e-9)) continue;
    const avg = (2 * v1 * v2) / (v1 + v2);
    return draftNumeric({
      prompt: [p(`Um motorista foi de uma cidade a outra, distante ${d} km, com velocidade média de ${v1} km/h, e voltou pelo mesmo caminho a ${v2} km/h.`)],
      ask: 'Qual foi a velocidade média na viagem toda, ida e volta?',
      unit: 'km/h',
      answer: avg,
      wrong: [
        { value: (v1 + v2) / 2, feedback: 'Essa é a média das duas velocidades. Mas o motorista passa mais tempo no trecho mais lento: velocidade média = distância total ÷ tempo total.' },
        { value: round(d / (t1 + t2), 4), feedback: `Isso usa só a distância de ida. A viagem toda tem ${d} + ${d} = ${2 * d} km.` },
      ],
      hints: [`Tempo de ida: ${d} ÷ ${v1}; tempo de volta: ${d} ÷ ${v2}.`, `Velocidade média = ${2 * d} km ÷ (tempo de ida + tempo de volta).`],
      solution: [`$ida: ${num(t1)} h;  volta: ${num(t2)} h;  total: ${num(t1 + t2)} h`, `$v = ${2 * d} ÷ ${num(t1 + t2)} = ${num(avg)} km/h`],
    });
  }
}

/** Gasto com combustível numa viagem de ida e volta. */
function fuelGen(r: Rand) {
  for (;;) {
    const D = r.pick([120, 180, 240, 300, 360, 420]);
    const k = r.pick([10, 12, 15]);
    const P = r.pick([5.5, 5.8, 6.2, 6.5]);
    if ((2 * D) % k !== 0) continue;
    const L = (2 * D) / k;
    const cost = round(L * P, 2);
    return draftNumeric({
      prompt: [p(`Uma família fará uma viagem de ida e volta entre duas cidades distantes ${D} km. O carro faz ${k} km por litro de gasolina, que custa ${brl(P)} o litro.`)],
      ask: 'Quanto será gasto com gasolina na viagem toda?',
      prefix: 'R$',
      answer: cost,
      wrong: [
        { value: round((D / k) * P, 2), feedback: `Esse é o gasto só da ida. Ida e volta somam ${2 * D} km.` },
        { value: L, feedback: `Esses são os litros de gasolina (${num(L)} L). Multiplique pelo preço do litro.` },
        { value: round(2 * D * P, 2), feedback: 'Isso multiplica os quilômetros pelo preço do litro. Primeiro descubra os litros: km ÷ km por litro.' },
      ],
      hints: [`Distância total: 2 × ${D} = ${2 * D} km.`, `Litros: ${2 * D} ÷ ${k}; depois, × ${brl(P)}.`],
      solution: [`$${2 * D} ÷ ${k} = ${num(L)} L`, `$${num(L)} × ${num(P, 2)} = ${brl(cost)}`],
    });
  }
}

/** Ritmo de corrida (min/km) ↔ velocidade (km/h); 5 min/km = 12 km/h fica de fora (questão do banco). */
function paceGen(r: Rand) {
  if (r.next() < 0.5) {
    const pace = r.pick([4, 6, 7.5, 8, 10]);
    const v = 60 / pace;
    const paceText = pace === 7.5 ? '7 min 30 s' : `${pace} min`;
    return draftNumeric({
      prompt: [p(`Um aplicativo de corrida mostra o ritmo de uma atleta: ${paceText} por quilômetro.`)],
      ask: 'Qual é a velocidade dela, em km/h?',
      unit: 'km/h',
      answer: v,
      wrong: [
        { value: pace, feedback: `Isso repete o número do ritmo. ${paceText} por km quer dizer que, em 60 min, ela corre 60 ÷ ${num(pace)} km.` },
        { value: round(1 / pace, 4), feedback: 'Isso dá quilômetros por minuto. Em uma hora (60 min), ela corre 60 vezes isso.' },
      ],
      hints: ['Uma hora tem 60 minutos.', `Quantos trechos de ${paceText} cabem em 60 min? 60 ÷ ${num(pace)}.`],
      solution: [`$60 ÷ ${num(pace)} = ${num(v)} km em 1 hora`, `$v = ${num(v)} km/h`],
    });
  }
  const v = r.pick([6, 8, 10, 15, 20]);
  const pace = 60 / v;
  return draftNumeric({
    prompt: [p(v >= 15 ? `Um ciclista de passeio mantém ${v} km/h.` : `Um corredor mantém ${v} km/h num treino longo.`)],
    ask: 'Quantos minutos ele leva para percorrer cada quilômetro?',
    unit: 'min',
    answer: pace,
    wrong: [
      { value: v, feedback: `Isso repete a velocidade. ${v} km/h são ${v} km em 60 min: cada km leva 60 ÷ ${v} min.` },
      { value: round(v / 60, 4), feedback: 'Isso dá quilômetros por minuto. A pergunta é o contrário: minutos por quilômetro.' },
    ],
    hints: [`${v} km/h: ${v} km em 60 minutos.`, `Cada km: 60 ÷ ${v} min.`],
    solution: [`$${v} km em 60 min → 1 km em 60 ÷ ${v} = ${num(pace)} min`, pace === 7.5 ? 'Ou seja, 7 min 30 s por km.' : `Ou seja, ${num(pace)} min por km.`],
  });
}

// ———————————————————————————————————————————————— aula

export const VELOCIDADE = lesson({
  id: 'velocidade',
  topic: 'grandezas',
  subtopics: ['velocidade'],
  title: 'Velocidade e tempo',
  summary: 'Velocidade média com o tempo em horas (base 60), distância e duração de viagens, km/h e m/s, horários de chegada, encontros, ultrapassagens, média de ida e volta e ritmo de corrida.',
  requires: ['conversao', 'regra-de-tres'],
  stages: [
    stage('tempo', 'descoberta', 'Velocidade média', 'Calcular velocidades médias e distâncias com o tempo em horas, sem confundir a base 60 do relógio com a base 10 dos decimais.', () => ({
      learn: [
        text('**Velocidade média** é a distância dividida pelo tempo: v = d ÷ t. Em km/h, o tempo precisa estar **em horas** — e aí mora a armadilha: o relógio conta de **60 em 60**. 30 min = 0,5 h, 15 min = 0,25 h e 50 min = 50/60 h; e 1,5 h é 1 h **30 min**, e não 1 h 50 min.'),
        math('v = [[d|t]]     d = v × t     t = [[d|v]]', 'minutos → horas: ÷ 60;  horas → minutos: × 60'),
        lab({
          title: 'O treino de bicicleta',
          intro: 'Escolha a distância e o tempo de um treino e veja a velocidade média.',
          params: [
            { key: 'd', label: 'Distância', min: 5, max: 60, step: 5, value: 5, format: (v) => `${v} km` },
            { key: 't', label: 'Tempo', min: 10, max: 180, step: 10, value: 10, format: (v) => hm(v / 60) },
          ],
          readouts: ({ d, t }) => [
            { label: 'Tempo em horas', value: `${t} ÷ 60 = ${num(t / 60, 3)} h` },
            { label: 'Velocidade média', value: `${num((d * 60) / t, 2)} km/h`, big: true, tone: 'brass' },
          ],
          viz: ({ d, t }) => ({
            kind: 'chart',
            xLabel: 'tempo (min)',
            yLabel: 'distância (km)',
            xMin: 0,
            xMax: 180,
            yMin: 0,
            yMax: 60,
            series: [{ label: 'treino', tone: 'brass', points: [[0, 0], [t, d]] }],
            markers: [{ x: t, y: d, label: `${d} km em ${hm(t / 60)}`, tone: 'verdigris' }],
            summary: `${d} km em ${hm(t / 60)}: velocidade média de ${num((d * 60) / t, 2)} km/h`,
          }),
          goal: {
            task: 'Monte um treino com velocidade média de exatamente 24 km/h.',
            done: ({ d, t }) => Math.abs((d * 60) / t - 24) < 1e-9,
            success: 'Isso: por exemplo, 20 km em 50 min = 20 ÷ (50/60) = 24 km/h. Em 1 hora seriam 24 km.',
          },
          insight: 'Quanto mais inclinada a reta distância × tempo, maior a velocidade.',
        }),
        example('A caminhada', 'Uma pessoa caminhou 6 km em 1 h 30 min. Qual foi a velocidade média?', [
          askStep('Primeiro, o tempo em horas.', 'Quanto é 1 h 30 min em horas?', [
            ok('1,5 h'),
            no('1,3 h', '30 minutos são metade de uma hora: 0,5 h, e não 0,3 h.'),
          ]),
          step('Divida:', 'v = 6 ÷ 1,5 = 4 km/h'),
        ], 'A velocidade média foi de 4 km/h.'),
        warn('1,5 h não é 1 h 50 min', 'Na forma decimal, a parte depois da vírgula é fração de hora: 0,5 h = 30 min; 0,25 h = 15 min; 0,2 h = 12 min. Para converter, multiplique por 60.'),
        check(numeric({
          prompt: [p('Um aplicativo estima 2,4 h para uma viagem.')],
          ask: 'Quantos minutos são?',
          unit: 'min',
          answer: 144,
          wrong: [
            { value: 240, feedback: 'Isso multiplica por 100. Uma hora tem 60 minutos: 2,4 × 60 = 144.' },
            { value: 160, feedback: 'Isso lê 2,4 h como 2 h 40 min. A parte decimal é fração de hora: 0,4 × 60 = 24 min.' },
          ],
          solution: ['$2,4 × 60 = 144 min', 'Ou seja, 2 h 24 min.'],
        })),
      ],
      practice: [gen(avgSpeedGen), gen(decimalTimeGen), gen(distanceGen)],
      challenge: [gen(distanceGen), gen(avgSpeedGen), gen(decimalTimeGen)],
      recap: [
        'v = d ÷ t, com t em horas para km/h.',
        'Minutos → horas: ÷ 60 (30 min = 0,5 h).',
        'Parte decimal da hora × 60 = minutos.',
      ],
    })),

    stage('viagens', 'fundamentos', 'Duração, unidades e horários', 'Calcular a duração de viagens, converter km/h e m/s e descobrir horários de chegada.', () => ({
      learn: [
        text('Da fórmula v = d ÷ t saem as outras duas: **d = v × t** e **t = d ÷ v**. Para passar de km/h para m/s, lembre que 1 km = 1.000 m e 1 h = 3.600 s: **divida por 3,6**; de m/s para km/h, **multiplique por 3,6**. E, para achar um horário de chegada, transforme a duração em horas e minutos antes de somar.'),
        math('t = [[d|v]]', 'km/h ÷ 3,6 = m/s;  m/s × 3,6 = km/h'),
        lab({
          title: 'Metros por segundo',
          intro: 'Escolha uma velocidade em m/s e veja quanto ela vale em km/h.',
          params: [{ key: 'v', label: 'Velocidade', min: 1, max: 40, step: 1, value: 5, format: (v) => `${v} m/s` }],
          readouts: ({ v }) => [
            { label: 'Em 1 hora (3.600 s)', value: `${v} × 3.600 = ${num(v * 3600)} m = ${num(v * 3.6, 1)} km` },
            { label: 'Em km/h', value: `${num(v * 3.6, 1)} km/h`, big: true, tone: 'brass' },
          ],
          viz: ({ v }) => ({
            kind: 'bars',
            bars: [
              { label: 'm/s', value: v, tone: 'sky', text: `${v}` },
              { label: 'km/h', value: v * 3.6, tone: 'brass', text: num(v * 3.6, 1) },
            ],
            max: 150,
            summary: `${v} m/s equivalem a ${num(v * 3.6, 1)} km/h: o número em km/h é 3,6 vezes maior`,
          }),
          goal: {
            task: 'Ache a velocidade em m/s que equivale a 72 km/h.',
            done: ({ v }) => v === 20,
            success: 'Isso: 20 m/s × 3,6 = 72 km/h. E, de volta, 72 ÷ 3,6 = 20 m/s.',
          },
          insight: 'A mesma velocidade tem um número 3,6 vezes maior em km/h do que em m/s.',
        }),
        example('Do km/h para m/s', 'Um carro anda a 90 km/h. Quantos metros ele percorre por segundo?', [
          askStep('Escreva 90 km/h em metros e segundos.', 'O que significa 90 km/h?', [
            ok('90.000 m em 3.600 s'),
            no('90 m em 60 s', 'Um quilômetro tem 1.000 m, e uma hora tem 3.600 s (60 × 60): 90 km/h = 90.000 m em 3.600 s.'),
          ]),
          step('Divida:', '90.000 ÷ 3.600 = 25 m/s'),
        ], 'São 25 m/s. Atalho: 90 ÷ 3,6 = 25.'),
        key('O atalho do 3,6', 'Como 1 km/h = 1.000 m ÷ 3.600 s = 1/3,6 m/s, basta dividir por 3,6 para ir de km/h a m/s, e multiplicar por 3,6 para voltar.'),
        check(numeric({
          prompt: [p('Uma viagem de 210 km será feita a uma velocidade média de 84 km/h.')],
          ask: 'Quantos minutos a viagem vai durar?',
          unit: 'min',
          answer: 150,
          wrong: [
            { value: 2.5, feedback: 'Esse é o tempo em horas (210 ÷ 84). Em minutos: 2,5 × 60 = 150.' },
            { value: 170, feedback: 'Isso lê 2,5 h como 2 h 50 min. Meia hora são 30 min: 2 h 30 min = 150 min.' },
          ],
          solution: ['$t = [[210|84]] = 2,5 h', '$2,5 × 60 = 150 min (2 h 30 min)'],
        })),
      ],
      practice: [gen(travelTimeGen), gen(kmhMsGen), gen(arrivalGen)],
      challenge: [gen(arrivalGen), gen(travelTimeGen), gen(kmhMsGen)],
      recap: [
        't = d ÷ v; d = v × t.',
        'km/h ÷ 3,6 = m/s; m/s × 3,6 = km/h.',
        'Horário de chegada: converta a duração em h e min antes de somar.',
      ],
    })),

    stage('encontros', 'aplicacoes', 'Encontros e ultrapassagens', 'Resolver problemas com dois móveis: sentidos opostos (as velocidades se somam) e mesmo sentido (as velocidades se subtraem).', () => ({
      learn: [
        text('Com dois móveis, pense na **distância entre eles**. Se vão **um ao encontro do outro**, ela diminui a cada hora a **soma** das velocidades. Se vão **no mesmo sentido**, o mais rápido tira, por hora, só a **diferença** das velocidades. O tempo é a distância entre eles dividida por essa velocidade de aproximação.'),
        compare([
          { title: 'Sentidos opostos', tone: 'brass', lines: ['aproximação: v₁ + v₂', 't = distância ÷ (v₁ + v₂)', 'cada um anda a parte proporcional à sua velocidade'] },
          { title: 'Mesmo sentido', tone: 'iris', lines: ['aproximação: v₁ − v₂', 't = vantagem ÷ (v₁ − v₂)', 'vantagem = quanto o da frente já andou'] },
        ], 'Dois móveis'),
        lab({
          title: 'Dois carros na estrada',
          intro: 'Duas cidades, A e B, estão a 240 km. Um carro sai de cada uma, ao mesmo tempo, um em direção ao outro.',
          params: [
            { key: 'a', label: 'Carro que sai de A', min: 40, max: 100, step: 10, value: 60, format: (v) => `${v} km/h` },
            { key: 'b', label: 'Carro que sai de B', min: 40, max: 100, step: 10, value: 90, format: (v) => `${v} km/h` },
          ],
          readouts: ({ a, b }) => [
            { label: 'Aproximação', value: `${a} + ${b} = ${a + b} km/h` },
            { label: 'Tempo até o encontro', value: `240 ÷ ${a + b} = ${hm(240 / (a + b))}` },
            { label: 'Encontro', value: `a ${num((240 * a) / (a + b), 1)} km de A`, big: true, tone: 'brass' },
          ],
          viz: ({ a, b }) => ({
            kind: 'numberline',
            min: 0,
            max: 240,
            step: 40,
            points: [
              { value: 0, label: 'A', tone: 'brass' },
              { value: 240, label: 'B', tone: 'iris' },
              { value: (240 * a) / (a + b), label: 'encontro', tone: 'verdigris' },
            ],
            arrows: [
              { from: 0, to: (240 * a) / (a + b), label: `${a} km/h`, tone: 'brass' },
              { from: 240, to: (240 * a) / (a + b), label: `${b} km/h`, tone: 'iris' },
            ],
            summary: `Carros a ${a} e ${b} km/h: encontro depois de ${hm(240 / (a + b))}, a ${num((240 * a) / (a + b), 1)} km de A`,
          }),
          goal: {
            task: 'Faça os carros se encontrarem exatamente no meio do caminho, a 120 km de A.',
            done: ({ a, b }) => a === b,
            success: 'Isso: com velocidades iguais, cada um anda metade. Com velocidades diferentes, o mais rápido anda a parte maior.',
          },
          insight: 'O ponto de encontro divide a estrada na mesma razão das velocidades.',
        }),
        example('A ultrapassagem', 'Um ônibus sai a 60 km/h. Uma hora depois, um carro sai do mesmo ponto, no mesmo sentido, a 90 km/h. Quanto tempo o carro leva para alcançar o ônibus?', [
          step('Vantagem do ônibus quando o carro sai:', '60 × 1 = 60 km'),
          askStep('Agora, a aproximação.', 'A cada hora, quanto o carro se aproxima?', [
            ok('90 − 60 = 30 km'),
            no('90 + 60 = 150 km', 'Somar vale quando um vai ao encontro do outro. No mesmo sentido, o carro só ganha a diferença: 30 km por hora.'),
          ]),
          step('Tempo:', '60 ÷ 30 = 2 h'),
        ], 'O carro alcança o ônibus 2 h depois de sair.'),
        check(numeric({
          prompt: [p('Dois ciclistas estão a 36 km um do outro e pedalam um em direção ao outro, a 10 km/h e a 14 km/h.')],
          ask: 'Em quantos minutos eles se encontram?',
          unit: 'min',
          answer: 90,
          wrong: [
            { value: 1.5, feedback: 'Esse é o tempo em horas (36 ÷ 24). Em minutos: 1,5 × 60 = 90.' },
            { value: 540, feedback: 'Isso subtrai as velocidades (36 ÷ 4 = 9 h). Indo um ao encontro do outro, elas se somam: 24 km/h.' },
          ],
          solution: ['$aproximação: 10 + 14 = 24 km/h', '$t = [[36|24]] = 1,5 h = 90 min'],
        })),
      ],
      practice: [gen(meetGen), gen(catchUpGen), gen(meetPointGen)],
      challenge: [gen(catchUpGen), gen(meetPointGen), gen(meetGen)],
      recap: [
        'Sentidos opostos: some as velocidades.',
        'Mesmo sentido: subtraia, e comece pela vantagem.',
        'Tempo = distância entre eles ÷ velocidade de aproximação.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: velocidade no ENEM', 'Resolver problemas inéditos de velocidade média, consumo de combustível e ritmo, com atenção às armadilhas de média e de unidades.', () => ({
      learn: [
        strategy('Velocidade em 4 passos', '1) Anote distâncias, tempos e velocidades com as unidades. 2) Passe o tempo para horas (÷ 60) ou a velocidade para m/s (÷ 3,6), conforme o pedido. 3) Use a relação certa: v = d ÷ t, d = v × t ou t = d ÷ v; com dois móveis, a velocidade de aproximação. 4) Velocidade média é sempre distância total ÷ tempo total.'),
        example('Ida e volta', 'Um carro vai a uma cidade a 120 km, a 60 km/h, e volta a 40 km/h. Qual é a velocidade média na viagem toda?', [
          step('Tempos:', 'ida: 120 ÷ 60 = 2 h;  volta: 120 ÷ 40 = 3 h'),
          askStep('Agora, a média.', 'Qual é a velocidade média?', [
            ok('240 km ÷ 5 h = 48 km/h'),
            no('(60 + 40) ÷ 2 = 50 km/h', 'A média simples ignora que o carro passa mais tempo na volta, mais lenta. Use distância total ÷ tempo total.'),
          ]),
        ], 'A velocidade média é 48 km/h, e não 50.'),
        warn('Média de velocidades', 'A velocidade média de ida e volta não é a média dos dois números: o trecho mais lento dura mais e pesa mais. Calcule sempre distância total ÷ tempo total.'),
        check(numeric({
          prompt: [p('Uma corredora completou 5 km em 30 minutos.')],
          ask: 'Qual foi a velocidade média dela, em km/h?',
          unit: 'km/h',
          answer: 10,
          wrong: [
            { value: 6, feedback: 'Esse é o ritmo: 30 ÷ 5 = 6 minutos por quilômetro. A velocidade é 5 km ÷ 0,5 h = 10 km/h.' },
            { value: 0.1667, feedback: 'Isso dá quilômetros por minuto (5 ÷ 30). Em 60 min, ela correria 10 km.' },
          ],
          solution: ['$30 min = 0,5 h', '$v = 5 ÷ 0,5 = 10 km/h'],
        })),
      ],
      practice: [gen(roundTripGen), gen(fuelGen), gen(paceGen)],
      challenge: [gen(roundTripGen), gen(arrivalGen), gen(fuelGen), gen(meetGen)],
      recap: [
        'Velocidade média = distância total ÷ tempo total.',
        'Combustível: km ÷ (km por litro) = litros; × preço.',
        'Ritmo (min/km) e velocidade (km/h): 60 ÷ um = o outro.',
      ],
    })),
  ],
});
