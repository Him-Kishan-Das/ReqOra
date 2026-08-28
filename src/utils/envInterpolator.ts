import type { EnvironmentVariable } from '../types/api';

export function interpolateVariables(
  text: string,
  variables: EnvironmentVariable[]
): string {
  if (!text) return '';
  let result = text;
  
  variables.forEach((v) => {
    if (v.enabled && v.key.trim() !== '') {
      const regex = new RegExp(`{{\\s*${escapeRegExp(v.key.trim())}\\s*}}`, 'g');
      result = result.replace(regex, v.value);
    }
  });

  return result;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
