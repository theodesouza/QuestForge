export type MathPart = string | { numerator: string; denominator: string };

/** Só diagrama frações numéricas explícitas; não calcula nem interpreta a expressão. */
export function mathParts(line: string): MathPart[] {
  const parts: MathPart[] = [];
  const fraction = /[−-]?\d+(?:\.\d{3})*(?:,\d+)?\/[−-]?\d+(?:\.\d{3})*(?:,\d+)?/g;
  const adjacent = /[\p{L}\p{N}.,/⁻⁺]/u;
  let start = 0;
  for (const match of line.matchAll(fraction)) {
    const index = match.index;
    const end = index + match[0].length;
    if (adjacent.test(line[index - 1] ?? '') || adjacent.test(line[end] ?? '')) continue;
    parts.push(...line.slice(start, index).trim().split(/\s+/).filter(Boolean));
    const [numerator, denominator] = match[0].split('/');
    parts.push({ numerator, denominator });
    start = end;
  }
  parts.push(...line.slice(start).trim().split(/\s+/).filter(Boolean));
  return parts;
}
