import { router, useIsFocused } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { findQuestion } from '../content/bank';
import { getTopic, subtopicLabel } from '../content/topics';
import { ALT_KEYS } from '../content/types';
import type { Attempt } from '../domain/game/types';
import { StemBlocks } from '../features/question/StemBlocks';
import { loadMistakeHistory } from '../state/actions';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { Panel } from '../ui/Panel';
import { Screen } from '../ui/Screen';
import { Text } from '../ui/Text';
import { colors, space } from '../ui/theme';

const PAGE_SIZE = 20;

export default function Mistakes() {
  const focused = useIsFocused();
  const [page, setPage] = useState(0);
  const [attempts, setAttempts] = useState<Attempt[] | null>(null);
  const [selected, setSelected] = useState<Attempt | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!focused) return;
    let active = true;
    loadMistakeHistory(PAGE_SIZE + 1, page * PAGE_SIZE).then(rows => {
      if (active) {
        setAttempts(rows);
        setError(false);
      }
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [focused, page, retry]);
  useEffect(() => {
    if (!focused || !selected) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setSelected(null);
      return true;
    });
    return () => subscription.remove();
  }, [focused, selected]);
  const question = selected ? findQuestion(selected.questionId) : undefined;
  const back = () => selected ? setSelected(null) : router.back();
  const changePage = (next: number) => { setAttempts(null); setError(false); setPage(next); };

  return (
    <Screen key={selected?.id ?? page}>
      <View style={styles.header}>
        <IconButton icon="chevronLeft" label={selected ? 'Voltar ao histórico' : 'Voltar'} onPress={back} />
        <Text variant="title">{selected ? 'Revisar o erro' : 'Histórico de erros'}</Text>
      </View>
      {selected ? question ? (
        <>
          <Text variant="label" color={colors.brass}>{subtopicLabel(question.topic, question.subtopic)}</Text>
          <Text variant="caption" color={colors.mist}>{new Date(selected.createdAt).toLocaleString('pt-BR')}</Text>
          <StemBlocks blocks={question.stem} />
          <Text variant="ask">{question.ask}</Text>
          <Panel>
            <View style={styles.section}>
              {ALT_KEYS.map(canonical => {
                const note = canonical === question.answer ? ' · correta' : canonical === selected.chosen ? ' · sua resposta' : '';
                return <Text key={canonical} color={canonical === question.answer ? colors.verdigris : canonical === selected.chosen ? colors.ember : colors.parchment}>{question.alternatives[canonical]}{note}</Text>;
              })}
            </View>
          </Panel>
          <Text variant="caption" color={colors.mist}>
            {selected.hints} dicas usadas{selected.guessed ? ' · marcou chute' : ''}
          </Text>
          <Text variant="heading">Resolução passo a passo</Text>
          {question.solution.map((step, i) => <Text key={i}>{i + 1}. {step}</Text>)}
          <Panel><Text variant="label" color={colors.iris}>Conceito-chave</Text><Text>{question.concept}</Text></Panel>
          <Text variant="caption" color={colors.mist}>Consultar esta resolução não concede XP nem altera o prazo do Eco.</Text>
          <Button label="Voltar ao histórico" variant="secondary" onPress={() => setSelected(null)} />
        </>
      ) : <Text>Esta questão não está disponível nesta versão. Seu registro foi preservado.</Text> : (
        <>
          <Text color={colors.mist}>Revisite suas tentativas e entenda cada passo. Uma mesma questão pode aparecer mais de uma vez.</Text>
          {error ? (
            <><Text>Não foi possível carregar o histórico.</Text><Button label="Tentar novamente" onPress={() => { setError(false); setAttempts(null); setRetry(r => r + 1); }} /></>
          ) : !attempts ? <Text accessibilityLiveRegion="polite">Carregando seu histórico…</Text> : (
            <>
              {attempts.length === 0 ? <Text>{page === 0 ? 'Nenhum erro registrado. Quando houver um, a resolução ficará aqui.' : 'Não há mais erros neste histórico.'}</Text> : attempts.slice(0, PAGE_SIZE).map(a => {
                const q = findQuestion(a.questionId);
                return (
                  <Panel key={a.id}>
                    <View style={styles.section}>
                      <Text variant="caption" color={colors.mist}>{new Date(a.createdAt).toLocaleString('pt-BR')}</Text>
                      <Text variant="label" color={colors.brass}>{q ? getTopic(q.topic).label : a.questionId}</Text>
                      <Text variant="subheading">{q ? subtopicLabel(q.topic, q.subtopic) : 'Questão indisponível'}</Text>
                      {q ? <Text numberOfLines={3}>{q.ask}</Text> : null}
                      <Button label={`Ver resolução · ${a.questionId}`} size="md" variant="secondary" disabled={!q} onPress={() => setSelected(a)} />
                    </View>
                  </Panel>
                );
              })}
              <Text variant="caption" color={colors.mist}>Página {page + 1} · até {PAGE_SIZE} tentativas por página</Text>
              {page > 0 ? <Button label="Mais recentes" variant="secondary" onPress={() => changePage(page - 1)} /> : null}
              {attempts.length > PAGE_SIZE ? <Button label="Mais antigos" variant="secondary" onPress={() => changePage(page + 1)} /> : null}
            </>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
  section: { gap: space.sm },
});
