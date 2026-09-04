import type { Command } from 'commander';
import { DEFAULT_WEB_URL, me } from '../core/cli-link.js';
import { loadConfig } from '../core/config.js';
import { log } from '../util/logger.js';

export function registerStatusCommand(program: Command): void {
  program
    .command('status')
    .description('Show whether this CLI is linked to your leadjet-web account')
    .action(async () => {
      const c = loadConfig();
      const webUrl = (c.webUrl ?? DEFAULT_WEB_URL).replace(/\/+$/, '');
      log.info(`Web:    ${log.bold(webUrl)}`);
      log.info(`Places: ${c.placesKey ? 'key set' : log.dim('no key (OpenStreetMap is free)')}`);
      if (!c.linkToken) {
        log.info(`Link:   ${log.dim('not linked')} — run ${log.bold('leadjet link')}`);
        return;
      }
      const info = await me(webUrl, c.linkToken);
      if (!info) {
        log.error(`Link:   invalid or expired — run ${log.bold('leadjet link')}`);
        process.exitCode = 1;
        return;
      }
      log.success(`Link:   linked as ${log.bold(info.email)}`);
      if (info.expiresAt)
        log.info(log.dim(`        valid until ${new Date(info.expiresAt).toLocaleString()}`));
    });
}
