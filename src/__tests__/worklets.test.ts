/**
 * Auditoria de worklets. Tudo o que roda no thread de UI (useAnimatedStyle, gestos, relógios) só
 * pode chamar funções marcadas com 'worklet'. Uma função comum do app ali dentro funciona no
 * navegador e nos testes, e derruba o app no aparelho (foi o que causou as "falhas contínuas" de
 * uma atualização). Este teste compila cada arquivo como o Metro compila, lê o que cada worklet
 * captura (`__closure`) e reprova qualquer função do app capturada sem a marca.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const babel = require('@babel/core') as { transformSync: (code: string, opts: object) => { code: string } | null };

const SRC = path.join(__dirname, '..');
const HINT = /useAnimatedStyle|useDerivedValue|useAnimatedReaction|useAnimatedProps|useFrameCallback|useAnimatedScrollHandler|runOnUI|Gesture\.|['"]worklet['"]/;

function walk(dir: string, out: string[] = []): string[] {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      if (name !== '__tests__' && name !== 'node_modules') walk(full, out);
    } else if (/\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) && !name.endsWith('.d.ts')) out.push(full);
  }
  return out;
}

// O preset mora dentro do pacote `expo` (é o mesmo que o Metro usa).
const PRESET = require.resolve('babel-preset-expo', { paths: [path.dirname(require.resolve('expo/package.json'))] });

function compile(code: string, filename: string): string {
  const out = babel.transformSync(code, { filename, presets: [PRESET], babelrc: false, configFile: false, caller: { name: 'metro', platform: 'android', isDev: false, bundler: 'metro' } });
  return out?.code ?? '';
}

/** Nomes capturados pelos worklets do arquivo já compilado. */
function captured(compiled: string): Set<string> {
  const names = new Set<string>();
  for (const m of compiled.matchAll(/\.__closure\s*=\s*\{([^}]*)\}/g)) {
    for (const part of m[1].split(',')) {
      const key = part.split(':')[0].trim();
      if (/^[A-Za-z_$][\w$]*$/.test(key)) names.add(key);
    }
  }
  return names;
}

type Kind = 'worklet' | 'plain-function' | 'not-a-function';

/** O que `name` é em `code`: função com a marca, função sem a marca, ou outra coisa (número, objeto, valor compartilhado). */
function kindIn(code: string, name: string): Kind {
  let kind: Kind = 'not-a-function';
  const marked = (from: number) => /^\s*\{\s*['"]worklet['"]/.test(code.slice(from));
  const decl = new RegExp(`function\\s+${name.replace(/\$/g, '\\$')}\\s*(<[^>]*>)?\\s*\\(`, 'g');
  for (let m = decl.exec(code); m; m = decl.exec(code)) {
    // Pula os parênteses dos parâmetros (podem ter tipos com parênteses) e o tipo de retorno até a chave do corpo.
    let i = m.index + m[0].length;
    for (let depth = 1; i < code.length && depth > 0; i++) depth += code[i] === '(' ? 1 : code[i] === ')' ? -1 : 0;
    const brace = code.indexOf('{', i);
    const ret = code.slice(i, brace);
    // Tipo de retorno em forma de objeto (`): { x: number } {`): o corpo é a chave seguinte ao tipo.
    const body = /^\s*:\s*$/.test(ret) ? code.indexOf('{', code.indexOf('}', brace)) : brace;
    if (marked(body)) return 'worklet';
    kind = 'plain-function';
  }
  const arrow = new RegExp(`(?:const|let)\\s+${name.replace(/\$/g, '\\$')}\\s*(?::[^=]+)?=\\s*(?:async\\s*)?(?:\\([^()]*(?:\\([^()]*\\)[^()]*)*\\)|[A-Za-z_$][\\w$]*)\\s*(?::\\s*[^=]+?)?=>`, 'g');
  for (let m = arrow.exec(code); m; m = arrow.exec(code)) {
    if (marked(m.index + m[0].length)) return 'worklet';
    kind = 'plain-function';
  }
  return kind;
}

function resolveRelative(from: string, spec: string): string | null {
  const base = path.resolve(path.dirname(from), spec);
  for (const candidate of [`${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), path.join(base, 'index.tsx')]) if (fs.existsSync(candidate)) return candidate;
  return null;
}

/**
 * `name` é chamada de dentro de algum worklet? Capturar sem chamar é legítimo: é assim que uma função
 * comum é entregue a `scheduleOnRN(fn, …)` para rodar de volta no thread do React.
 */
function calledInWorklet(compiled: string, name: string): boolean {
  const call = new RegExp(`(^|[^.\\w$])${name.replace(/\$/g, '\\$')}\\s*\\(`);
  for (const m of compiled.matchAll(/code:\s*"((?:[^"\\]|\\.)*)"/g)) if (call.test(m[1])) return true;
  return false;
}

/** Funções do app chamadas por worklets de `file` sem a marca 'worklet'. */
function offenders(file: string, code: string): string[] {
  const bad: string[] = [];
  const compiled = compile(code, file);
  for (const name of captured(compiled)) {
    if (!calledInWorklet(compiled, name)) continue;
    const local = kindIn(code, name);
    if (local === 'worklet') continue;
    if (local === 'plain-function') {
      bad.push(name);
      continue;
    }
    const imp = new RegExp(`import\\s*(?:type\\s*)?\\{[^}]*\\b${name}\\b[^}]*\\}\\s*from\\s*['"](\\.[^'"]*)['"]`).exec(code);
    if (!imp) continue; // variável local, valor compartilhado ou símbolo de pacote
    const target = resolveRelative(file, imp[1]);
    if (target && kindIn(fs.readFileSync(target, 'utf8'), name) === 'plain-function') bad.push(`${name} (de ${path.relative(SRC, target)})`);
  }
  return bad;
}

describe('worklets', () => {
  it('a auditoria enxerga o erro: função comum dentro de um estilo animado é reprovada', () => {
    const bad = `
      import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
      function width() { return 320; }
      export function Box() {
        const x = useSharedValue(0);
        const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * width() }] }));
        return <Animated.View style={style} />;
      }`;
    // O plugin lê o arquivo do disco: a sonda mora numa pasta temporária.
    const probe = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'qf-worklet-')), 'Probe.tsx');
    const check = (code: string) => {
      fs.writeFileSync(probe, code);
      return offenders(probe, code);
    };
    expect(check(bad)).toEqual(['width']);
    expect(check(bad.replace('function width() { return 320; }', "function width() { 'worklet'; return 320; }"))).toEqual([]);
    expect(check(bad.replace('function width() { return 320; }', 'const w = 320;').replace('width()', 'w'))).toEqual([]);
    // Entregar a função para rodar no thread do React é permitido; chamá-la direto, não.
    const handoff = bad.replace("import Animated,", "import { scheduleOnRN } from 'react-native-worklets';\n      import Animated,").replace('x.value * width()', '(scheduleOnRN(width), x.value)');
    expect(check(handoff)).toEqual([]);
  });

  it('nenhum worklet do app captura uma função sem a marca', () => {
    const files = walk(SRC).filter((f) => HINT.test(fs.readFileSync(f, 'utf8')));
    expect(files.length).toBeGreaterThan(10);
    const report: Record<string, string[]> = {};
    let closures = 0;
    for (const file of files) {
      const code = fs.readFileSync(file, 'utf8');
      closures += captured(compile(code, file)).size;
      const bad = offenders(file, code);
      if (bad.length) report[path.relative(SRC, file)] = bad;
    }
    expect(closures).toBeGreaterThan(50); // a compilação está mesmo gerando worklets
    expect(report).toEqual({});
  }, 120_000);
});
