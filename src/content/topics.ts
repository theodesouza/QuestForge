import type { Topic, TopicId } from './types';

export const TOPICS: Topic[] = [
  {
    id: 'razao-proporcao',
    label: 'Razão e proporção',
    short: 'Proporção',
    enemWeight: 5,
    subtopics: [
      { id: 'razao', label: 'Razão' },
      { id: 'proporcao', label: 'Proporção e divisão proporcional' },
      { id: 'escala', label: 'Escalas' },
      { id: 'regra-de-tres', label: 'Regra de três simples' },
      { id: 'regra-de-tres-inversa', label: 'Grandezas inversamente proporcionais' },
      { id: 'regra-de-tres-composta', label: 'Regra de três composta' },
    ],
  },
  {
    id: 'porcentagem',
    label: 'Porcentagem',
    short: 'Porcentagem',
    enemWeight: 5,
    subtopics: [
      { id: 'porcentagem-basica', label: 'Cálculo de porcentagem' },
      { id: 'variacao-percentual', label: 'Variação percentual' },
      { id: 'aumentos-sucessivos', label: 'Aumentos e descontos sucessivos' },
    ],
  },
  {
    id: 'financeira',
    label: 'Matemática financeira',
    short: 'Financeira',
    enemWeight: 3,
    subtopics: [
      { id: 'juros-simples', label: 'Juros simples' },
      { id: 'juros-compostos', label: 'Juros compostos' },
      { id: 'compras-a-prazo', label: 'Compras à vista e a prazo' },
      { id: 'custo-beneficio', label: 'Preço unitário e custo-benefício' },
    ],
  },
  {
    id: 'basica',
    label: 'Matemática básica',
    short: 'Básica',
    enemWeight: 4,
    subtopics: [
      { id: 'fracoes', label: 'Frações' },
      { id: 'operacoes', label: 'Operações e expressões' },
      { id: 'mmc-mdc', label: 'MMC e MDC' },
      { id: 'potencias', label: 'Potências e raízes' },
      { id: 'notacao-cientifica', label: 'Notação científica' },
    ],
  },
  {
    id: 'equacoes',
    label: 'Equações e sistemas',
    short: 'Equações',
    enemWeight: 3,
    subtopics: [
      { id: 'equacao-1grau', label: 'Equações do 1º grau' },
      { id: 'sistemas', label: 'Sistemas lineares' },
    ],
  },
  {
    id: 'funcoes',
    label: 'Funções',
    short: 'Funções',
    enemWeight: 4,
    subtopics: [
      { id: 'funcao-afim', label: 'Função afim' },
      { id: 'funcao-quadratica', label: 'Função quadrática' },
      { id: 'funcao-exponencial', label: 'Função exponencial' },
    ],
  },
  {
    id: 'graficos',
    label: 'Gráficos e tabelas',
    short: 'Gráficos',
    enemWeight: 5,
    subtopics: [
      { id: 'leitura-graficos', label: 'Leitura de gráficos' },
      { id: 'tabelas', label: 'Tabelas' },
    ],
  },
  {
    id: 'estatistica',
    label: 'Estatística',
    short: 'Estatística',
    enemWeight: 5,
    subtopics: [
      { id: 'media', label: 'Média aritmética e ponderada' },
      { id: 'mediana-moda', label: 'Mediana e moda' },
    ],
  },
  {
    id: 'probabilidade',
    label: 'Probabilidade',
    short: 'Probabilidade',
    enemWeight: 4,
    subtopics: [
      { id: 'probabilidade-simples', label: 'Probabilidade simples' },
      { id: 'probabilidade-composta', label: 'Eventos sucessivos' },
    ],
  },
  {
    id: 'combinatoria',
    label: 'Análise combinatória',
    short: 'Combinatória',
    enemWeight: 3,
    subtopics: [
      { id: 'principio-multiplicativo', label: 'Princípio multiplicativo' },
      { id: 'combinacao', label: 'Combinações' },
    ],
  },
  {
    id: 'geo-plana',
    label: 'Geometria plana',
    short: 'Geo. plana',
    enemWeight: 5,
    subtopics: [
      { id: 'areas', label: 'Áreas e perímetros' },
      { id: 'pitagoras', label: 'Teorema de Pitágoras' },
      { id: 'circulo', label: 'Círculo e circunferência' },
    ],
  },
  {
    id: 'geo-espacial',
    label: 'Geometria espacial',
    short: 'Geo. espacial',
    enemWeight: 4,
    subtopics: [
      { id: 'volumes', label: 'Volumes' },
      { id: 'cilindro', label: 'Cilindros' },
    ],
  },
  {
    id: 'grandezas',
    label: 'Grandezas e medidas',
    short: 'Medidas',
    enemWeight: 4,
    subtopics: [
      { id: 'conversao', label: 'Conversão de unidades' },
      { id: 'velocidade', label: 'Velocidade e tempo' },
    ],
  },
];

const BY_ID = new Map(TOPICS.map((t) => [t.id, t]));

export function getTopic(id: TopicId): Topic {
  const t = BY_ID.get(id);
  if (!t) throw new Error(`Assunto desconhecido: ${id}`);
  return t;
}

export function subtopicLabel(topic: TopicId, subtopic: string): string {
  return getTopic(topic).subtopics.find((s) => s.id === subtopic)?.label ?? subtopic;
}

export const TOPIC_IDS: TopicId[] = TOPICS.map((t) => t.id);
