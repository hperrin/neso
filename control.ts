import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { program } from 'commander';

import './control-env.js';

import { userCommand } from './commands/user.js';
import { groupCommand } from './commands/group.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pkg = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'package.json')).toString()
);

program
  .name(pkg.name)
  .description(`CLI for ${pkg.name} - ${pkg.description}`)
  .version(pkg.version, '-v');

program.addCommand(userCommand);
program.addCommand(groupCommand);

async function main() {
  program.parseAsync();
}

main();
