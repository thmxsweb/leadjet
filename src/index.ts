import { Command } from 'commander';
import { registerConfigCommand } from './commands/config-cmd.js';
import { registerContactsCommand } from './commands/contacts-cmd.js';
import { registerFieldsCommand } from './commands/fields-cmd.js';
import { registerFindCommand } from './commands/find-cmd.js';
import { registerLeadsCommand } from './commands/leads-cmd.js';
import { registerLinkCommand } from './commands/link-cmd.js';
import { registerStatusCommand } from './commands/status-cmd.js';
import { VERSION } from './version.js';

const program = new Command();

program
  .name('leadjet')
  .description(
    'leadjet — find, enrich and score local business leads, then push them to your leadjet-web account.',
  )
  .version(VERSION, '-v, --version', 'print the version')
  .showHelpAfterError()
  .addHelpText(
    'after',
    '\nQuick start:\n' +
      '  $ leadjet link                                    link this CLI to your account\n' +
      '  $ leadjet leads "restaurants" --city Lyon --push  find, enrich, score & push\n' +
      '  $ leadjet status                                  show your link\n',
  );

registerLinkCommand(program);
registerStatusCommand(program);
registerLeadsCommand(program);
registerFindCommand(program);
registerContactsCommand(program);
registerFieldsCommand(program);
registerConfigCommand(program);

program.parseAsync(process.argv).catch((err: unknown) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exitCode = 1;
});
