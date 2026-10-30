/**
 * Catálogo da Academia: matérias, aulas e etapas, com consultas por referência
 * (`aula/etapa`), por assunto e por questão do banco.
 */
import type { TopicId } from '../types';
import { COURSE_BASICA } from './lessons/basica';
import { COURSE_COMBINATORIA } from './lessons/combinatoria';
import { COURSE_EQUACOES } from './lessons/equacoes';
import { COURSE_ESTATISTICA } from './lessons/estatistica';
import { COURSE_FINANCEIRA } from './lessons/financeira';
import { COURSE_FUNCOES } from './lessons/funcoes';
import { COURSE_GEO_ESPACIAL } from './lessons/geo-espacial';
import { COURSE_GEO_PLANA } from './lessons/geo-plana';
import { COURSE_GRAFICOS } from './lessons/graficos';
import { COURSE_GRANDEZAS } from './lessons/grandezas';
import { COURSE_PORCENTAGEM } from './lessons/porcentagem';
import { COURSE_PROBABILIDADE } from './lessons/probabilidade';
import { COURSE_RAZAO } from './lessons/razao-proporcao';
import { QUESTION_STAGES } from './questionMap';
import type { Course, Lesson, Stage } from './types';

/** Ordem pedagógica: fundamentos numéricos primeiro, depois a ordem das regiões do Atlas. */
export const COURSES: Course[] = [
  COURSE_BASICA,
  COURSE_RAZAO,
  COURSE_PORCENTAGEM,
  COURSE_FINANCEIRA,
  COURSE_EQUACOES,
  COURSE_FUNCOES,
  COURSE_GEO_PLANA,
  COURSE_GEO_ESPACIAL,
  COURSE_GRANDEZAS,
  COURSE_GRAFICOS,
  COURSE_ESTATISTICA,
  COURSE_PROBABILIDADE,
  COURSE_COMBINATORIA,
];

export const LESSONS: Lesson[] = COURSES.flatMap((c) => c.lessons);

const LESSON_BY_ID = new Map(LESSONS.map((l) => [l.id, l]));
const COURSE_BY_TOPIC = new Map(COURSES.map((c) => [c.topic, c]));

export function findLesson(id: string): Lesson | undefined {
  return LESSON_BY_ID.get(id);
}

export function getLesson(id: string): Lesson {
  const l = LESSON_BY_ID.get(id);
  if (!l) throw new Error(`Aula desconhecida: ${id}`);
  return l;
}

export function findCourse(topic: string): Course | undefined {
  return COURSE_BY_TOPIC.get(topic as TopicId);
}

export function courseOf(lesson: Lesson): Course {
  return COURSE_BY_TOPIC.get(lesson.topic) as Course;
}

export function stageRef(lessonId: string, stageId: string): string {
  return `${lessonId}/${stageId}`;
}

export function parseRef(ref: string): { lessonId: string; stageId: string } {
  const i = ref.indexOf('/');
  return { lessonId: ref.slice(0, i), stageId: ref.slice(i + 1) };
}

export interface StageLocation {
  ref: string;
  lesson: Lesson;
  stage: Stage;
  index: number;
}

const STAGE_BY_REF = new Map<string, StageLocation>();
for (const lesson of LESSONS) {
  lesson.stages.forEach((stage, index) => {
    const ref = stageRef(lesson.id, stage.id);
    STAGE_BY_REF.set(ref, { ref, lesson, stage, index });
  });
}

export const STAGE_REFS: readonly string[] = [...STAGE_BY_REF.keys()];

export function findStage(ref: string): StageLocation | undefined {
  return STAGE_BY_REF.get(ref);
}

export function getStage(ref: string): StageLocation {
  const s = STAGE_BY_REF.get(ref);
  if (!s) throw new Error(`Etapa desconhecida: ${ref}`);
  return s;
}

/** Aulas que cobrem um assunto (e, se informado, um subassunto específico). */
export function lessonsFor(topic: TopicId, subtopic?: string): Lesson[] {
  return LESSONS.filter((l) => l.topic === topic && (!subtopic || l.subtopics.includes(subtopic)));
}

// ———————————————————————————————————————————————— questões do banco ↔ etapas

export interface MappedQuestion {
  id: string;
  /** 1 = a etapa ensina o que a questão exige; 0,5 = a etapa ajuda (conhecimento secundário). */
  weight: number;
}

const QUESTIONS_BY_STAGE = new Map<string, MappedQuestion[]>();
for (const [questionId, refs] of Object.entries(QUESTION_STAGES)) {
  refs.forEach((ref, i) => {
    const list = QUESTIONS_BY_STAGE.get(ref) ?? [];
    list.push({ id: questionId, weight: i === 0 ? 1 : 0.5 });
    QUESTIONS_BY_STAGE.set(ref, list);
  });
}

/** Etapas que ensinam o que a questão exige — a primeira é a principal. */
export function stagesForQuestion(questionId: string): readonly string[] {
  return QUESTION_STAGES[questionId] ?? [];
}

/** Questões do Atlas que uma etapa prepara para resolver. */
export function questionsForStage(ref: string): readonly MappedQuestion[] {
  return QUESTIONS_BY_STAGE.get(ref) ?? [];
}

/** Questões do Atlas ligadas a qualquer etapa de uma aula (sem repetição). */
export function questionsForLesson(lesson: Lesson): string[] {
  const ids = new Set<string>();
  for (const s of lesson.stages) for (const q of questionsForStage(stageRef(lesson.id, s.id))) ids.add(q.id);
  return [...ids];
}
