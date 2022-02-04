#!/usr/bin/env node

import fs from 'fs'
import chalk from 'chalk'
import { createSpinner } from 'nanospinner'
import yargs from 'yargs';
import { exec } from 'child_process';
import { getPackageJson, getReadme, getTsconfig, getGitInit } from './boilerplate/initFiles.js';

const greeting = chalk.blue.bold("ZilloJs version 0.1.0");
console.log(greeting);

const createFolderStructure = async (name, location, ts = false) => {
  const folderStructure = {
    "src": ["core", "models", "views", "templates"],
    "test": ["models", "views"],
    "types": [],
    "public": [],
  }
  // create folders based on folder structure
  for (const folder in folderStructure) {
    const path = location + '/' + folder + '/';
    if (folder === 'types' && !ts) {
      continue;
    }
    fs.mkdirSync(path, { recursive: true });
    folderStructure[folder].forEach(file => {
      fs.mkdirSync(path + '/' + file);
    })
  }
}

const generateInitFiles = async (name, location, ts = false) => {
  const packageJson = getPackageJson(name, ts);
  fs.writeFileSync(location + '/package.json', JSON.stringify(packageJson, null, 2));
  if (ts) {
    const tsconfig = getTsconfig(name);
    fs.writeFileSync(location + '/tsconfig.json', JSON.stringify(tsconfig, null, 2));
  }
  fs.writeFileSync(location + '/README.md', getReadme(name));
  fs.writeFileSync(location + '/.gitignore', getGitInit());
}

const handelInitCommand = async (args) => {
  if (args.name === undefined) {
    console.error(chalk.red.bold("Project name is required"));
    process.exit(1);
  }
  if (args.location === '.') {
    console.warn(chalk.yellow.bold("Project location is current directory"));
  }
  const typescript = args.typeScript
  // Create folder structure
  const spinner = createSpinner('creating a project at ' + args.location + ' ' + '\n').start()
  createFolderStructure(args.name, args.location, typescript).then(() => {
    spinner.success({ text: chalk.green.bold("Project folders created successfully") })
  }).catch(err => {
    spinner.error({ text: chalk.red.bold(err) })
    process.exit(1);
  }).finally(() => {
    // Create package.json
    const spinner2 = createSpinner('creating package.json ' + '\n').start()
    generateInitFiles(args.name, args.location, typescript).then(() => {
      spinner2.success({ text: chalk.green.bold("package.json created successfully") })
      if (typescript) {
        spinner2.success({ text: chalk.green.bold("tsconfig.json created successfully") })
      }
    }).catch(err => {
      spinner2.error({ text: chalk.red.bold(err) })
      process.exit(1);
    }).finally(() => {
      // TODO: add npm install command
      // TODO: set up boilerplate codes
      // TODO: add git init command
    })
  })
}

const options = yargs(process.argv.slice(2))
  .command({
    command: 'init <name> <location> [options]',
    describe: 'initialize the project',
    builder: (yargs) => {
      return yargs.positional('name', {
        describe: 'project name',
        type: 'string',
      })
        .positional('location', {
          describe: 'project location',
          type: 'string',
          default: '.',
        })
        .option('t', {
          alias: 'type-script',
          describe: 'use typescript',
          type: 'boolean',
          default: false,
        })
        .option("e", {
          alias: "no-name",
          describe: "create a project with no name",
          type: "boolean"
        })
    },
    handler: handelInitCommand,
  })
  .usage('Usage: zillojs <command> [options]')
  .option("h", { alias: "help", describe: "show help", type: "boolean" })
  .parse();

if (options.help) {
  console.log(options);
}
