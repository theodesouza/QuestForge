/** Notas das alternativas erradas — Razão e proporção. */
import type { DistractorNotes } from '../distractors';

export const NOTES_RAZAO: DistractorNotes = {
  // ——— Razão
  'RZP-001': {
    A: '2/3 = 12/18 compara meninas com MENINOS. A pergunta usa o total da turma: 12 + 18 = 30.',
    B: '3/5 = 18/30 é a fração de meninos na turma, não de meninas.',
    D: '3/2 = 18/12 compara meninos com meninas: inverte as partes e ainda deixa o total de fora.',
    E: '1/3 viria de 6/18 (a diferença entre meninos e meninas sobre os meninos). A fração de meninas é 12 ÷ 30 = 2/5.',
  },
  'RZP-018': {
    A: '4 = 4.800 ÷ 1.200: há um zero a mais no divisor. São 120 vagas: 4.800 ÷ 120 = 40.',
    B: '25 seria o número de vagas para cada 1.000 candidatos (120 ÷ 4.800 × 1.000): a razão ficou invertida. Candidatos por vaga = 4.800 ÷ 120.',
    C: '48 = 4.800 ÷ 100 dividiu por 100, mas são 120 vagas: 4.800 ÷ 120 = 40.',
    E: '400 = 4.800 ÷ 12: faltou um zero no divisor. São 120 vagas: 4.800 ÷ 120 = 40.',
  },
  'RZP-101': {
    B: '140 seria a taxa por 10.000 habitantes. Na base pedida (1.000): 3.360 ÷ 240.000 × 1.000 = 14.',
    C: '1,4 é a taxa por 100 habitantes (1,4%). A base pedida é 1.000: 14 por mil.',
    D: '71,4 = 240.000 ÷ 3.360 dá habitantes por nascimento: a razão foi invertida.',
    E: '0,014 é o número de nascidos por habitante. Falta multiplicar pela base: 0,014 × 1.000 = 14.',
  },
  'RZP-102': {
    A: '180 MB é a taxa por MINUTO (900 ÷ 5). Em segundos: 5 min = 300 s, e 900 ÷ 300 = 3 MB/s.',
    B: '15 = 900 ÷ 60 usou só 1 minuto (60 s). O download levou 5 minutos, isto é, 300 s.',
    C: '1,8 = 900 ÷ 500 trata 5 minutos como 500 segundos. Cada minuto tem 60 s: 5 min = 300 s.',
    D: '0,33 = 300 ÷ 900 dá segundos por megabyte: a razão foi invertida. MB/s = 900 ÷ 300 = 3.',
  },
  'RZP-112': {
    A: '1,8 = 2.700 ÷ 1.500 usou março, mas o menor mês é abril (1.200).',
    B: '0,44 = 1.200 ÷ 2.700 é a razão inversa. "Entre o maior e o menor, nessa ordem" é 2.700 ÷ 1.200.',
    D: '1,25 = 1.500 ÷ 1.200 compara março com abril; o maior número é o de maio (2.700).',
    E: '1,75 = 2.100 ÷ 1.200 usou junho; o maior número mensal é o de maio (2.700).',
  },
  'VAM-001': {
    B: '2/3 = 30/45 é a razão inversa (poesia : romances). A ordem pedida é romances : poesia.',
    C: '3/5 = 45/75 compara os romances com o TOTAL de livros. A pergunta compara romances com poesia.',
    D: '5/2 = 75/30 compara o total de livros com os de poesia.',
    E: '1/2 = 15/30 usa a diferença (45 − 30) no lugar dos romances. Razão é a divisão das quantidades: 45 ÷ 30.',
  },
  'VAM-004': {
    A: '3/4 = 36/48 é a fração de assentos ocupados no ônibus. A pergunta compara vazios com ocupados.',
    B: '1/4 = 12/48 compara os vazios com o TOTAL de assentos. A pergunta compara vazios com ocupados: 12/36.',
    C: '3/1 = 36/12 é a razão inversa (ocupados : vazios). A ordem pedida é vazios : ocupados.',
    E: '4/3 = 48/36 compara o total com os ocupados. Primeiro calcule os vazios: 48 − 36 = 12.',
  },
  'VAG-001': {
    B: '1/3 = 6/18 é a fração das runas QUADRADAS entre as analisadas, não das circulares.',
    C: '4/11 = 12/33 usa todas as runas no denominador. Só entram as que não são triangulares: 12 + 6 = 18.',
    D: '3/2 = 18/12 é a razão invertida (analisadas : circulares). A fração pedida é circulares ÷ analisadas = 12/18.',
    E: '3/5 não compara as circulares com as runas analisadas. Entre as 18 runas não triangulares, 12 são circulares: 12/18 = 2/3.',
  },
  'RZP-008': {
    A: 'A diferença de densidades não é 1.000: X tem 360.000 ÷ 120 = 3.000 e Y tem 250.000 ÷ 50 = 5.000 hab/km².',
    B: '2.500 = 250.000 ÷ 100 usa uma área errada para Y (são 50 km²): a densidade de Y é 5.000 hab/km².',
    C: '3.000 hab/km² é a densidade de X. A pergunta é quanto a de Y (5.000) supera a de X.',
    D: '5.000 hab/km² é a densidade de Y. Falta subtrair a de X (3.000).',
  },
  'RZP-103': {
    A: 'R$ 36,80 é o preço do pacote de 1 kg, que só parece o mais barato. O de 500 g sai por 17,90 × 2 = R$ 35,80 o quilo.',
    B: 'R$ 37,00 é o preço por kg da lata de 2 kg (74,00 ÷ 2): a maior embalagem não é a mais vantajosa aqui.',
    D: 'R$ 38,00 é o preço por kg do pacote de 250 g (9,50 × 4), o MAIOR preço por quilo.',
    E: 'R$ 17,90 é o preço do pacote de 500 g, não o preço por quilo. Para 1 kg: 17,90 × 2 = 35,80.',
  },
  'RZP-113': {
    B: '45 = 36 × 5/4 usa cebola : batata como se fosse tomate : batata. Iguale a cebola: 3 : 2 = 6 : 4, e a razão fica 6 : 4 : 5.',
    C: '24 é o número de caixas de CEBOLA (36 × 2/3). A pergunta é sobre batata: 24 × 5/4 = 30.',
    D: '90 = 36 × 5/2 mistura os termos: o 2 é da cebola na primeira razão, e o 5 está ligado ao 4 da cebola na segunda. Iguale a cebola: 6 : 4 : 5.',
    E: '60 = 36 × 5/3 junta o 3 do tomate com o 5 da batata sem igualar a cebola. Com 6 : 4 : 5, a batata é 36 × 5/6 = 30.',
  },
  'VAM-006': {
    B: 'A diferença de rendimento não é 2 km/L: a primeira lancha fez 54 ÷ 9 = 6 km/L e a segunda, 70 ÷ 10 = 7 km/L.',
    C: '6 km/L é o rendimento da primeira lancha (54 ÷ 9). A pergunta é a diferença para a segunda.',
    D: '7 km/L é o rendimento da segunda lancha (70 ÷ 10). Falta subtrair o da primeira (6 km/L).',
    E: '16 = 70 − 54 compara as distâncias, mas as lanchas usaram quantidades diferentes de combustível. Compare km por litro.',
  },
  'VAM-010': {
    A: '0,33 é a razão inversa (vidro ÷ metal). A pergunta é quantas vezes o valor do metal corresponde ao do vidro: 1,80 ÷ 0,60.',
    B: '1,2 = 1,80 − 0,60 é a diferença por quilo. "Quantas vezes" é divisão: 1,80 ÷ 0,60 = 3.',
    C: 'R$ 1,80 é o valor por kg do metal, não a comparação. Divida pelo valor por kg do vidro (R$ 0,60).',
    D: '2,5 não compara os valores por quilo: o vidro rende 43,20 ÷ 72 = R$ 0,60/kg e o metal, 162 ÷ 90 = R$ 1,80/kg; 1,80 ÷ 0,60 = 3.',
  },
  'VAM-013': {
    A: 'A diminuição não é 0,25: antes, 18 ÷ 1.200 × 100 = 1,5 falha por 100 h; depois, 9 ÷ 900 × 100 = 1. A diferença é 0,5.',
    B: '0,4 não sai da comparação das taxas na mesma base. Antes: 1,5 falha por 100 h; depois: 1 falha por 100 h; a diminuição é 0,5.',
    D: '0,75 = 9 ÷ 1.200 × 100 mistura as falhas de depois com as horas de antes. Cada período tem a sua taxa: 1,5 e 1.',
    E: '1 falha por 100 h é a taxa DEPOIS da revisão. A pergunta é a diminuição: 1,5 − 1 = 0,5.',
  },
  'VAM-017': {
    A: '60 = 180 ÷ 3 não usa a razão 7 : 5. Ela forma 12 partes de 15 ingressos: meias = 5 × 15 = 75.',
    C: '90 é a metade de 180: seria dividir em partes iguais. A razão 7 : 5 dá 7 partes de inteiras para 5 de meias.',
    D: '105 = 7 × 15 é o número de ingressos INTEIROS. As meias são 5 × 15 = 75.',
    E: '125 trata o 7 como total de partes (180 ÷ 7 ≈ 25 por parte). O total de partes é 7 + 5 = 12: 180 ÷ 12 = 15, e meias = 5 × 15 = 75.',
  },
  'VAG-007': {
    A: '60 mL de óleo têm 60 × 1,3 = 78 g. Para 91 g: 91 ÷ 1,3 = 70 mL.',
    C: '91 mL trata massa e volume como iguais (densidade 1 g/mL). Este óleo tem 39 ÷ 30 = 1,3 g/mL.',
    D: '118,3 = 91 × 1,3 multiplicou pela densidade. Volume = massa ÷ densidade: 91 ÷ 1,3 = 70 mL.',
    E: '130 mL viria de uma densidade de 0,7 g/mL. Com 39 g em 30 mL, a densidade é 1,3 g/mL, e 91 ÷ 1,3 = 70 mL.',
  },
  'VAG-021': {
    B: '293,75 = 47 × 200 ÷ 32 ignora as 12 divisões do sensor vazio. Proporcional é o acréscimo: 47 − 12 = 35 divisões.',
    C: '470 conta 10 g por divisão desde o zero, mas o sensor vazio já marca 12. Desconte: (47 − 12) × 10 = 350 g.',
    D: '550 g não sai do acréscimo proporcional: 20 divisões correspondem a 200 g (10 g por divisão), e 47 − 12 = 35 divisões a 350 g.',
    E: '700 = 35 × 20 usa 20 g por divisão. A calibração dá 200 g para 32 − 12 = 20 divisões: 10 g por divisão.',
  },
  'RZP-104': {
    A: '192 era o total ANTES da campanha (72 homens + 120 mulheres). Some as 24 novas matrículas: 216.',
    B: '144 é o número de mulheres DEPOIS da campanha (120 + 24). Some os 72 homens.',
    C: '120 é o número de mulheres ANTES da campanha. Depois são 144, e com os 72 homens o total é 216.',
    E: '72 é o número de homens, que não mudou. A pergunta é o total de alunos depois da campanha.',
  },
  'RZP-114': {
    A: '9 km/h ignora a transmissão: cada pedalada gira a roda 48 ÷ 16 = 3 vezes, não 1.',
    B: '7,5 é a velocidade em METROS POR SEGUNDO (450 m/min ÷ 60). Em km/h: 450 × 60 ÷ 1.000 = 27.',
    C: '3 é o número de voltas da roda por pedalada (48 ÷ 16), não a velocidade.',
    E: '2,7 tem a vírgula fora do lugar: 450 m/min × 60 = 27.000 m/h = 27 km/h.',
  },
  'VAG-015': {
    A: '80 km é a distância da viagem, não a economia. Por pessoa: carro 150 × 80 ÷ 4 = 3.000 g; trem 40 × 80 = 3.200 g.',
    B: '150 g/km é a emissão do carro inteiro por quilômetro. Divida pelos 4 ocupantes e multiplique pelos 80 km antes de comparar.',
    C: '160 = 40 × 4 é a emissão do trem para os 4 sentinelas em 1 km. Compare por pessoa, na viagem inteira: 3.200 − 3.000 = 200 g.',
    D: '800 g é a economia do GRUPO todo (12.800 − 12.000). Por pessoa, divida pelos 4: 200 g.',
  },
};
