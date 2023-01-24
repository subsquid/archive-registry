import {runProgram} from '@subsquid/util-internal'
import {Command, Option} from 'commander'
import {knownArchivesEVM, knownArchivesSubstrate} from '../chains'

runProgram(async () => {
    let program = new Command()

    program.description(`Display list of available archives`)
    program.addOption(new Option(`-t --type <type>`, `Network type`).choices([`evm`, `substrate`]))

    program.parse()
    let opts: {type: 'substrate' | 'evm'} = program.opts()

    let text

    if (opts.type == null) {
        console.log(getSubstrateArchives() + `\n\n` + getEvmArchives())
    } else {
        switch (opts.type) {
            case 'evm':
                console.log(getEvmArchives())
                break
            case 'substrate':
                console.log(getSubstrateArchives())
                break
        }
    }
})

function getEvmArchives() {
    let res: string[] = []
    res.push(`EVM archives:`)
    for (let archive of knownArchivesEVM) {
        res.push(` - ` + archive)
    }
    return res.join('\n')
}

function getSubstrateArchives() {
    let res: string[] = []
    res.push(`Substrate archives:`)
    for (let archive of knownArchivesSubstrate) {
        res.push(` - ` + archive)
    }
    return res.join('\n')
}
