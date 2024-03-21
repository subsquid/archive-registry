export interface DataSource {
    archive: string;
    chain: string;
}

export interface ArchiveProviderSubstrate {
    provider: string;
    release: string;
    dataSourceUrl: string;
}

export interface ArchiveEntrySubstrate {
    network: string;
    genesisHash?: string;
    providers: ArchiveProviderSubstrate[];
}

export interface ArchiveRegistrySubstrate {
    archives: ArchiveEntrySubstrate[];
}

export interface ArchiveProviderEVM {
    provider: string;
    release: string;
    dataSourceUrl: string;
}

export interface ArchiveEntryEVM {
    network: string;
    providers: ArchiveProviderEVM[];
}

export interface ArchiveRegistryEVM {
    archives: ArchiveEntryEVM[];
}

export interface NetworkSubstrate {
    name: string;
    displayName: string;
    tokens: string[];
    website: string;
    description: string;
    relayChain: string;
    parachainId: string;
    genesisHash: string;
}

export interface NetworkRegistrySubstrate {
    networks: NetworkSubstrate[];
}

export interface NetworkEVM {
    name: string;
    displayName: string;
    tokens: string[];
    website: string;
    description: string;
}

export interface NetworkRegistryEVM {
    networks: NetworkEVM[];
}
