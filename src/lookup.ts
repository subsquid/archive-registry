import fetch from 'sync-fetch'
import assert from 'assert'

import {
    NetworkSubstrate,
    ArchiveProviderSubstrate,
    ArchiveRegistrySubstrate,
    ArchiveRegistryEVM,
    ArchiveProviderEVM,
} from '.'
import {KnownArchives, KnownArchivesEVM, KnownArchivesSubstrate} from './chains'
import {archivesRegistrySubstrate, archivesRegistryEVM, networkRegistrySubstrate} from './registry'

export type RegistryType = 'Substrate' | 'EVM'

export interface LookupOptionsSubstrate {
    type?: 'Substrate'
    /**
     * Network genesis hex string (must start with "0x...")
     */
    genesis?: string
    /**
     * Archive image name
     */
    image?: string
    /**
     * Archive image name
     */
    ingest?: string
    /**
     * Archive gateway image
     */
    gateway?: string
    /**
     * Archive release
     */
    release?: 'FireSquid'
}

export interface LookupOptionsEVM {
    type?: 'EVM'
    /**
     * Network genesis hex string (must start with "0x...")
     */
    genesis?: string
    /**
     * Archive release
     */
    release?: 'FireSquid' | 'ArrowSquid'
}

/**
 * Lookup providers matching the optional filtering criteria in a given Substrate or EVM registry
 * @param network network name for lookup
 * @returnsArchive endpoint url matching the filter
 * @throws If none matching archive is found or if there's ambiguity in choosing the network
 */
export function lookupArchive(network: KnownArchives): string

/**
 * Lookup providers matching the optional filtering criteria in a given Substrate registry
 * @param network network name for lookup
 * @param opts susbtrate archive lookup options
 * @returnsArchive endpoint url matching the filter
 * @throws If none matching archive is found or if there's ambiguity in choosing the network
 */
export function lookupArchive(network: KnownArchivesSubstrate, opts: LookupOptionsSubstrate): string

/**
 * Lookup providers matching the optional filtering criteria in a given Substrate or EVM registry
 * @param network network name for lookup
 * @param opts evm archive lookup options
 * @returns Archive endpoint url matching the filter
 * @throws If none matching archive is found or if there's ambiguity in choosing the network
 */
export function lookupArchive(network: KnownArchivesEVM, opts: LookupOptionsEVM): string

export function lookupArchive(network: string, opts?: LookupOptionsSubstrate | LookupOptionsEVM) {
    if (!opts) {
        opts = {}
    }

    if (!opts.type) {
        let isSubstrateNetwork = archivesRegistrySubstrate().archives.some((a) => a.network === network)
        let isEvmNetwork = archivesRegistryEVM().archives.some((a) => a.network === network)
        if (isEvmNetwork && isSubstrateNetwork) {
            throw new Error(`There are multiple networks with name ${network}. Provide network type to disambiguate.`)
        } else if (isEvmNetwork) {
            opts.type = 'EVM'
        } else if (isSubstrateNetwork) {
            opts.type = 'Substrate'
        } else {
            throw new Error(`Failed to lookup a matching archive. \
Please consider submitting a PR to subsquid/archive-registry github repo to extend the registry`)
        }
    }

    switch (opts.type) {
        case 'Substrate':
            return lookupInSubstrateRegistry(network, archivesRegistrySubstrate(), {
                release: 'FireSquid',
                ...opts,
            })[0].dataSourceUrl
        case 'EVM':
            return lookupInEVMRegistry(network, archivesRegistryEVM(), {
                release: 'ArrowSquid',
                ...opts,
            })[0].dataSourceUrl
        default:
            throw new Error(`Archive registry type must be value from RegistryTypes ("Substrate", "EVM", ...)`)
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
    let archives = registry.archives.filter((a) => a.network.toLowerCase() === network.toLowerCase())
    if (opts?.genesis) {
        archives = archives.filter((a) => a.genesisHash?.toLowerCase() === opts.genesis?.toLowerCase())
    }

    if (archives.length === 0) {
        throw new Error(`Failed to lookup a matching archive. \
Please consider submitting a PR to subsquid/archive-registry github repo to extend the registry`)
    }

    if (archives.length > 1) {
        throw new Error(`There are multiple networks with name ${network}. \
Provide the genesis hash to disambiguate.`)
    }

    let matched = archives[0].providers

    if (opts?.image) {
        matched = matched.filter((p) => p.image === opts.image)
    }

    if (opts?.ingest) {
        matched = matched.filter((p) => p.ingest === opts.ingest)
    }

    if (opts?.gateway) {
        matched = matched.filter((p) => p.gateway === opts.gateway)
    }

    if (opts?.release) {
        matched = matched.filter((p) => p.release === opts.release)
    }

    if (matched.length === 0) {
        throw new Error(`Failed to lookup a matching archive. \
Please consider submitting a PR to subsquid/archive-registry github repo to extend the registry`)
    }

    return matched
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
    let archives = registry.archives.filter((a) => a.network.toLowerCase() === network.toLowerCase())

    if (archives.length > 1) {
        throw new Error(`There are multiple networks with name ${network}. \
Provide the genesis hash to disambiguate.`)
    }

    let matched = archives[0].providers

    if (opts?.release) {
        matched = matched.filter((p) => p.release === opts.release)
    }

    if (matched.length === 0) {
        throw new Error(`Failed to lookup a matching archive. \
Please consider submitting a PR to subsquid/archive-registry github repo to extend the registry`)
    }

    return matched
}

/**
 * Get parachain information by its name
 *
 * @param network Network name
 * @returns Chain info incluing genesis hash, token symbols, parachainId if relevent, etc
 */
export function getChainInfo(network: string, genesis?: string): NetworkSubstrate {
    let matched = networkRegistrySubstrate().networks.filter((n) => n.name.toLowerCase() === network.toLowerCase())

    if (genesis) {
        matched = matched.filter((a) => a.genesisHash?.toLowerCase() === genesis.toLowerCase())
    }

    if (matched.length === 0) {
        throw new Error(`Failed to get info on ${network}. \
Please consider submitting a PR to subsquid/archive-registry github repo to extend the registry`)
    }

    if (matched.length > 1) {
        throw new Error(`There are multiple networks with name ${network}. \
Provide genesis hash option to prevent ambiguity.`)
    }

    return matched[0]
}

export function getGenesisHash(endpoint: string): string {
    const query = `
    query {
        blocks(where: {height_eq: 0}, limit: 1) {
            hash
        }
    }
    `
    const result = archiveRequest<{blocks: {hash: string}[]}>(endpoint, query)
    return result.blocks[0].hash
}

function archiveRequest<T>(endpoint: string, query: string): T {
    const controller = new AbortController()
    // 5 second timeout:
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    let response = fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({query}),
        headers: {
            'content-type': 'application/json',
            accept: 'application/json',
            'accept-encoding': 'gzip, br',
        },
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
        let body = response.text()
        throw new Error(`Got http ${response.status}${body ? `, body: ${body}` : ''}`)
    }
    let result = response.json()
    if (result.errors?.length) {
        throw new Error(`GraphQL error: ${result.errors[0].message}`)
    }
    assert(result.data != null)
    return result.data as T
}
