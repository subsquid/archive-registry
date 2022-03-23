export interface DataSource {
    archive: string,
    chain: string
}

export interface ArchiveProvider {
    provider: string,
    version: string,
    image: string,
    gateway: string,
    url: string
}

export interface ArchiveEntry {
    network: string,
    genesisHash?: string
    providers: ArchiveProvider[]
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