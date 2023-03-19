import { createCommand, Option } from 'commander';

import { getNymphInstance } from '../app/build/nymph/nymph.js';

async function list({
  sort,
  reverse,
  limit,
  offset,
}: {
  sort: 'cdate' | 'mdate' | 'username';
  reverse: boolean;
  limit?: number;
  offset?: number;
}) {
  const { nymph, User } = getNymphInstance();

  const users = await nymph.getEntities({
    class: User,
    skipAc: true,
    sort: sort === 'username' ? 'cdate' : sort,
    reverse,
    ...(limit != null && !isNaN(limit) ? { limit } : {}),
    ...(offset != null && !isNaN(offset) ? { offset } : {}),
  });

  if (sort === 'username') {
    users.sort((a, b) => a.username?.localeCompare(b.username ?? '') ?? 0);
  }

  console.log(
    JSON.stringify(
      users.map((user) => user.username),
      null,
      2
    )
  );
  process.exit(0);
}

async function info(username: string) {
  const { User } = getNymphInstance();

  const user = await User.factoryUsername(username);

  if (!user.guid) {
    console.error('User not found.');
    process.exit(1);
  }

  const info = user.$getValidatable();
  console.log(JSON.stringify(info, null, 2));
  process.exit(0);
}

async function groups(username: string) {
  const { User } = getNymphInstance();

  const user = await User.factoryUsername(username);

  if (!user.guid) {
    console.error('User not found.');
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        Primary: user.group?.groupname,
        Secondary: user.groups?.map((group) => group.groupname),
      },
      null,
      2
    )
  );
  process.exit(0);
}

async function setPrimaryGroup(username: string, groupname: string) {
  const { User, Group } = getNymphInstance();

  const user = await User.factoryUsername(username);

  if (!user.guid) {
    console.error('User not found.');
    process.exit(1);
  }

  const group = await Group.factoryGroupname(groupname);

  if (!group.guid) {
    console.error('Group not found.');
    process.exit(1);
  }

  user.group = group;

  if (await user.$saveSkipAC()) {
    console.log('User primary group set.');
    process.exit(0);
  } else {
    console.error("Couldn't save user.");
    process.exit(1);
  }
}

async function addSecondaryGroup(username: string, groupname: string) {
  const { User, Group } = getNymphInstance();

  const user = await User.factoryUsername(username);

  if (!user.guid) {
    console.error('User not found.');
    process.exit(1);
  }

  const group = await Group.factoryGroupname(groupname);

  if (!group.guid) {
    console.error('Group not found.');
    process.exit(1);
  }

  user.$addGroup(group);

  if (await user.$saveSkipAC()) {
    console.log('User added to secondary group.');
    process.exit(0);
  } else {
    console.error("Couldn't save user.");
    process.exit(1);
  }
}

async function removeSecondaryGroup(username: string, groupname: string) {
  const { User, Group } = getNymphInstance();

  const user = await User.factoryUsername(username);

  if (!user.guid) {
    console.error('User not found.');
    process.exit(1);
  }

  const group = await Group.factoryGroupname(groupname);

  if (!group.guid) {
    console.error('Group not found.');
    process.exit(1);
  }

  user.$delGroup(group);

  if (await user.$saveSkipAC()) {
    console.log('User removed from secondary group.');
    process.exit(0);
  } else {
    console.error("Couldn't save user.");
    process.exit(1);
  }
}

async function abilities(username: string) {
  const { User } = getNymphInstance();

  const user = await User.factoryUsername(username);

  if (!user.guid) {
    console.error('User not found.');
    process.exit(1);
  }

  let abilities = {
    'Directly Granted': user.abilities ?? [],
    'Inherited from Primary Group': user.inheritAbilities
      ? user.group?.enabled
        ? user.group.abilities ?? []
        : []
      : '(user does not inherit abilities)',
    'Inherited from Secondary Groups': user.inheritAbilities
      ? (() => {
          let abilities: string[] = [];
          for (let curGroup of user.groups ?? []) {
            if (curGroup.enabled) {
              abilities = abilities.concat(curGroup.abilities ?? []);
            }
          }
          return abilities;
        })()
      : '(user does not inherit abilities)',
  };

  console.log(JSON.stringify(abilities, null, 2));
  process.exit(0);
}

async function grant(username: string, ability: string) {
  const { User } = getNymphInstance();

  const user = await User.factoryUsername(username);

  if (!user.guid) {
    console.error('User not found.');
    process.exit(1);
  }

  user.$grant(ability);

  if (await user.$saveSkipAC()) {
    console.log('Ability granted.');
    process.exit(0);
  } else {
    console.error("Couldn't save user.");
    process.exit(1);
  }
}

async function revoke(username: string, ability: string) {
  const { User } = getNymphInstance();

  const user = await User.factoryUsername(username);

  if (!user.guid) {
    console.error('User not found.');
    process.exit(1);
  }

  user.$revoke(ability);

  if (await user.$saveSkipAC()) {
    console.log('Ability revoked.');
    process.exit(0);
  } else {
    console.error("Couldn't save user.");
    process.exit(1);
  }
}

async function enable(username: string) {
  const { User } = getNymphInstance();

  const user = await User.factoryUsername(username);

  if (!user.guid) {
    console.error('User not found.');
    process.exit(1);
  }

  user.enabled = true;

  if (await user.$saveSkipAC()) {
    console.log('User enabled.');
    process.exit(0);
  } else {
    console.error("Couldn't save user.");
    process.exit(1);
  }
}

async function disable(username: string) {
  const { User } = getNymphInstance();

  const user = await User.factoryUsername(username);

  if (!user.guid) {
    console.error('User not found.');
    process.exit(1);
  }

  user.enabled = false;

  if (await user.$saveSkipAC()) {
    console.log('User disabled.');
    process.exit(0);
  } else {
    console.error("Couldn't save user.");
    process.exit(1);
  }
}

async function gatekeeper(username: string, ability: string) {
  const { User } = getNymphInstance();

  const user = await User.factoryUsername(username);

  if (!user.guid) {
    console.error('User not found.');
    process.exit(1);
  }

  console.log(JSON.stringify(user.$gatekeeper(ability)));
  process.exit(0);
}

const userCommand = createCommand();
userCommand.name('user').description('Manage users.');

userCommand
  .command('list')
  .description('List all users.')
  .addOption(
    new Option('-s, --sort <sort>', 'sort value')
      .choices(['cdate', 'mdate', 'username'])
      .default('cdate')
  )
  .option('--reverse', 'reverse sort', false)
  .addOption(
    new Option('-l, --limit <number>', 'limit returned users').argParser(
      parseInt
    )
  )
  .addOption(
    new Option('-o, --offset <number>', 'offset returned users').argParser(
      parseInt
    )
  )
  .action(list);

userCommand
  .command('info')
  .description('Get information about a user.')
  .argument('<username>', "the user's username")
  .action(info);

userCommand
  .command('groups')
  .description("Get a list of all the user's groups.")
  .argument('<username>', "the user's username")
  .action(groups);

userCommand
  .command('set-primary-group')
  .description("Set a user's primary group.")
  .argument('<username>', "the user's username")
  .argument('<groupname>', "the group's groupname")
  .action(setPrimaryGroup);

userCommand
  .command('add-secondary-group')
  .description('Add the user to a secondary group.')
  .argument('<username>', "the user's username")
  .argument('<groupname>', "the group's groupname")
  .action(addSecondaryGroup);

userCommand
  .command('remove-secondary-group')
  .description('Remove the user from a secondary group.')
  .argument('<username>', "the user's username")
  .argument('<groupname>', "the group's groupname")
  .action(removeSecondaryGroup);

userCommand
  .command('abilities')
  .description(
    "Get a list of all the user's abilities, including inherited abilities."
  )
  .argument('<username>', "the user's username")
  .action(abilities);

userCommand
  .command('grant')
  .description('Grant an ability to a user.')
  .argument('<username>', "the user's username")
  .argument('<ability>', 'the ability to grant')
  .action(grant);

userCommand
  .command('revoke')
  .description('Revoke an ability from a user.')
  .argument('<username>', "the user's username")
  .argument('<ability>', 'the ability to revoke')
  .action(revoke);

userCommand
  .command('enable')
  .description('Enable a user.')
  .argument('<username>', "the user's username")
  .action(enable);

userCommand
  .command('disable')
  .description('Disable a user.')
  .argument('<username>', "the user's username")
  .action(disable);

userCommand
  .command('gatekeeper')
  .description('Check if a user has an ability.')
  .argument('<username>', "the user's username")
  .argument('<ability>', 'the ability')
  .action(gatekeeper);

export { userCommand };
