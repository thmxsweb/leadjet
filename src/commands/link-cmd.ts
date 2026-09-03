import { spawn } from 'node:child_process';
import { hostname } from 'node:os';
import type { Command } from 'commander';
import { DEFAULT_WEB_URL, pollToken, startLink } from '../core/cli-link.js';
import { loadConfig, saveConfig } from '../core/config.js';
import { log } from '../util/logger.js';

export function registerLinkCommand(program: Command): void {
  program
    .command('link')
    .description('Link this CLI to your leadjet-web account (valid 7 days)')
    .option('--web <url>', 'leadjet-web base URL (Vercel in prod)')
    .action(async (options: { web?: string }) => {
      const config = loadConfig();
      const webUrl = (options.web ?? config.webUrl ?? DEFAULT_WEB_URL).replace(/\/+$/, '');
      try {
        log.info(`Linking to ${log.bold(webUrl)} …`);
        const { code, deviceSecret, verifyUrl } = await startLink(webUrl, hostname());
        log.info(`Approve this device (code ${log.bold(code)}):`);
        log.info(log.bold(verifyUrl));
        openUrl(verifyUrl);
        log.info(log.dim('Waiting for approval in your browser …'));
        const { token, expiresAt } = await pollToken(webUrl, code, deviceSecret);
        saveConfig({ ...loadConfig(), webUrl, linkToken: token, linkTokenExpires: expiresAt });
        const until = expiresAt ? new Date(expiresAt).toLocaleString() : '7 days';
        log.success(`Linked. Token valid until ${until}.`);
        log.info(`Now push leads: ${log.bold('leadjet leads "restaurants" --city Lyon --push')}`);
      } catch (err) {
        log.error(err instanceof Error ? err.message : String(err));
        process.exitCode = 1;
      }
    });
}

function openUrl(url: string): void {
  const platform = process.platform;
  const cmd = platform === 'win32' ? 'cmd' : platform === 'darwin' ? 'open' : 'xdg-open';
  const args = platform === 'win32' ? ['/c', 'start', '', url] : [url];
  try {
    spawn(cmd, args, { detached: true, stdio: 'ignore' }).unref();
  } catch {
    /* the URL is printed anyway */
  }
}
