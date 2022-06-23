export interface DataSource {
    archive: string,
    chain: string
}

export interface ArchiveProviderV5 {
    provider: string,
    version: string,
    image: string,
    gateway: string,
    url: string    
}

export interface ArchiveProvider {
    provider: string,
    version: string,
    image: string,
    gateway: string,
    url: string,
    explorerUrl: string
}

export interface ArchiveEntryV5 {
    network: string,
    genesisHash?: string
    providers: ArchiveProviderV5[]
}

export interface ArchiveEntry {
    network: string,
    genesisHash?: string
    providers: ArchiveProvider[]
}

export interface ArchiveRegistryV5 {
    archives: ArchiveEntryV5[]
} 

export interface ArchiveRegistry {
    archives: ArchiveEntry[]
} 

export interface Network {
    name: string, 
    displayName: string
    tokens: string[],
    website: string,
    description: string,
    relayChain: string,
    parachainId: string,
    genesisHash: string
}

export interface NetworkRegistry {
    networks: Network[]
}