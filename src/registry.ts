import fetch from 'sync-fetch'
import {ArchiveRegistrySubstrate, ArchiveRegistryEVM, NetworkRegistrySubstrate} from './intefaces'

export const networkRegistrySubstrate = fetch(
    'https://raw.githubusercontent.com/subsquid/archive-registry/main/networks.json'
).json() as NetworkRegistrySubstrate
export const archivesRegistrySubstrate = fetch(
    'https://raw.githubusercontent.com/subsquid/archive-registry/main/archives.json'
).json() as ArchiveRegistrySubstrate
export const archivesRegistryEVM = fetch(
    'https://raw.githubusercontent.com/subsquid/archive-registry/main/archives-evm.json'
).json() as ArchiveRegistryEVM
