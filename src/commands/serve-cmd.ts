import { spawn } from 'node:child_process';
import type { Command } from 'commander';
import { startServer } from '../server/server.js';
import { log } from '../util/logger.js';

export function registerServeCommand(program: Command): void {
  program
    .command('serve')
    .description('Launch the leadjet web app in your browser (no commands needed)')
    .option('-p, --port <n>', 'port to listen on', '4317')
    .option('--host <host>', 'host to bind', '127.0.0.1')
    .option('--no-open', 'do not open the browser automatically')
    .action((options: { port: string; host: string; open: boolean }) => {
      const port = Number.parseInt(options.port, 10) || 4317;
      const host = options.host || '127.0.0.1';
      startServer(port, host);
      const link = `http://${host}:${port}`;
      log.success(`leadjet is running at ${log.bold(link)}`);
      log.info(log.dim('Press Ctrl+C to stop.'));
      if (options.open !== false) openBrowser(link);
    });
}

function openBrowser(url: string): void {
  const platform = process.platform;
  const cmd = platform === 'win32' ? 'cmd' : platform === 'darwin' ? 'open' : 'xdg-open';
  const args = platform === 'win32' ? ['/c', 'start', '', url] : [url];
  try {
    spawn(cmd, args, { detached: true, stdio: 'ignore' }).unref();
  } catch {
    /* the link is printed anyway */
  }
}
