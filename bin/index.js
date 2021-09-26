import {subcommands} from './commands.js'

var args = process.argv.slice(2)

var subcommand = ''
try {
  subcommand = args[0]
} catch (error) {
  subcommand = 'help'
}
if(subcommand in subcommands){
  subcommands[subcommand](args.slice(1))
}