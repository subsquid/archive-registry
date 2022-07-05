export interface DataSource {
    archive: string,
    chain: string
}

export interface ArchiveProviderV5 {
    provider: string,
    release: string,
    image: string,
    gateway: string,
    dataSourceUrl: string    
}

export interface ArchiveProvider {
    provider: string,
    release: string,
    image: string,
    gateway: string,
    dataSourceUrl: string,
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