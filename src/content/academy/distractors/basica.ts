/** Notas das alternativas erradas — Matemática básica. */
import type { DistractorNotes } from '../distractors';

export const NOTES_BASICA: DistractorNotes = {
  // ——— Frações
  'BAS-001': {
    B: '5/8 é a fração comida (3 + 2 = 5 fatias). A pergunta é o que sobrou: 8 − 5 = 3 fatias.',
    C: '1/4 = 2/8 é só a parte de Maria. Sobraram 3 das 8 fatias.',
    D: 'Você comparou o que sobrou (3) com o que foi comido (5). A base é a pizza inteira: 8 fatias.',
    E: 'Metade seriam 4 fatias. Sobraram 3 de 8.',
  },
  'BAS-101': {
    A: '2/3 são os jogos que não foram derrota (10 de 15). As derrotas são 5 de 15.',
    C: '7/15 é a fração das vitórias, não das derrotas.',
    D: '1/5 = 3/15 é a fração dos empates.',
    E: 'Metade compararia derrotas (5) com vitórias e empates (10). A base é o total: 5/15 = 1/3.',
  },
  'BAS-106': {
    B: 'Você somou 3 inteiros a 3/4. O fator é 3: são 3 vezes 3/4 = 9/4 = 2 1/4.',
    C: 'Você dividiu 3/4 por 3. Mais pães pedem mais polvilho: multiplique por 3.',
    D: 'Essa é a quantidade para 20 pães. Para 60 (o triplo), triplique.',
    E: '1 1/2 = 2 × 3/4 serviria para 40 pães. Para 60 é 3 × 3/4.',
  },
  'BAS-111': {
    A: '7/24 é a diferença 2/3 − 3/8. "Fração de uma fração" é multiplicação: 3/8 × 2/3 = 1/4.',
    B: '3/8 é a fração da área de plantio, não do terreno inteiro.',
    D: 'Somar numeradores e denominadores ((2 + 3)/(3 + 8)) não tem significado com frações.',
    E: 'Você usou 1/3 (a parte sem plantio) no lugar de 2/3: 3/8 × 1/3 = 1/8.',
  },
  'BAS-113': {
    A: '3 × 1/4 = 3/4 de litro é o volume de 3 copos. Para saber quantos copos cabem, divida: 3 ÷ 1/4 = 12.',
    B: 'Você somou 3 + 1/4. Divida o suco pelo tamanho do copo.',
    C: 'Você somou 3 + 4. Em cada litro cabem 4 copos de 1/4: em 3 litros, 3 × 4 = 12.',
    D: 'Divisão invertida: 1/4 ÷ 3 = 1/12. O certo é 3 ÷ 1/4 = 12.',
  },
  'BAS-119': {
    B: 'A barra da fração não é uma vírgula: 3/8 = 3 ÷ 8 = 0,375.',
    C: 'Essa é a divisão 8 ÷ 3. O numerador (3) é que se divide pelo denominador (8).',
    D: '3 × 8 = 24: multiplicação no lugar da divisão.',
    E: 'Uma casa decimal a mais: 3 ÷ 8 = 0,375 (lembre que 1/8 = 0,125).',
  },
  'BAS-102': {
    A: '3/4 (= 9/12) está em 2º lugar, atrás de 5/6 (= 10/12).',
    B: '1/2 (= 6/12) é a menor fração: último lugar.',
    C: '5/6 (= 10/12) é a maior fração: 1º lugar.',
    E: '7 é o maior numerador, mas os pedaços são de 1/12: 7/12 fica em 4º lugar.',
  },
  'BAS-114': {
    A: '3/5 = 60%. Já 62,5% = 625/1.000 = 5/8.',
    B: '25/4 = 6,25 = 625%. A vírgula foi parar no lugar errado: 62,5% = 0,625.',
    D: '8/5 é o inverso de 5/8 (vale 160%).',
    E: '1/16 = 6,25%. Confira: 0,625 = 5/8.',
  },
  'BAS-105': {
    A: '13/20 é o que já foi construído. Falta 1 − 13/20 = 7/20.',
    B: 'Somar numeradores e denominadores ((2 + 1)/(5 + 4) = 1/3) não vale. Com denominador comum: 8/20 + 5/20 = 13/20.',
    D: '3/5 é o que faltava depois do 1º dia (1 − 2/5). Falta descontar o 2º dia também.',
    E: '3/4 é 1 − 1/4: você descontou só o 2º dia.',
  },
  'BAS-006': {
    B: '1/3 é a fração da ÁGUA que restou, não da capacidade: 1/3 de 3/4 = 1/4 da capacidade.',
    C: 'Você fez 3/4 − 2/3, como se os 2/3 fossem da capacidade. Eles são da água que havia (3/4).',
    D: '5/12 = 3/4 − 1/3 mistura bases. Consumiram 2/3 de 3/4 = 1/2; restou 3/4 − 1/2 = 1/4.',
    E: '1/2 da capacidade foi o que se consumiu (2/3 × 3/4). Restou 3/4 − 1/2 = 1/4.',
  },
  'BAS-103': {
    B: 'Você usou 1/4 × 3/5 = 3/20 como a fração que falta. Falta (1 − 1/4) × (1 − 3/5) = 3/10 do trajeto: 90 ÷ 3/10 = 300.',
    C: '225 km era o que faltava depois do 1º dia (90 ÷ 2/5). Desfaça também o 1º dia: 225 ÷ 3/4 = 300.',
    D: '120 sairia se os 90 km fossem 3/4 do trajeto. Eles são o que sobrou após os dois dias: 3/10 do total.',
    E: 'Confira de trás para a frente: com 135 km, 1/4 é 33,75 e 3/5 do restante é 60,75 — sobrariam 40,5 km, não 90.',
  },
  'BAS-108': {
    A: '3 h é o tempo para encher o tanque VAZIO (1 ÷ 1/3). Ele já tinha 1/4: faltam 3/4 ÷ 1/3 = 2,25 h.',
    B: 'Você esqueceu o ralo: sem ele a vazão seria 5/12 por hora; com ele, 1/4 + 1/6 − 1/12 = 1/3.',
    C: '2,25 h não é 2 h 25 min: 0,25 h = 15 min.',
    D: 'O ralo esvazia: a vazão dele subtrai (1/4 + 1/6 − 1/12 = 1/3 do tanque por hora), não soma.',
  },
  'BAS-109': {
    A: '2 17/20 m = 4 − 3/4 − 2/5: você descontou um pedaço de cada tamanho. São 2 de 3/4 m e 3 de 2/5 m.',
    C: '2 7/10 m é o comprimento USADO nos cortes (1,5 + 1,2). Sobra 4 − 2,7 = 1,3 m.',
    D: '2,1 m = 4 − 1,5 − 0,4: os suportes são 3 pedaços de 2/5 m (1,2 m), não um.',
    E: '2,05 m = 4 − 0,75 − 1,2: as prateleiras são 2 pedaços de 3/4 m (1,5 m), não um.',
  },
  'BAS-117': {
    A: '14 2/3 = 5 1/2 ÷ 3/8: faltou separar o 1/4 de litro da degustação.',
    B: 'Você somou o 1/4 de litro da degustação em vez de subtraí-lo.',
    C: 'Para saber quantos potes cabem, divida o mel disponível (5 1/4 L) pelo tamanho do pote (3/8 L).',
    E: '42 = 5,25 × 8: faltou dividir por 3 — o pote tem 3/8 de litro, não 1/8.',
  },
  'BAS-123': {
    B: '15 = 12 ÷ 0,8: você usou a fração dos que NÃO vão de carro. Os 12 são o restante, 20%.',
    C: '30 sairia se o carro fosse 40%. Some 40% + 25% + 15% = 80%: o carro é 20%.',
    D: '48 são os que não vão de carro (80% de 60). A pergunta é o total de entrevistados.',
    E: '120 sairia se os 12 fossem 10% do total. Eles são 20%.',
  },
  'BAS-124': {
    A: 'Você dividiu por 1/80: cada bombom leva 3/80 kg, então 3 kg ÷ 3/80 = 80 bombons.',
    B: 'Faltou descontar as decorações (1/3 do que restou depois dos bolos).',
    C: '40 bombons usariam 1,5 kg — que é o chocolate das decorações. Para os bombons sobraram 3 kg.',
    E: '128 bombons usariam 4,8 kg, mais do que sobrou. Depois dos bolos restam 4,5 kg; depois das decorações, 3 kg.',
  },
};
