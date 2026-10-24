/**
 * Aula: Operações e expressões — números negativos na reta, ordem das operações,
 * contas com decimais, estimativa e contas do dia a dia (parte fixa + parte variável).
 */
import {
  askStep,
  check,
  choice,
  draftChoice,
  draftNumeric,
  example,
  fill,
  gen,
  key,
  lab,
  lesson,
  math,
  no,
  numeric,
  numericOptions,
  ok,
  order,
  p,
  reveal,
  sample,
  select,
  spot,
  stage,
  step,
  strategy,
  table,
  text,
  tip,
  warn,
} from '../../kit/build';
import { brl, fixed, num, round } from '../../kit/format';
import type { Rand } from '../../types';

const signed = (n: number) => (n < 0 ? `−${num(-n)}` : num(n));
const deg = (n: number) => `${signed(n)} °C`;

function temperatureGen(r: Rand) {
  for (;;) {
    const start = r.int(-4, 12);
    const drop = r.int(2, 5);
    const hoursDown = r.int(2, 5);
    const rise = r.int(1, 4);
    const hoursUp = r.int(2, 4);
    const end = start - drop * hoursDown + rise * hoursUp;
    if (end === start || end > 15) continue;
    // Não reproduz os números da questão do banco que esta etapa prepara.
    if (start === 5 && drop === 3 && hoursDown === 4 && rise === 2 && hoursUp === 3) continue;
    const at = 20 + hoursDown + hoursUp;
    const when = at === 24 ? 'à meia-noite' : `às ${at - 24} h da madrugada`;
    return draftNumeric({
      prompt: [p(`Às 20 h, um termômetro marcava ${deg(start)}. Nas ${hoursDown} horas seguintes, a temperatura caiu ${drop} °C a cada hora. Depois, nas ${hoursUp} horas seguintes, subiu ${rise} °C a cada hora.`)],
      ask: `Qual temperatura o termômetro marcava ${when}?`,
      unit: '°C',
      answer: end,
      wrong: [
        { value: -end, feedback: 'O valor está certo, mas o sinal não: confira se a temperatura terminou abaixo ou acima de zero.' },
        { value: start - drop + rise, feedback: 'Você aplicou a queda e a subida uma vez só. São várias horas: multiplique cada variação pelo número de horas.' },
        { value: start + drop * hoursDown - rise * hoursUp, feedback: 'Os sentidos estão trocados: cair é subtrair e subir é somar.' },
      ],
      hints: ['Calcule a variação total: queda total e subida total.', `Queda: ${hoursDown} × ${drop} = ${hoursDown * drop} °C; subida: ${hoursUp} × ${rise} = ${hoursUp * rise} °C.`],
      solution: [`$${signed(start)} − ${hoursDown * drop} + ${hoursUp * rise} = ${signed(end)}`, `O termômetro marcava ${deg(end)}.`],
    });
  }
}

function balanceGen(r: Rand) {
  for (;;) {
    const start = r.int(1, 8) * 50;
    const bill = r.int(4, 12) * 50;
    const deposit = r.int(1, 6) * 30;
    const spend = r.int(1, 5) * 25;
    const now = start - bill + deposit - spend;
    const target = r.pick([50, 100, 150, 200]);
    const need = target - now;
    if (now >= 0 || need <= 0) continue;
    return draftNumeric({
      prompt: [
        p('Uma conta bancária aceita saldo negativo. A tabela mostra o saldo inicial e as movimentações do mês.'),
        table(['Movimentação', 'Valor'], [['Saldo inicial', brl(start)], ['Aluguel', `− ${brl(bill)}`], ['Depósito', `+ ${brl(deposit)}`], ['Compra no débito', `− ${brl(spend)}`]]),
      ],
      ask: `Quanto é preciso depositar agora para o saldo ficar em ${brl(target)} positivos?`,
      prefix: 'R$',
      answer: need,
      wrong: [
        { value: -now, feedback: `Esse depósito só zera a conta. Ainda faltaria chegar aos ${brl(target)}.` },
        ...(-now - target > 0
          ? [{ value: -now - target, feedback: `Você descontou o alvo do valor que zera a dívida. Para ir de ${signed(now)} até ${num(target)}, cubra a dívida (${num(-now)}) e ainda some os ${num(target)}: ${num(need)}.` }]
          : []),
        ...(target + now > 0
          ? [{ value: target + now, feedback: `Você descontou a dívida do alvo, como se ela ajudasse. Ela precisa ser coberta: ${num(target)} − (${signed(now)}) = ${num(need)}.` }]
          : []),
        { value: bill + spend - deposit + target, feedback: `Faltou o saldo inicial de ${brl(start)}: as movimentações partem dele.` },
        { value: target - (start - bill - deposit - spend), feedback: 'O depósito entra na conta (soma); só o aluguel e a compra saem.' },
      ],
      hints: ['Calcule primeiro o saldo depois das movimentações (pode ser negativo).', 'Depósito = saldo desejado − saldo atual.'],
      solution: [`$${num(start)} − ${num(bill)} + ${num(deposit)} − ${num(spend)} = ${signed(now)}`, `$${num(target)} − (${signed(now)}) = ${num(need)}`, `É preciso depositar ${brl(need)}.`],
    });
  }
}

/** Expressões com resultado inteiro, montadas para exigir a ordem das operações. */
function expressionGen(r: Rand) {
  for (;;) {
    const a = r.int(10, 40);
    const b = r.int(2, 6);
    const c = r.int(1, 5);
    const d = r.int(2, 4);
    const e = r.pick([2, 3, 4, 6]);
    const inner = c + d;
    // Com soma 2, elevar ao quadrado e dobrar coincidem: o distrator deixaria de existir.
    if (inner < 3 || (b * inner * inner) % e !== 0) continue;
    const value = a - (b * inner * inner) / e;
    const expr = `${a} − ${b} × (${c} + ${d})² ÷ ${e}`;
    const leftToRight = ((a - b) * inner * inner) / e;
    const noPower = a - (b * inner * 2) / e;
    const plusFirst = a - (b * (c + d * d)) / e;
    if (value < 1 || ![leftToRight, noPower, plusFirst].every(Number.isInteger)) continue;
    return draftChoice({
      prompt: [{ kind: 'math', lines: [expr] }],
      ask: 'Qual é o valor da expressão?',
      options: numericOptions({ value, text: num(value) }, [
        { value: leftToRight, text: num(leftToRight), feedback: `Você fez ${a} − ${b} primeiro. Multiplicação e divisão vêm antes da subtração.` },
        { value: noPower, text: num(noPower), feedback: `(${c} + ${d})² = ${inner}² = ${inner * inner}, e não ${inner} × 2.` },
        { value: plusFirst, text: num(plusFirst), feedback: 'O parêntese vem antes da potência: some o que está dentro e só depois eleve ao quadrado.' },
      ]),
      hints: ['Ordem: parênteses → potências → multiplicações e divisões → somas e subtrações.', `Comece por (${c} + ${d}) = ${inner} e eleve ao quadrado.`],
      solution: [`$(${c} + ${d})² = ${inner * inner}`, `$${b} × ${inner * inner} ÷ ${e} = ${(b * inner * inner) / e}`, `$${a} − ${(b * inner * inner) / e} = ${num(value)}`],
      verify: () => value,
    });
  }
}

function decimalProductGen(r: Rand) {
  let ca = 0;
  let cb = 0;
  // Centésimos sem zero à direita: a tela mostraria todos os algarismos do produto.
  do {
    ca = r.int(20, 98) * 10 + r.int(1, 9);
    cb = r.int(10, 98) * 10 + r.int(1, 9);
  } while ((ca * cb) % 10 === 0);
  const a = ca / 100;
  const b = cb / 100;
  const digits = ca * cb;
  const exact = Math.round(digits / 100) / 100;
  const dec = (n: number) => fixed(n, 2);
  return draftChoice({
    prompt: [p(`Uma calculadora com defeito não mostra a vírgula. Ao multiplicar ${dec(a)} por ${dec(b)}, ela exibiu apenas os algarismos ${digits}.`)],
    ask: 'Qual é o resultado correto, arredondado ao centésimo?',
    options: numericOptions({ value: exact, text: dec(exact) }, [
      { value: exact * 10, text: dec(exact * 10), feedback: `Estime: ${num(Math.round(a))} × ${num(Math.round(b))} ≈ ${num(Math.round(a) * Math.round(b))}. Esse valor é 10 vezes maior que a estimativa.` },
      { value: exact / 10, text: dec(exact / 10), feedback: `Estime: ${num(Math.round(a))} × ${num(Math.round(b))} ≈ ${num(Math.round(a) * Math.round(b))}. Esse valor é 10 vezes menor.` },
      { value: exact * 100, text: dec(exact * 100), feedback: 'Cem vezes maior que a estimativa: confira quantas casas decimais os fatores têm (2 + 2 = 4).' },
    ]),
    hints: ['Arredonde os fatores e estime o produto.', 'Os dois fatores têm 2 casas decimais: o produto tem 4.'],
    solution: [`Estimativa: ${num(Math.round(a))} × ${num(Math.round(b))} ≈ ${num(Math.round(a) * Math.round(b))}.`, `Com 4 casas decimais: ${num(digits / 10000, 4)} ≈ ${dec(exact)}.`],
    verify: () => exact,
    tolerance: 0.001,
  });
}

function fuelGen(r: Rand) {
  for (;;) {
    const km = r.pick([180, 240, 300, 360, 420, 480]);
    const kml = r.pick([10, 12, 12.5, 15, 16]);
    const price = r.pick([5.2, 5.6, 5.8, 6, 6.2]);
    const liters = km / kml;
    if (Math.abs(liters * 10 - Math.round(liters * 10)) > 1e-9) continue;
    const cost = round(liters * price, 2);
    return draftNumeric({
      prompt: [p(`Um carro faz ${num(kml, 1)} km por litro de gasolina, e o litro custa ${brl(price)}. A viagem tem ${km} km.`)],
      ask: 'Quanto se gasta de combustível na viagem?',
      prefix: 'R$',
      answer: cost,
      tolerance: 0.01,
      wrong: [
        { value: round(km * price, 2), feedback: 'Você multiplicou os quilômetros pelo preço do litro. Primeiro descubra quantos LITROS a viagem consome.' },
        { value: liters, feedback: `${num(liters, 2)} é o número de litros, não o custo. Falta multiplicar pelo preço.` },
        { value: round(liters + price, 2), feedback: 'Você somou os litros ao preço. O custo é litros × preço do litro.' },
      ],
      hints: ['Etapa 1: litros = distância ÷ quilômetros por litro.', 'Etapa 2: custo = litros × preço do litro.'],
      solution: [`$${km} ÷ ${num(kml, 1)} = ${num(liters, 2)} L`, `$${num(liters, 2)} × ${fixed(price, 2)} = ${brl(cost)}`],
    });
  }
}

function billGen(r: Rand) {
  const fixedPart = r.pick([8, 10, 15, 18, 20, 25]);
  const unit = r.pick([0.6, 0.65, 0.7, 0.75, 0.8, 0.9]);
  const qty = r.pick([90, 120, 150, 180, 200, 240]);
  const variable = round(unit * qty, 2);
  const total = round(fixedPart + variable, 2);
  return draftNumeric({
    prompt: [p(`Uma conta de energia tem taxa fixa de ${brl(fixedPart)} mais ${brl(unit)} por kWh consumido. Neste mês, a casa consumiu ${qty} kWh.`)],
    ask: 'Qual é o valor da conta?',
    prefix: 'R$',
    answer: total,
    tolerance: 0.01,
    wrong: [
      { value: variable, feedback: 'Faltou somar a taxa fixa, que é cobrada todo mês.' },
      { value: round((fixedPart + unit) * qty, 2), feedback: 'A taxa fixa é cobrada uma vez só, não por kWh.' },
      { value: fixedPart + qty, feedback: `Você somou a taxa ao consumo, misturando reais com kWh. Primeiro o consumo vira dinheiro: ${qty} × ${fixed(unit, 2)}.` },
    ],
    hints: ['Total = parte fixa + preço por unidade × quantidade.', `Parte variável: ${qty} × ${brl(unit)}.`],
    solution: [`$${num(fixedPart)} + ${fixed(unit, 2)} × ${qty} = ${num(fixedPart)} + ${fixed(variable, 2)} = ${brl(total)}`],
  });
}

export const OPERACOES = lesson({
  id: 'operacoes',
  topic: 'basica',
  subtopics: ['operacoes'],
  title: 'Operações e expressões',
  summary:
    'Números negativos na reta, a ordem das operações, contas com decimais e o hábito de estimar — a base de todo cálculo do ENEM, do saldo bancário à conta de luz.',
  requires: [],
  stages: [
    stage('reta-numerica', 'descoberta', 'Números negativos na reta', 'Somar e subtrair números com sinal pensando em deslocamentos na reta, e distinguir deslocamento de distância percorrida.', () => ({
      learn: [
        text('Temperaturas abaixo de zero, andares de subsolo e saldos devedores são números **negativos**. Pense na reta numérica: somar um positivo é andar para a direita; somar um negativo (ou subtrair) é andar para a esquerda.'),
        lab({
          title: 'Andando na reta',
          intro: 'Escolha o ponto de partida e a variação (positiva = sobe; negativa = desce). Veja onde você chega e quanto andou.',
          params: [
            { key: 'a', label: 'Começa em', min: -10, max: 10, step: 1, value: 3, format: (v) => signed(v) },
            { key: 'v', label: 'Variação', min: -12, max: 12, step: 1, value: -5, format: (v) => (v > 0 ? `+${v}` : signed(v)) },
          ],
          readouts: ({ a, v }) => [
            { label: 'Conta', value: `${signed(a)} ${v >= 0 ? '+' : '−'} ${num(Math.abs(v))} = ${signed(a + v)}`, big: true, tone: 'brass' },
            { label: 'Chegada', value: signed(a + v) },
            { label: 'Distância andada', value: num(Math.abs(v)) },
          ],
          viz: ({ a, v }) => ({
            kind: 'numberline',
            min: -25,
            max: 25,
            step: 5,
            points: [
              { value: a, label: 'início', tone: 'mist' },
              { value: a + v, label: 'fim', tone: 'brass' },
            ],
            arrows: v === 0 ? [] : [{ from: a, to: a + v, label: v > 0 ? `+${v}` : signed(v), tone: v > 0 ? 'verdigris' : 'ember' }],
            summary: `Começa em ${a}, varia ${v} e termina em ${a + v}`,
          }),
          goal: {
            task: 'Uma madrugada começou a −5 °C. Faça a temperatura chegar a 2 °C.',
            done: ({ a, v }) => a === -5 && a + v === 2,
            success: 'Isso: de −5 até 2 são 7 graus de subida (−5 + 7 = 2).',
          },
          insight: 'De −5 a 2 a distância é 7, e não 3: atravessar o zero conta os dois lados (5 até o zero e mais 2).',
        }),
        key('Subtrair um negativo é somar', 'Tirar uma dívida é ganhar: 5 − (−3) = 5 + 3 = 8. Na reta, a distância entre a e b é sempre |b − a|: entre −3 e 4, |4 − (−3)| = 7.'),
        example('O elevador do prédio', 'Num prédio, os andares são numerados −3, −2, −1 (subsolos), 0 (térreo), 1, 2, 3… Entre um andar e o seguinte há 3 m. Um elevador sai do 9º andar, desce até o 2º subsolo e sobe até o 4º andar.', [
          askStep('Primeiro trecho: do andar 9 ao andar −2.', 'Quantos andares o elevador desce?', [
            ok('11 andares'),
            no('7 andares', 'Você fez 9 − 2. Mas o destino é −2: a distância é 9 − (−2) = 11.'),
            no('2 andares', 'O elevador sai do 9º andar, não do térreo.'),
          ], '|−2 − 9| = 11 andares'),
          step('Segundo trecho: do −2 ao 4.', '|4 − (−2)| = 6 andares'),
          step('Distância percorrida: os trechos se somam (não importa o sentido).', '(11 + 6) × 3 m = 51 m'),
        ], 'O elevador percorre 51 m.'),
        warn('Deslocamento não é distância percorrida', 'Do 9º ao 4º andar o deslocamento é de 5 andares, mas o elevador passou pelo subsolo: andou 17 andares. Quando o problema pede "quanto percorreu", some todos os trechos.'),
        check(numeric({
          prompt: [p('Uma conta tinha R$ 120,00. Saiu um boleto de R$ 350,00 e entrou um depósito de R$ 90,00.')],
          ask: 'Qual é o saldo agora?',
          prefix: 'R$',
          answer: -140,
          wrong: [{ value: 140, feedback: 'O valor está certo, mas o saldo ficou negativo: 120 − 350 + 90 = −140 (a conta deve R$ 140,00).' }],
          placeholder: 'use − para negativo',
          solution: ['$120 − 350 + 90 = −140', 'O saldo é de −R$ 140,00 (negativo).'],
        })),
      ],
      practice: [
        gen(temperatureGen),
        choice({
          ask: 'Qual é a distância, na reta numérica, entre −7 e 5?',
          options: [
            ok('12'),
            no('2', 'Você fez 5 − 7 (ou −7 + 5) e tirou o sinal. A distância é |5 − (−7)| = 12.'),
            no('−12', 'Distância nunca é negativa: é o módulo da diferença.'),
            no('35', 'Multiplicação não entra aqui: distância é a diferença |b − a|.'),
          ],
          hints: ['Distância entre a e b = |b − a|.', 'Subtrair um negativo é somar: 5 − (−7) = 5 + 7.'],
          solution: ['$|5 − (−7)| = |5 + 7| = 12'],
          verify: () => 12,
        }),
        gen(balanceGen),
      ],
      challenge: [
        numeric({
          prompt: [p('Num prédio, os subsolos são −1 e −2, o térreo é 0 e os andares sobem 1, 2, 3… Há 3 m entre andares consecutivos. Um elevador vai do 10º andar ao 2º subsolo e, depois, ao 7º andar.')],
          ask: 'Quantos metros o elevador percorre ao todo?',
          unit: 'm',
          answer: 63,
          wrong: [
            { value: 9, feedback: 'Esse é só o deslocamento entre o início (10º) e o fim (7º). O elevador passou pelo subsolo: some os dois trechos.' },
            { value: 51, feedback: 'Você contou o primeiro trecho como 8 andares (10 − 2). Até o −2 são 12 andares.' },
            { value: 21, feedback: '21 é o número de andares percorridos. Cada andar tem 3 m.' },
          ],
          solution: ['Trecho 1: |−2 − 10| = 12 andares; trecho 2: |7 − (−2)| = 9 andares.', '$(12 + 9) × 3 = 63 m'],
        }),
        gen(balanceGen),
        gen(temperatureGen),
      ],
      recap: [
        'Somar positivo: anda para a direita; somar negativo (ou subtrair): para a esquerda.',
        'Subtrair um negativo é somar: a − (−b) = a + b.',
        'Distância entre a e b: |b − a|. Distância percorrida soma todos os trechos.',
      ],
    })),

    stage('ordem', 'fundamentos', 'A ordem das operações', 'Calcular expressões numéricas respeitando a prioridade das operações e evitar os atalhos que levam ao erro.', () => ({
      learn: [
        text('Uma expressão como 20 − 3 × 4 só tem um valor porque existe uma **ordem combinada**: primeiro parênteses, depois potências e raízes, depois multiplicações e divisões e, por fim, somas e subtrações.'),
        math('( )  →  potências e raízes  →  × e ÷  →  + e −'),
        key('Mesmo nível: da esquerda para a direita', 'Multiplicação e divisão têm a mesma prioridade, assim como soma e subtração. Entre elas, resolve-se da esquerda para a direita: 12 ÷ 3 × 2 = 4 × 2 = 8 (e não 12 ÷ 6 = 2).'),
        example('Uma expressão completa', [{ kind: 'math', lines: ['20 − 3 × (2 + 1)² ÷ 9 + 4'] }], [
          askStep('Olhe a expressão inteira antes de começar.', 'O que se resolve primeiro?', [
            ok('O parêntese: 2 + 1'),
            no('20 − 3, que está no começo', 'Começar pela esquerda só vale entre operações do mesmo nível. A subtração é a última.'),
            no('3 × 2', 'O 2 está dentro do parêntese, que precisa ser resolvido inteiro antes.'),
          ], '(2 + 1) = 3'),
          step('Depois, a potência:', '3² = 9'),
          step('Multiplicação e divisão, da esquerda para a direita:', '3 × 9 ÷ 9 = 27 ÷ 9 = 3'),
          step('Por fim, subtração e soma, da esquerda para a direita:', '20 − 3 + 4 = 21'),
        ], 'O valor é 21.'),
        check(order({
          ask: 'Ponha em ordem o cálculo de 5 + 2 × (7 − 3)² ÷ 8.',
          steps: ['(7 − 3) = 4', '4² = 16', '2 × 16 = 32', '32 ÷ 8 = 4', '5 + 4 = 9'],
          solution: ['Parênteses, potência, multiplicação e divisão (da esquerda para a direita) e, por último, a soma.'],
          why: 'A soma, apesar de aparecer primeiro, é a última operação.',
        })),
        warn('Atalhos que dão errado', '(3 + 4)² não é 3² + 4²: é 7² = 49, e não 25. E 2³ é 2 × 2 × 2 = 8, não 2 × 3 = 6.'),
        check(spot({
          ask: 'Em qual linha está o primeiro erro?',
          lines: ['$18 − 4 × 3 + 6 ÷ 2', '$= 14 × 3 + 6 ÷ 2', '$= 42 + 3', '$= 45'],
          wrong: 1,
          why: 'A multiplicação vem antes da subtração: 18 − 12 + 3 = 9. Fazer 18 − 4 primeiro muda tudo.',
          solution: ['$18 − 4 × 3 + 6 ÷ 2 = 18 − 12 + 3 = 9'],
        })),
        tip('Traduzindo regras em expressões', 'Quando um enunciado descreve um cálculo ("cada infração desconta 2 pontos; foram 8 leves e 4 graves em cada uma de 3 rodadas"), escreva a expressão com parênteses onde a frase agrupa as coisas: 2 × (8 + 3 × 4).'),
      ],
      practice: [
        gen(expressionGen),
        fill({
          ask: 'Complete o cálculo de 7 + 3 × 2² − 10 ÷ 5.',
          parts: ['7 + 3 × ', { options: ['4', '6', '2'], answer: 0 }, ' − ', { options: ['2', '50', '5'], answer: 0 }, ' = ', { options: ['17', '38', '20'], answer: 0 }],
          hints: ['Primeiro a potência: 2² = 4.', 'Depois 3 × 4 e 10 ÷ 5; por fim, soma e subtração.'],
          solution: ['$7 + 3 × 4 − 2 = 7 + 12 − 2 = 17'],
        }),
        choice({
          prompt: [p('Numa gincana, cada equipe começa com 80 pontos. A equipe Sol cometeu 5 infrações leves e, em 2 rodadas, 3 infrações graves em cada uma. Cada infração desconta 3 pontos. No fim, 24 pontos de bônus foram divididos igualmente entre as 4 equipes.')],
          ask: 'Qual expressão dá a pontuação final da equipe Sol?',
          options: [
            ok('80 − 3 × (5 + 2 × 3) + 24 ÷ 4'),
            no('80 − 3 × 5 + 2 × 3 + 24 ÷ 4', 'Sem o parêntese, só as infrações leves são multiplicadas por 3, e as graves passam a SOMAR pontos.'),
            no('(80 − 3) × (5 + 2 × 3) + 24 ÷ 4', 'Os 80 pontos não são multiplicados: só o desconto depende do número de infrações.'),
            no('80 − 3 × (5 + 2 + 3) + 24 ÷ 4', 'São 3 infrações graves em CADA uma das 2 rodadas: 2 × 3 = 6, e não 2 + 3.'),
          ],
          hints: ['Quantas infrações houve ao todo? 5 leves + 2 rodadas × 3 graves.', 'Cada infração desconta 3: o desconto é 3 × (total de infrações).'],
          solution: ['Infrações: 5 + 2 × 3 = 11; desconto: 3 × 11 = 33; bônus: 24 ÷ 4 = 6.', '$80 − 33 + 6 = 53 pontos'],
        }),
      ],
      challenge: [
        numeric({
          prompt: [{ kind: 'math', lines: ['9,6 ÷ 0,3 − 2 × (1,5 + 0,5)² + 0,5'] }],
          ask: 'Qual é o valor da expressão?',
          answer: 24.5,
          wrong: [
            { value: 120.5, feedback: 'Você fez 32 − 2 antes da multiplicação. Primeiro 2 × 4 = 8; depois 32 − 8 + 0,5.' },
            { value: 28.5, feedback: '(1,5 + 0,5)² = 2² = 4, e não 2 (a potência vem logo depois do parêntese).' },
            { value: 23.5, feedback: 'Confira o sinal do último termo: é + 0,5.' },
          ],
          solution: ['$9,6 ÷ 0,3 = 96 ÷ 3 = 32', '$(1,5 + 0,5)² = 4 e 2 × 4 = 8', '$32 − 8 + 0,5 = 24,5'],
        }),
        gen(expressionGen),
        numeric({
          prompt: [{ kind: 'math', lines: ['48 ÷ 4 × 2 − (5 − 2)² + 3'] }],
          ask: 'Qual é o valor da expressão?',
          answer: 18,
          wrong: [
            { value: 0, feedback: 'Você fez 4 × 2 antes de 48 ÷ 4. No mesmo nível, vale a ordem da esquerda para a direita: 48 ÷ 4 = 12; 12 × 2 = 24.' },
            { value: 12, feedback: 'Confira a soma final: 24 − 9 + 3 = 18 (soma e subtração da esquerda para a direita).' },
          ],
          solution: ['$48 ÷ 4 × 2 = 12 × 2 = 24', '$(5 − 2)² = 9', '$24 − 9 + 3 = 18'],
        }),
      ],
      recap: [
        'Ordem: parênteses → potências e raízes → × e ÷ → + e −.',
        'No mesmo nível, da esquerda para a direita: 12 ÷ 3 × 2 = 8.',
        '(a + b)² ≠ a² + b²; 2³ = 8, não 6.',
        'Ao traduzir um enunciado, use parênteses onde a frase agrupa as quantidades.',
      ],
    })),

    stage('decimais', 'fundamentos', 'Decimais e estimativa', 'Multiplicar e dividir decimais com segurança, posicionar a vírgula por estimativa e conferir se o resultado faz sentido.', () => ({
      learn: [
        text('Na multiplicação de decimais, faça a conta como se fossem inteiros e, no fim, o produto tem **tantas casas decimais quanto a soma das casas dos fatores**: 3,5 × 4,2 → 35 × 42 = 1.470 → 2 casas → 14,70.'),
        text('Para **dividir por um decimal**, multiplique dividendo e divisor pela mesma potência de 10 até o divisor ficar inteiro: 8,4 ÷ 0,4 = 84 ÷ 4 = 21.'),
        math('8,4 ÷ 0,4 = [[8,4 × 10|0,4 × 10]] = [[84|4]] = 21'),
        strategy('Estime antes de calcular', 'Arredonde os fatores e faça a conta de cabeça: 4,98 × 9,02 ≈ 5 × 9 = 45. A resposta exata tem de estar perto disso. Estimar evita vírgulas no lugar errado — um erro que o ENEM adora testar.'),
        example('O troco da feira', 'Seu Raimundo comprou 3,5 kg de caju a R$ 6,40 o quilo e pagou com uma nota de R$ 50,00.', [
          askStep('Primeiro, o valor da compra.', 'Quanto custaram os cajus?', [
            ok('R$ 22,40'),
            no('R$ 224,00', 'Estime: 3,5 × 6 ≈ 21. R$ 224 é dez vezes maior — a vírgula ficou no lugar errado.'),
            no('R$ 9,90', 'Você somou 3,5 + 6,40. O preço é por quilo: multiplique.'),
          ], '3,5 × 6,40 = 22,40'),
          step('O troco é o que foi pago menos o valor da compra:', '50,00 − 22,40 = 27,60'),
        ], 'Troco: R$ 27,60.'),
        reveal('Por que 0,1 × 0,1 é menor que 0,1?', 'Porque multiplicar por 0,1 é tomar um décimo: um décimo de 0,1 é 0,01. Multiplicar por um número entre 0 e 1 sempre diminui.'),
        check(choice({
          ask: 'Quanto é 7,2 ÷ 0,08?',
          options: [
            ok('90'),
            no('0,9', 'Estime: 0,08 cabe muitas vezes em 7,2. Multiplique os dois por 100: 720 ÷ 8 = 90.'),
            no('9', 'Faltou uma casa: multiplicando dividendo e divisor por 100, fica 720 ÷ 8 = 90.'),
            no('0,576', 'Isso é 7,2 × 0,08, uma multiplicação.'),
          ],
          solution: ['$7,2 ÷ 0,08 = [[720|8]] = 90'],
          verify: () => 90,
        })),
      ],
      practice: [
        gen(decimalProductGen),
        numeric({
          prompt: [p('Um pacote de 1,5 kg de café custa R$ 52,50.')],
          ask: 'Qual é o preço por quilograma?',
          prefix: 'R$',
          answer: 35,
          wrong: [
            { value: 78.75, feedback: 'Você multiplicou. Preço por quilo = preço ÷ massa.' },
            { value: 3.5, feedback: 'Confira a vírgula: estime 52 ÷ 1,5 ≈ 35.' },
          ],
          hints: ['Preço por quilo = preço total ÷ quilos.', 'Multiplique os dois por 10: 525 ÷ 15.'],
          solution: ['$52,50 ÷ 1,5 = 525 ÷ 15 = 35', 'R$ 35,00 por quilo.'],
        }),
        gen(fuelGen),
      ],
      challenge: [
        gen(decimalProductGen),
        gen(fuelGen),
        numeric({
          prompt: [p('Uma impressora usa 0,025 L de tinta por 100 páginas. O cartucho tem 0,45 L.')],
          ask: 'Quantas páginas o cartucho imprime?',
          unit: 'páginas',
          answer: 1800,
          wrong: [
            { value: 18, feedback: '18 é o número de "lotes" de 100 páginas. Multiplique por 100.' },
            { value: 180, feedback: 'Confira a divisão: 0,45 ÷ 0,025 = 450 ÷ 25 = 18 lotes de 100 páginas.' },
          ],
          solution: ['$0,45 ÷ 0,025 = 450 ÷ 25 = 18 lotes de 100 páginas', '18 × 100 = 1.800 páginas.'],
        }),
      ],
      recap: [
        'Produto de decimais: casas decimais do resultado = soma das casas dos fatores.',
        'Dividir por decimal: multiplique os dois termos por 10, 100… até o divisor ficar inteiro.',
        'Estime antes: a resposta exata precisa estar perto da estimativa.',
        'Multiplicar por um número entre 0 e 1 diminui; dividir por ele aumenta.',
      ],
    })),

    stage('dia-a-dia', 'aplicacoes', 'Contas do dia a dia: parte fixa e parte variável', 'Montar e resolver contas com taxa fixa e preço por unidade, em uma ou mais etapas, e responder exatamente o que foi perguntado.', () => ({
      learn: [
        text('Contas de luz, água, táxi e planos têm o mesmo formato: uma **parte fixa** (que se paga de qualquer jeito) mais uma **parte variável** (preço por unidade × quantidade).'),
        math('total = fixo + preço por unidade × quantidade'),
        lab({
          title: 'Montando a conta',
          intro: 'Ajuste a taxa fixa, o preço por unidade e o consumo. O gráfico mostra como o total cresce com o consumo.',
          params: [
            { key: 'f', label: 'Taxa fixa', min: 0, max: 30, step: 1, value: 18, format: (v) => brl(v) },
            { key: 'u', label: 'Preço por unidade', min: 0.2, max: 2, step: 0.1, value: 0.7, format: (v) => brl(v) },
            { key: 'q', label: 'Consumo', min: 0, max: 200, step: 10, value: 120, format: (v) => `${v} unidades` },
          ],
          readouts: ({ f, u, q }) => [
            { label: 'Parte variável', value: `${q} × ${brl(u)} = ${brl(u * q)}` },
            { label: 'Total', value: brl(f + u * q), big: true, tone: 'brass' },
          ],
          viz: ({ f, u, q }) => ({
            kind: 'chart',
            xLabel: 'consumo',
            yLabel: 'total (R$)',
            xMin: 0,
            xMax: 200,
            yMin: 0,
            series: [{ label: 'total da conta', tone: 'brass', points: sample(0, 200, 4, (x) => f + u * x) }],
            markers: [{ x: q, y: f + u * q, label: brl(f + u * q), tone: 'verdigris' }],
            yFormat: (y) => num(y, 0),
            summary: `Com consumo ${q}, o total é ${brl(f + u * q)}`,
          }),
          goal: {
            task: 'Com taxa fixa de R$ 10,00 e R$ 0,50 por unidade, encontre o consumo que dá uma conta de exatamente R$ 60,00.',
            done: ({ f, u, q }) => f === 10 && Math.abs(u - 0.5) < 1e-9 && q === 100,
            success: 'Isso: 10 + 0,50 × 100 = 60. Para "desfazer" a conta: (60 − 10) ÷ 0,50 = 100.',
          },
          insight: 'A taxa fixa é onde a linha começa (consumo zero); o preço por unidade é quanto ela sobe a cada unidade.',
        }),
        example('Quantos quilômetros?', 'Um táxi cobra R$ 6,00 de bandeirada mais R$ 2,40 por quilômetro. Uma corrida custou R$ 42,00.', [
          askStep('O total já inclui a bandeirada.', 'Qual é o primeiro passo?', [
            ok('Tirar a bandeirada: 42 − 6 = 36'),
            no('Dividir 42 por 2,40', 'Assim você trataria a bandeirada como se fosse quilometragem.'),
            no('Somar 42 + 6', 'A bandeirada já está dentro dos R$ 42,00: ela precisa sair, não entrar.'),
          ], '42 − 6 = 36 reais de quilometragem'),
          step('Agora, quantos quilômetros custam R$ 36,00:', '36 ÷ 2,40 = 15 km'),
        ], 'A corrida teve 15 km.'),
        check(select({
          prompt: [p('Lúcia vai viajar 420 km de carro. O carro faz 14 km por litro, o litro custa R$ 6,10 e o pedágio custa R$ 22,40. Ela saiu às 6 h e chegou às 11 h.')],
          ask: 'Marque só as informações necessárias para calcular o gasto com combustível.',
          chips: [
            { text: '420 km', needed: true },
            { text: '14 km por litro', needed: true },
            { text: 'R$ 6,10 o litro', needed: true },
            { text: 'Pedágio de R$ 22,40', needed: false, why: 'O pedágio é outro gasto: não é combustível.' },
            { text: 'Saiu às 6 h e chegou às 11 h', needed: false, why: 'O tempo de viagem não muda o consumo nesse modelo.' },
          ],
          solution: ['Litros: 420 ÷ 14 = 30; custo: 30 × 6,10 = R$ 183,00.'],
        })),
        warn('Responda o que foi perguntado', 'Num problema de várias etapas, cada etapa produz um número "tentador" (litros, metros, parte variável). Antes de marcar, releia a pergunta: ela quer o custo, a quantidade, o troco, a diferença?'),
      ],
      practice: [
        gen(billGen),
        numeric({
          prompt: [p('Um plano de celular custa R$ 35,00 por mês e inclui 5 GB. Cada GB extra custa R$ 4,50. Em um mês, Lia usou 9 GB.')],
          ask: 'Quanto ela pagou nesse mês?',
          prefix: 'R$',
          answer: 53,
          wrong: [
            { value: 75.5, feedback: 'Os 5 GB já estão incluídos: só os 4 GB acima da franquia são cobrados à parte.' },
            { value: 18, feedback: 'Esse é só o valor dos GB extras. Falta a mensalidade.' },
          ],
          hints: ['Quantos GB passaram da franquia?', 'Total = mensalidade + extras × preço do GB extra.'],
          solution: ['Extras: 9 − 5 = 4 GB → 4 × 4,50 = R$ 18,00.', '$35 + 18 = R$ 53,00'],
        }),
        gen(fuelGen),
      ],
      challenge: [
        numeric({
          prompt: [p('Uma conta de água cobra R$ 15,00 fixos mais R$ 6,20 por m³ consumido. A conta de março veio R$ 132,80.')],
          ask: 'Quantos metros cúbicos foram consumidos?',
          unit: 'm³',
          answer: 19,
          wrong: [
            { value: 132.8 / 6.2, feedback: 'Você dividiu o total por 6,20 sem tirar a parte fixa. Primeiro: 132,80 − 15 = 117,80.' },
            { value: 147.8 / 6.2, feedback: 'A parte fixa é subtraída, não somada: (132,80 − 15) ÷ 6,20.' },
          ],
          solution: ['$132,80 − 15 = 117,80', '$117,80 ÷ 6,20 = 19 m³'],
        }),
        gen(billGen),
        numeric({
          prompt: [p('Ana tem R$ 50,00 e vai comprar 2,5 kg de queijo a R$ 13,60 o quilo e 3 pães a R$ 1,80 cada.')],
          ask: 'Quanto sobra para ela?',
          prefix: 'R$',
          answer: 10.6,
          wrong: [
            { value: 39.4, feedback: 'Esse é o valor da compra. A pergunta é quanto sobra dos R$ 50,00.' },
            { value: 14.2, feedback: 'Os pães são 3: 3 × 1,80 = 5,40 (e não 1,80).' },
          ],
          solution: ['Queijo: 2,5 × 13,60 = 34,00; pães: 3 × 1,80 = 5,40.', '$50 − 34 − 5,40 = 10,60'],
        }),
      ],
      recap: [
        'Total = parte fixa + preço por unidade × quantidade.',
        'Para achar a quantidade a partir do total: (total − fixo) ÷ preço por unidade.',
        'Em várias etapas, encadeie as unidades (km → litros → reais) e releia a pergunta antes de responder.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: cálculo com estratégia', 'Resolver problemas inéditos de várias etapas com números negativos, decimais e ordem das operações, controlando o resultado por estimativa.', () => ({
      learn: [
        text('As questões difíceis de cálculo raramente exigem uma conta difícil: exigem **organização**. Separar as etapas, escolher a ordem e conferir por estimativa é o que separa o acerto do quase.'),
        strategy('Três hábitos de quem não erra conta', '1) Escreva cada etapa com a unidade ("28 L", "R$ 156,80"). 2) Antes de calcular, estime. 3) No fim, confira o sinal e a ordem de grandeza: um troco não pode ser maior que o dinheiro pago; um saldo pode ser negativo.'),
        example('Tudo junto', 'Uma loja de bairro registrou num caderno o saldo do caixa: começou o dia com −R$ 85,00 (devia ao banco). Vendeu 12 pacotes de café a R$ 18,50 e pagou 3 entregas de R$ 32,00. Quanto precisa entrar no caixa para terminar o dia com R$ 200,00?', [
          step('Vendas: 12 × 18,50 = 222,00. Entregas: 3 × 32 = 96,00.'),
          askStep('Agora o saldo depois das movimentações.', 'Qual é o saldo?', [
            ok('−85 + 222 − 96 = 41'),
            no('85 + 222 − 96 = 211', 'O saldo inicial é negativo (o caixa devia R$ 85,00): entra com sinal de menos.'),
          ], '−85 + 222 − 96 = 41'),
          step('Do saldo atual até o desejado:', '200 − 41 = 159'),
        ], 'Precisam entrar R$ 159,00.'),
        reveal('Um colega respondeu R$ 159,00 de troco para uma compra de R$ 40,00 paga com R$ 50,00. Como uma estimativa mostra, sem conta nenhuma, que há erro?', 'O troco não pode passar do valor pago (R$ 50,00). Estimativas desse tipo eliminam alternativas absurdas em segundos.'),
      ],
      practice: [
        numeric({
          prompt: [p('Às 22 h, a temperatura numa serra era 4 °C. Até as 3 h, caiu 2,5 °C por hora. Das 3 h às 7 h, subiu 1,5 °C por hora.')],
          ask: 'Qual era a temperatura às 7 h?',
          unit: '°C',
          answer: -2.5,
          wrong: [
            { value: 2.5, feedback: 'O sinal: 4 − 12,5 + 6 = −2,5 °C (abaixo de zero).' },
            { value: 3, feedback: 'Das 22 h às 3 h são 5 horas, e das 3 h às 7 h, 4 horas: multiplique cada variação pelo número certo de horas.' },
          ],
          hints: ['Das 22 h às 3 h passam 5 horas; das 3 h às 7 h, 4 horas.', 'Queda: 5 × 2,5; subida: 4 × 1,5.'],
          solution: ['$4 − 5 × 2,5 + 4 × 1,5 = 4 − 12,5 + 6 = −2,5 °C'],
        }),
        gen(balanceGen),
        gen(expressionGen),
      ],
      challenge: [
        numeric({
          prompt: [p('Um entregador faz 18 km por litro com a moto. Ele roda 64 km por dia, 22 dias por mês, e a gasolina custa R$ 6,30 o litro. Ele ganha R$ 2,10 por quilômetro rodado.')],
          ask: 'Quanto sobra no mês, descontada apenas a gasolina?',
          prefix: 'R$',
          answer: 2464,
          wrong: [
            { value: 2956.8, feedback: 'Esse é o ganho bruto do mês. Falta descontar a gasolina (1.408 km ÷ 18 km/L × R$ 6,30).' },
            { value: 492.8, feedback: 'Esse é o gasto com gasolina. A pergunta é quanto sobra.' },
          ],
          solution: ['Quilômetros no mês: 64 × 22 = 1.408.', 'Ganho: 1.408 × 2,10 = R$ 2.956,80.', 'Gasolina: 1.408 ÷ 18 ≈ 78,22 L → 78,22 × 6,30 = R$ 492,80.', '$2.956,80 − 492,80 = R$ 2.464,00'],
          tolerance: 0.5,
        }),
        numeric({
          prompt: [{ kind: 'math', lines: ['(−3)² − 2 × (−4) + 18 ÷ (−6)'] }],
          ask: 'Qual é o valor da expressão?',
          answer: 14,
          wrong: [
            { value: -4, feedback: '(−3)² = (−3) × (−3) = +9, e não −9.' },
            { value: -2, feedback: '− 2 × (−4) = +8: menos com menos dá mais.' },
            { value: 20, feedback: '18 ÷ (−6) = −3: divisão de sinais diferentes dá negativo.' },
          ],
          solution: ['$(−3)² = 9', '$−2 × (−4) = +8', '$18 ÷ (−6) = −3', '$9 + 8 − 3 = 14'],
        }),
        gen(fuelGen),
        gen(balanceGen),
      ],
      recap: [
        'Organize: cada etapa com sua unidade; releia a pergunta antes de responder.',
        'Sinais: (−a)² é positivo; menos com menos dá mais; dividir sinais diferentes dá negativo.',
        'Estimativa e bom senso eliminam alternativas absurdas.',
      ],
    })),
  ],
});
