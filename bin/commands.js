import fs from 'fs'

const helpMessage = `
usage: app_name [options] required_input required_input2
    options:
        -a, --argument                           Does something
        -b required                              Does something with "required"
        -c, --command                            Something else
        -d [optlistitem1 optlistitem 2 ... ]     Something with list
`
const startprojectNoArgsMessage = 'Please provide a name for your project'
const projectSetName = (name) => {
    const regex = new RegExp('^[a-zA-Z][a-zA-Z_0-9]*$')
    if(!regex.test(name)){
        console.error('Project names must include [a-zA-z0-9_]')
    }
    return name
}

export var subcommands = {
    'help': () => {
      console.log('\x1b[36m%s\x1b[0m',helpMessage)
    },
    'startproject': (args) => {
        if(args.length === 0){
            console.error('\x1b[31m', startprojectNoArgsMessage)
            process.exit(1)
        }
        var name = projectSetName(args[0])
        
        if (!fs.existsSync(`./${name}`)){
            fs.mkdirSync(`./${name}`);
        }
    },
}