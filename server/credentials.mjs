import {readFileSync} from 'node:fs';
import {homedir} from 'node:os';
import {join} from 'node:path';
export const configDir = () => process.env.JEVRIEL_CONFIG_DIR || join(homedir(),'.config','jevriel');
export const credentialFile = () => join(configDir(),'credentials.json');
export function getKey() {
  if (process.env.TYPESAFE_API_KEY?.trim()) return process.env.TYPESAFE_API_KEY.trim();
  try { const key=JSON.parse(readFileSync(credentialFile(),'utf8')).api_key; return typeof key === 'string' ? key.trim() : ''; } catch {return '';}
}
