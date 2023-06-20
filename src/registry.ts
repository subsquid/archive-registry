import fetch from 'sync-fetch'
import {ArchiveRegistrySubstrate, ArchiveRegistryEVM, NetworkRegistrySubstrate} from './interfaces'

export function networkRegistrySubstrate(): NetworkRegistrySubstrate {
    return fetch('https://cdn.subsquid.io/archives/networks.json').json()
}

export function archivesRegistrySubstrate(): ArchiveRegistrySubstrate {
    return fetch('https://cdn.subsquid.io/archives/substrate.json').json()
}

export function archivesRegistryEVM(): ArchiveRegistryEVM {
    return fetch('https://cdn.subsquid.io/archives/evm.json').json()
}
