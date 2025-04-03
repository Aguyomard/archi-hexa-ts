import { Command } from 'commander'

const program = new Command()

program
  .name('my-app')
  .description('Une CLI pour faire des trucs cool')
  .version('1.0.0')

program
  .command('hello')
  .description('Affiche Hello World')
  .action(() => {
    console.log('Hello World')
  })

program.parse(process.argv)
