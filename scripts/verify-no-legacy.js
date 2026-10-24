#!/usr/bin/env node
/**
 * Garante que a ferramenta de migração única NÃO está no bundle de produção.
 *
 * Gera o bundle Android exatamente como o perfil `production` (EXPO_PUBLIC_LEGACY_MIGRATION=0), com o
 * cache do Metro limpo (a chave de cache do Metro NÃO considera variáveis EXPO_PUBLIC_*: sem `--clear`,
 * um bundle antigo feito com a flag ligada poderia ser reaproveitado), e procura as assinaturas da
 * ferramenta. Sai com código 1 se encontrar qualquer uma.
 *
 *   node scripts/verify-no-legacy.js            # verifica o bundle de produção
 *   node scripts/verify-no-legacy.js --self-test  # prova que a verificação detecta a ferramenta (bundle com a flag ligada)
 */
const { spawnSync } = require('child_process');
const { mkdtempSync, readdirSync, readFileSync, rmSync } = require('fs');
const { tmpdir } = require('os');
const { join } = require('path');

const SIGNATURES = [
  'QF_LEGACY_MIGRATION_TOOL_V1',
  'Ferramenta do desenvolvedor',
  'Associar o progresso antigo',
  'fingerprint-changed',
  'questforge-backup-legado',
];

function bundleWith(flag) {
  const out = mkdtempSync(join(tmpdir(), 'qf-bundle-'));
  const r = spawnSync('npx', ['expo', 'export', '--platform', 'android', '--no-bytecode', '--clear', '--output-dir', out], {
    stdio: ['ignore', 'inherit', 'inherit'],
    env: { ...process.env, EXPO_PUBLIC_LEGACY_MIGRATION: flag },
  });
  if (r.status !== 0) throw new Error('Falha ao gerar o bundle.');
  const dir = join(out, '_expo', 'static', 'js', 'android');
  const text = readdirSync(dir)
    .filter((f) => f.endsWith('.js'))
    .map((f) => readFileSync(join(dir, f), 'utf8'))
    .join('\n');
  rmSync(out, { recursive: true, force: true });
  return text;
}

const selfTest = process.argv.includes('--self-test');
const text = bundleWith(selfTest ? '1' : '0');
const found = SIGNATURES.filter((s) => text.includes(s));

if (selfTest) {
  if (found.length !== SIGNATURES.length) {
    console.error(`AUTO-TESTE FALHOU: a verificação só viu ${found.length}/${SIGNATURES.length} assinaturas no bundle COM a ferramenta.`);
    process.exit(1);
  }
  console.log('Auto-teste OK: a verificação detecta a ferramenta quando ela está presente.');
} else if (found.length > 0) {
  console.error(`FALHOU: a ferramenta de migração vazou para o bundle de produção (${found.join(', ')}).`);
  process.exit(1);
} else {
  console.log(`OK: nenhuma das ${SIGNATURES.length} assinaturas da migração única está no bundle de produção.`);
}
