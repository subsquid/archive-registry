import {
    KnownArchives,
    KnownArchivesEVM,
    KnownArchivesSubstrate,
} from "./chains";
import {
    archivesRegistryEVM,
    archivesRegistrySubstrate,
    networkRegistrySubstrate,
} from "./registry";
import {
    ArchiveProviderEVM,
    ArchiveProviderSubstrate,
    ArchiveRegistryEVM,
    ArchiveRegistrySubstrate,
    NetworkSubstrate,
} from ".";

export type RegistryType = "Substrate" | "EVM";

export interface LookupOptionsSubstrate {
    type?: "Substrate";
    /**
     * Network genesis hex string (must start with "0x...")
     */
    genesis?: string;
    /**
     * Archive release
     */
    release?: "ArrowSquid" | "FireSquid";
}

export interface LookupOptionsEVM {
    type?: "EVM";
    /**
     * Network genesis hex string (must start with "0x...")
     */
    genesis?: string;
    /**
     * Archive release
     */
    release?: "ArrowSquid" | "FireSquid";
}

/**
 * Lookup providers matching the optional filtering criteria in a given Substrate or EVM registry
 * @param network network name for lookup
 * @returnsArchive endpoint url matching the filter
 * @throws If none matching archive is found or if there's ambiguity in choosing the network
 */
export function lookupArchive(network: KnownArchives): string;
export function lookupArchive(network: string): string;

/**
 * Lookup providers matching the optional filtering criteria in a given Substrate registry
 * @param network network name for lookup
 * @param opts susbtrate archive lookup options
 * @returnsArchive endpoint url matching the filter
 * @throws If none matching archive is found or if there's ambiguity in choosing the network
 */
export function lookupArchive(
    network: KnownArchivesSubstrate,
    opts: LookupOptionsSubstrate
): string;
export function lookupArchive(
    network: string,
    opts: LookupOptionsSubstrate
): string;

/**
 * Lookup providers matching the optional filtering criteria in a given Substrate or EVM registry
 * @param network network name for lookup
 * @param opts evm archive lookup options
 * @returns Archive endpoint url matching the filter
 * @throws If none matching archive is found or if there's ambiguity in choosing the network
 */
export function lookupArchive(
    network: KnownArchivesEVM,
    opts: LookupOptionsEVM
): string;
export function lookupArchive(network: string, opts: LookupOptionsEVM): string;

export function lookupArchive(
    network: string,
    opts?: LookupOptionsSubstrate | LookupOptionsEVM
) {
    if (!opts) {
        opts = {};
    }

    let registrySubstrate = archivesRegistrySubstrate();
    let registryEvm = archivesRegistryEVM();

    if (!opts.type) {
        let isSubstrateNetwork = registrySubstrate.archives.some(
            (a) => a.network === network
        );
        let isEvmNetwork = registryEvm.archives.some(
            (a) => a.network === network
        );
        if (isEvmNetwork && isSubstrateNetwork) {
            throw new Error(
                `There are multiple networks with name ${network}. Provide network type to disambiguate.`
            );
        } else if (isEvmNetwork) {
            opts.type = "EVM";
        } else if (isSubstrateNetwork) {
            opts.type = "Substrate";
        } else {
            throw new Error(`Failed to lookup a matching archive. \
Please consider submitting an issue to subsquid/archive-registry \
github repo to extend the registry. More information in repo README.md`);
        }
    }

    switch (opts.type) {
        case "Substrate":
            return lookupInSubstrateRegistry(network, registrySubstrate, {
                release: "ArrowSquid",
                ...opts,
            })[0].dataSourceUrl;
        case "EVM":
            return lookupInEVMRegistry(network, registryEvm, {
                release: "ArrowSquid",
                ...opts,
            })[0].dataSourceUrl;
        default:
            throw new Error(
                `Archive registry type must be value from RegistryTypes ("Substrate", "EVM", ...)`
            );
    }
}

/**
 * Lookup providers matching the optional filtering criteria in a given Substrate registry
 *
 * @param network network name for lookup
 * @param opts.genesis network genesis hex string (must start with "0x...")
 * @param opts.image archive image name
 * @param opts.ingest archive image name
 * @param opts.gateway archive gateway image
 *
 * @returns A list of matching providers
 * @throws If none matching archive is found or if there's ambiguity in choosing the network
 */
export function lookupInSubstrateRegistry(
    network: string,
    registry: ArchiveRegistrySubstrate,
    opts?: LookupOptionsSubstrate
): ArchiveProviderSubstrate[] {
    let archives = registry.archives.filter(
        (a) => a.network.toLowerCase() === network.toLowerCase()
    );
    if (opts?.genesis) {
        archives = archives.filter(
            (a) => a.genesisHash?.toLowerCase() === opts.genesis?.toLowerCase()
        );
    }

    if (archives.length === 0) {
        throw new Error(`Failed to lookup a matching archive. \
Please consider submitting an issue to subsquid/archive-registry \
github repo to extend the registry. More information in repo README.md`);
    }

    if (archives.length > 1) {
        throw new Error(`There are multiple networks with name ${network}. \
Provide the genesis hash to disambiguate.`);
    }

    let matched = archives[0].providers;

    if (opts?.release) {
        matched = matched.filter((p) => p.release === opts.release);
    }

    if (matched.length === 0) {
        throw new Error(`Failed to lookup a matching archive. \
Please consider submitting an issue to subsquid/archive-registry \
github repo to extend the registry. More information in repo README.md`);
    }

    return matched;
}

/**
 * Lookup Subsquid Substrate Archive endpoint by network name
 *
 * @param network network name for lookup
 * @param opts.ingester archive ingester name
 * @param opts.worker archive worker image
 * @param opts.release archive release (for example Stage version)
 *
 * @returns Archive endpoint url matching the filter
 * @throws If none matching archive is found or if there's ambiguity in choosing the network
 */
export function lookupInEVMRegistry(
    network: string,
    registry: ArchiveRegistryEVM,
    opts?: LookupOptionsEVM
): ArchiveProviderEVM[] {
    let archives = registry.archives.filter(
        (a) => a.network.toLowerCase() === network.toLowerCase()
    );

    if (archives.length > 1) {
        throw new Error(`There are multiple networks with name ${network}. \
Provide the genesis hash to disambiguate.`);
    }

    let matched = archives[0].providers;

    if (opts?.release) {
        matched = matched.filter((p) => p.release === opts.release);
    }

    if (matched.length === 0) {
        throw new Error(`Failed to lookup a matching archive. \
Please consider submitting an issue to subsquid/archive-registry \
github repo to extend the registry. More information in repo README.md`);
    }

    return matched;
}

/**
 * Get parachain information by its name
 *
 * @param network Network name
 * @returns Chain info incluing genesis hash, token symbols, parachainId if relevent, etc
 */
export function getChainInfo(
    network: string,
    genesis?: string
): NetworkSubstrate {
    let matched = networkRegistrySubstrate().networks.filter(
        (n) => n.name.toLowerCase() === network.toLowerCase()
    );

    if (genesis) {
        matched = matched.filter(
            (a) => a.genesisHash?.toLowerCase() === genesis.toLowerCase()
        );
    }

    if (matched.length === 0) {
        throw new Error(`Failed to get info on ${network}. \
Please consider submitting an issue to subsquid/archive-registry \
github repo to extend the registry. More information in repo README.md`);
    }

    if (matched.length > 1) {
        throw new Error(`There are multiple networks with name ${network}. \
Provide genesis hash option to prevent ambiguity.`);
    }

    return matched[0];
}
