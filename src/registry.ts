import fetch from 'sync-fetch'
import {ArchiveRegistrySubstrate, ArchiveRegistryEVM, NetworkRegistrySubstrate} from './intefaces'

export function networkRegistrySubstrate(): NetworkRegistrySubstrate {
    return fetch('https://raw.githubusercontent.com/subsquid/archive-registry/main/networks.json').json()
}

export function archivesRegistrySubstrate(): ArchiveRegistrySubstrate {
    return fetch('https://raw.githubusercontent.com/subsquid/archive-registry/main/archives.json').json()
}

export function archivesRegistryEVM(): ArchiveRegistryEVM {
    return fetch('https://raw.githubusercontent.com/subsquid/archive-registry/main/archives-evm.json').json()
}
