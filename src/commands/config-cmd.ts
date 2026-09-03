import type { Command } from 'commander';
import {
  CONFIG_KEYS,
  configFile,
  type Config,
  type ConfigKey,
  isConfigKey,
  loadConfig,
  redactConfig,
  saveConfig,
  setConfigValue,
} from '../core/config.js';
import { log } from '../util/logger.js';

const KEY_TO_PROP: Record<ConfigKey, keyof Config> = {
  'places-key': 'placesKey',
  fields: 'fields',
  format: 'format',
  country: 'country',
  region: 'region',
  city: 'city',
  source: 'source',
  language: 'language',
  proxies: 'proxies',
  'jump-email': 'jumpEmail',
  'jump-password': 'jumpPassword',
  'web-url': 'webUrl',
};

export function registerConfigCommand(program: Command): void {
  const config = program
    .command('config')
    .description('Manage saved settings (API key, default fields, region, ...)');

  config
    .command('set <key> <value>')
    .description(`Set a config value. Keys: ${CONFIG_KEYS.join(', ')}`)
    .action((key: string, value: string) => {
      if (!isConfigKey(key)) {
        log.error(`Unknown key "${key}". Valid keys: ${CONFIG_KEYS.join(', ')}`);
        process.exitCode = 1;
        return;
      }
      saveConfig(setConfigValue(loadConfig(), key, value));
      log.success(`Saved ${log.bold(key)}.`);
    });

  config
    .command('get <key>')
    .description('Print a single config value')
    .action((key: string) => {
      if (!isConfigKey(key)) {
        log.error(`Unknown key "${key}". Valid keys: ${CONFIG_KEYS.join(', ')}`);
        process.exitCode = 1;
        return;
      }
      const value = redactConfig(loadConfig())[KEY_TO_PROP[key]];
      if (value === undefined) {
        log.info(log.dim('(not set)'));
        return;
      }
      process.stdout.write(`${Array.isArray(value) ? value.join(',') : String(value)}\n`);
    });

  config
    .command('list')
    .description('Show all saved settings (the API key is masked)')
    .action(() => {
      process.stdout.write(`${JSON.stringify(redactConfig(loadConfig()), null, 2)}\n`);
    });

  config
    .command('path')
    .description('Print the path to the config file')
    .action(() => {
      process.stdout.write(`${configFile()}\n`);
    });
}
