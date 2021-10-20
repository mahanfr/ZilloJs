#! /usr/bin/env node

import fs from 'fs'

var args = process.argv.slice(2)

// levenshtein Distance to find misspells while entering commands 
const levenshteinDistance = (str1 = '', str2 = '') => {
  const track = Array(str2.length + 1).fill(null).map(() =>
  Array(str1.length + 1).fill(null));
  for (var i = 0; i <= str1.length; i += 1) {
     track[0][i] = i;
  }
  for (var j = 0; j <= str2.length; j += 1) {
     track[j][0] = j;
  }
  for (var j = 1; j <= str2.length; j += 1) {
     for (var i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
           track[j][i - 1] + 1, // deletion
           track[j - 1][i] + 1, // insertion
           track[j - 1][i - 1] + indicator, // substitution
        );
     }
  }
  return track[str2.length][str1.length];
};

// Visible code for help command
const helpMessage =
`\x1b[33m 
usage: Zillojs command [options] required_input required_input2 \x1b[0m
\x1b[34m commands: \x1b[0m 
      help, h                       Show help for all commands and options
      init [Project name]           Create project and add necessary files
\x1b[34m options: \x1b[0m 
      -v, --version                 Show the current version of the framework
      -h, --help                    Show help for a command
`

class ProjectGenerator{

  setName(name){
    const regex = new RegExp('^[a-zA-Z][a-zA-Z_0-9]*$')
    if(!regex.test(args[0])){
      console.error('Project names must include [a-zA-z0-9_]')
      process.exit(1)
    }
    this.name = name
  }

  setDir(dir='.'){
    this.dir = dir
  }

  createFolder(dir){
    if(dir === '.'){
      console.warn('\x1b[33m','⚠  No Directory Created!')
      return
    }
    try {
      if (!fs.existsSync(dir+'/'+this.name)){
        fs.mkdirSync(dir+'/'+this.name, { recursive: true });
      }
      console.info('\x1b[32m','✔  Project Directory Created!')
    } catch (error) {
      console.error('\x1b[31m',error)
      process.exit(1)
    }
  }

  generate(){
    this.createFolder(this.dir)
  }

}

// List of all subcommands and their functions
var subcommands = {
  'help': () => {
    console.info(helpMessage)
  },
  'init': (args) => {
    if(args.length < 1 ||args[0].startsWith('-') || args[0].startsWith('-')){
      // Do Option
    }else{
      const projectGenerator = new ProjectGenerator();
      projectGenerator.setName(args[0])
      try {
        projectGenerator.setDir(args[1])
      } catch (error) {
        projectGenerator.setDir()
      }
      projectGenerator.generate();
    }
  },
}

// Check for sub commands. set it to help if non exist
var subcommand = ''
try {
  subcommand = args[0]
} catch (error) {
  subcommand = 'help'
}

// Search for each command if exists execute
// if close show the right command and exit with error if no match
const keys = Object.keys(subcommands)
for(var i = 0; i < keys.length; i++){
  const distance = levenshteinDistance(subcommand ,keys[i])
  if(distance === 0){
    subcommands[subcommand](args.slice(1))
    process.exit(0)
  }else if(distance < 3){
    console.error('Command has no reference to execute. Do you mean ' + keys[i] + ' ?')
    process.exit(127)
  }
}
console.error('Command not found')
process.exit(127)