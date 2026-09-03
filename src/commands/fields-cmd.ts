import type { Command } from 'commander';
import { DEFAULT_FIELDS, FIELDS } from '../core/fields.js';
import { log } from '../util/logger.js';

export function registerFieldsCommand(program: Command): void {
  program
    .command('fields')
    .description('List every field you can export')
    .action(() => {
      const width = Math.max(...FIELDS.map((f) => f.name.length));
      for (const field of FIELDS) {
        const isDefault = DEFAULT_FIELDS.includes(field.name);
        const name = field.name.padEnd(width);
        process.stdout.write(
          `  ${log.bold(name)}  ${field.description}${isDefault ? log.dim('  (default)') : ''}\n`,
        );
      }
      process.stderr.write(`\nDefault: ${DEFAULT_FIELDS.join(', ')}\n`);
      process.stderr.write(
        log.dim('Choose fields with --fields, e.g. --fields name,phone,website\n'),
      );
    });
}
