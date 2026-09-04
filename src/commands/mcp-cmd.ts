import type { Command } from 'commander';
import { runMcp } from '../core/mcp.js';

export function registerMcpCommand(program: Command): void {
  program
    .command('mcp')
    .description('Run the leadjet MCP server (stdio) so AI agents can drive it')
    .action(async () => {
      await runMcp();
    });
}
