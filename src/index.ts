import { Command } from 'commander';
import { registerConfigCommand } from './commands/config-cmd.js';
import { registerContactsCommand } from './commands/contacts-cmd.js';
import { registerFieldsCommand } from './commands/fields-cmd.js';
import { registerFindCommand } from './commands/find-cmd.js';
import { VERSION } from './version.js';

const program = new Command();

program
  .name('leadjet')
  .description('Find business leads from Google Places and export the fields you want.')
  .version(VERSION, '-v, --version', 'print the version')
  .showHelpAfterError();

registerFindCommand(program);
registerContactsCommand(program);
registerFieldsCommand(program);
registerConfigCommand(program);

program.parseAsync(process.argv).catch((err: unknown) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exitCode = 1;
});
