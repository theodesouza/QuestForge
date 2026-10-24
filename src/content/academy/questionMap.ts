/**
 * Questões do banco → etapas da Academia que ensinam o que elas exigem. A primeira
 * etapa de cada lista é a principal (peso 1 no diagnóstico); as demais ajudam (peso 0,5).
 * O teste de cobertura exige que toda questão do banco esteja aqui.
 */
export const QUESTION_STAGES: Record<string, string[]> = {
  // ——— Matemática básica: operações
  'BAS-116': ['operacoes/reta-numerica'],
  'BAS-110': ['operacoes/reta-numerica'],
  'BAS-122': ['operacoes/reta-numerica'],
  'BAS-118': ['operacoes/reta-numerica', 'operacoes/maestria'],
  'BAS-107': ['operacoes/ordem'],
  'BAS-115': ['operacoes/ordem'],
  'BAS-112': ['operacoes/ordem', 'operacoes/decimais'],
  'BAS-104': ['operacoes/decimais', 'operacoes/dia-a-dia'],
  'BAS-121': ['operacoes/decimais'],
  'BAS-005': ['operacoes/dia-a-dia'],
  'BAS-120': ['operacoes/dia-a-dia', 'operacoes/decimais'],
  // ——— Matemática básica: frações
  'BAS-001': ['fracoes/partes-do-todo'],
  'BAS-101': ['fracoes/partes-do-todo'],
  'BAS-119': ['fracoes/partes-do-todo', 'fracoes/equivalencia'],
  'BAS-102': ['fracoes/equivalencia'],
  'BAS-114': ['fracoes/equivalencia'],
  'BAS-105': ['fracoes/operacoes'],
  'BAS-106': ['fracoes/operacoes'],
  'BAS-111': ['fracoes/operacoes', 'fracoes/fracao-de-que'],
  'BAS-113': ['fracoes/operacoes'],
  'BAS-109': ['fracoes/operacoes'],
  'BAS-117': ['fracoes/operacoes', 'fracoes/maestria'],
  'BAS-006': ['fracoes/fracao-de-que'],
  'BAS-124': ['fracoes/fracao-de-que', 'fracoes/operacoes'],
  'BAS-103': ['fracoes/descobrir-o-todo', 'fracoes/fracao-de-que'],
  'BAS-123': ['fracoes/descobrir-o-todo', 'fracoes/equivalencia'],
  'BAS-108': ['fracoes/ritmos'],
};
