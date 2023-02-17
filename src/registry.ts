import fs from 'fs'
import {ArchiveRegistrySubstrate, ArchiveRegistryEVM, NetworkRegistrySubstrate} from './intefaces'

export const networkRegistrySubstrate = JSON.parse(
    fs.readFileSync(`${__dirname}/../networks.json`, 'utf8')
) as NetworkRegistrySubstrate
export const archivesRegistrySubstrate = JSON.parse(
    fs.readFileSync(`${__dirname}/../archives.json`, 'utf8')
) as ArchiveRegistrySubstrate
export const archivesRegistryEVM = JSON.parse(
    fs.readFileSync(`${__dirname}/../archives-evm.json`, 'utf8')
) as ArchiveRegistryEVM
