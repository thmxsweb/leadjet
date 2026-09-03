import pc from 'picocolors';

/** Tiny, consistent console output. Diagnostics go to stderr so stdout stays
 * clean for piping exported data. */
export const log = {
  info(msg: string): void {
    process.stderr.write(`${msg}\n`);
  },
  success(msg: string): void {
    process.stderr.write(`${pc.green('✓')} ${msg}\n`);
  },
  warn(msg: string): void {
    process.stderr.write(`${pc.yellow('!')} ${msg}\n`);
  },
  error(msg: string): void {
    process.stderr.write(`${pc.red('✗')} ${msg}\n`);
  },
  dim(msg: string): string {
    return pc.dim(msg);
  },
  bold(msg: string): string {
    return pc.bold(msg);
  },
};
