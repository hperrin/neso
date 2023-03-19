import { createCommand, Option } from 'commander';

import { getNymphInstance } from '../app/build/nymph/nymph.js';

async function list({
  sort,
  reverse,
  limit,
  offset,
}: {
  sort: 'cdate' | 'mdate' | 'groupname';
  reverse: boolean;
  limit?: number;
  offset?: number;
}) {
  const { nymph, Group } = getNymphInstance();

  const groups = await nymph.getEntities({
    class: Group,
    skipAc: true,
    sort: sort === 'groupname' ? 'cdate' : sort,
    reverse,
    ...(limit != null && !isNaN(limit) ? { limit } : {}),
    ...(offset != null && !isNaN(offset) ? { offset } : {}),
  });

  if (sort === 'groupname') {
    groups.sort((a, b) => a.groupname?.localeCompare(b.groupname ?? '') ?? 0);
  }

  console.log(
    JSON.stringify(
      groups.map((group) => group.groupname),
      null,
      2
    )
  );
  process.exit(0);
}

async function info(groupname: string) {
  const { Group } = getNymphInstance();

  const group = await Group.factoryGroupname(groupname);

  if (!group.guid) {
    console.error('Group not found.');
    process.exit(1);
  }

  const info = group.$getValidatable();
  console.log(JSON.stringify(info, null, 2));
  process.exit(0);
}

async function users(groupname: string) {
  const { nymph, User, Group } = getNymphInstance();

  const group = await Group.factoryGroupname(groupname);

  if (!group.guid) {
    console.error('Group not found.');
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        Primary: (
          await nymph.getEntities(
            { class: User, skipAc: true },
            { type: '&', ref: ['group', group] }
          )
        ).map((user) => user.username),
        Secondary: (
          await nymph.getEntities(
            { class: User, skipAc: true },
            { type: '&', ref: ['groups', group] }
          )
        ).map((user) => user.username),
      },
      null,
      2
    )
  );
  process.exit(0);
}

async function abilities(groupname: string) {
  const { Group } = getNymphInstance();

  const group = await Group.factoryGroupname(groupname);

  if (!group.guid) {
    console.error('Group not found.');
    process.exit(1);
  }

  console.log(JSON.stringify(group.abilities ?? [], null, 2));
  process.exit(0);
}

async function grant(groupname: string, ability: string) {
  const { Group } = getNymphInstance();

  const group = await Group.factoryGroupname(groupname);

  if (!group.guid) {
    console.error('Group not found.');
    process.exit(1);
  }

  group.$grant(ability);

  if (await group.$saveSkipAC()) {
    console.log('Ability granted.');
    process.exit(0);
  } else {
    console.error("Couldn't save group.");
    process.exit(1);
  }
}

async function revoke(groupname: string, ability: string) {
  const { Group } = getNymphInstance();

  const group = await Group.factoryGroupname(groupname);

  if (!group.guid) {
    console.error('Group not found.');
    process.exit(1);
  }

  group.$revoke(ability);

  if (await group.$saveSkipAC()) {
    console.log('Ability revoked.');
    process.exit(0);
  } else {
    console.error("Couldn't save group.");
    process.exit(1);
  }
}

async function enable(groupname: string) {
  const { Group } = getNymphInstance();

  const group = await Group.factoryGroupname(groupname);

  if (!group.guid) {
    console.error('Group not found.');
    process.exit(1);
  }

  group.enabled = true;

  if (await group.$saveSkipAC()) {
    console.log('Group enabled.');
    process.exit(0);
  } else {
    console.error("Couldn't save group.");
    process.exit(1);
  }
}

async function disable(groupname: string) {
  const { Group } = getNymphInstance();

  const group = await Group.factoryGroupname(groupname);

  if (!group.guid) {
    console.error('Group not found.');
    process.exit(1);
  }

  group.enabled = false;

  if (await group.$saveSkipAC()) {
    console.log('Group disabled.');
    process.exit(0);
  } else {
    console.error("Couldn't save group.");
    process.exit(1);
  }
}

const groupCommand = createCommand();
groupCommand.name('group').description('Manage groups.');

groupCommand
  .command('list')
  .description('List all groups.')
  .addOption(
    new Option('-s, --sort <sort>', 'sort value')
      .choices(['cdate', 'mdate', 'groupname'])
      .default('cdate')
  )
  .option('--reverse', 'reverse sort', false)
  .addOption(
    new Option('-l, --limit <number>', 'limit returned groups').argParser(
      parseInt
    )
  )
  .addOption(
    new Option('-o, --offset <number>', 'offset returned groups').argParser(
      parseInt
    )
  )
  .action(list);

groupCommand
  .command('info')
  .description('Get information about a group.')
  .argument('<groupname>', "the group's groupname")
  .action(info);

groupCommand
  .command('users')
  .description("Get a list of all the group's users.")
  .argument('<groupname>', "the group's groupname")
  .action(users);

groupCommand
  .command('abilities')
  .description(
    "Get a list of all the group's abilities, including inherited abilities."
  )
  .argument('<groupname>', "the group's groupname")
  .action(abilities);

groupCommand
  .command('grant')
  .description('Grant an ability to a group.')
  .argument('<groupname>', "the group's groupname")
  .argument('<ability>', 'the ability to grant')
  .action(grant);

groupCommand
  .command('revoke')
  .description('Revoke an ability from a group.')
  .argument('<groupname>', "the group's groupname")
  .argument('<ability>', 'the ability to revoke')
  .action(revoke);

groupCommand
  .command('enable')
  .description('Enable a group.')
  .argument('<groupname>', "the group's groupname")
  .action(enable);

groupCommand
  .command('disable')
  .description('Disable a group.')
  .argument('<groupname>', "the group's groupname")
  .action(disable);

export { groupCommand };
