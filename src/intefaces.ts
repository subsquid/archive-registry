export interface DataSource {
    archive: string,
    chain: string
}

export interface ArchiveProviderEVM {
    provider: string,
    ingester: string,
    worker: string,
    release: string,
    dataSourceUrl: string    
}

export interface ArchiveProvider {
    provider: string,
    release: string,
    image: string,
    ingest: string,
    gateway: string,
    dataSourceUrl: string,
    explorerUrl: string
}

export interface ArchiveEntryEVM {
    network: string,
    providers: ArchiveProviderEVM[]
}

export interface ArchiveEntry {
    network: string,
    genesisHash?: string
    providers: ArchiveProvider[]
}

export interface ArchiveRegistryEVM {
    archives: ArchiveEntryEVM[]
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