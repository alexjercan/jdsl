#!/usr/bin/env node

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import { run, init } from './src/jdsl.js';

yargs(hideBin(process.argv))
    .command(
        'init <remote>',
        'initialize the project',
        (yargs) => {
            return yargs.positional('remote', {
                describe: 'the URL to the remote repository',
                type: 'string',
            });
        },
        (argv) => {
            init(argv.remote);
        }
    )
    .command(
        'run <className> <functionName>',
        'run the project',
        (yargs) => {
            return yargs
                .positional('className', {
                    describe: 'the name of the entrypoint class',
                    type: 'string',
                })
                .positional('functionName', {
                    describe: 'the name of the entrypoint function',
                    type: 'string',
                });
        },
        (argv) => {
            run(argv.className, argv.functionName);
        }
    )
    .parse();
