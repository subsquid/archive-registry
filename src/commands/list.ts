import {runProgram} from '@subsquid/util-internal'
import {Command, Option} from 'commander'
import Table from 'easy-table'
import {archivesRegistrySubstrate, archivesRegistryEVM} from '../registry'

runProgram(async () => {
    let program = new Command()

    program.description(`Display list of available archives`)
    program.addOption(new Option(`-t --type <type>`, `Network type`).choices([`evm`, `substrate`]))

    program.parse()
    let opts: {type: 'substrate' | 'evm'} = program.opts()

    switch (opts.type) {
        case 'evm':
            printEvmArchives()
            break
        case 'substrate':
            printSubstrateArchives()
            break
        case null:
        case undefined:
            printEvmArchives()
            printSubstrateArchives()
            break
    }
})

function printEvmArchives() {
    console.log(`EVM archives:`)
    let table = new Table()
    table.pushDelimeter(['network', 'endpoint'])
    for (let archive of archivesRegistryEVM.archives) {
        table.cell('network', archive.network)
        table.cell('endpoint', archive.providers[0].dataSourceUrl)
        table.newRow()
    }
    console.log(table.print())
}

function printSubstrateArchives() {
    console.log(`Substrate archives:`)
    let table = new Table()
    table.pushDelimeter(['network', 'endpoint'])
    for (let archive of archivesRegistrySubstrate.archives) {
        table.cell('network', archive.network)
        table.cell('endpoint', archive.providers[0].dataSourceUrl)
        table.newRow()
    }
    console.log(table.print())
}
