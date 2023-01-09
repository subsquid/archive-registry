import fetch from "node-fetch"
import assert from "assert"

import { AbortController } from "node-abort-controller";
import { NetworkSubstrate, ArchiveProviderSubstrate, ArchiveRegistrySubstrate, ArchiveRegistryEVM, ArchiveProviderEVM } from "."
import { KnownArchives, KnownArchivesEVM, KnownArchivesSubstrate, knownArchivesEVM, knownArchivesSubstrate } from "./chains";
import { archivesRegistrySubstrate, archivesRegistryEVM, networkRegistrySubstrate } from "./registry";

export type RegistryType = "Substrate" | "EVM"

export interface LookupOptionsSubstrate {
    type?: "Substrate",
    genesis?: string,
    image?: string,
    ingest?: string,
    gateway?: string
    release?: "FireSquid"
}

export interface LookupOptionsEVM {
    type?: "EVM",
    ingester?: string,
    worker?: string,
    release?: "Stage 1" | "Stage 2"
}


/**
 * Lookup providers matching the optional filtering criteria in a given Substrate or EVM registry
 * 
 * @param network network name for lookup
 * @param opts.type type of archive registry "Substrate" or "EVM"
 * @param opts.genesis network genesis hex string (must start with "0x...") (Substrate only)
 * @param opts.image archive image name (Substrate only)
 * @param opts.ingest archive image name (Substrate only)
 * @param opts.gateway archive gateway image  (Substrate only)
 * 
 * @param opts.ingester archive ingester name (EVM only)
 * @param opts.worker archive worker image (EVM only)
 * @param opts.release archive release (for example Stage version) (EVM only)
 * 
 * @returns A list of matching providers
 * @throws If none matching archive is found or if there's ambiguity in choosing the network
 */
export function lookupArchive(network: KnownArchives, opts?: LookupOptionsSubstrate | LookupOptionsEVM): string {
    if (!opts) {
        opts = {}
    }
    if (!opts.type) {
        if (knownArchivesSubstrate.includes(<KnownArchivesSubstrate>network))
            opts.type = "Substrate"
        else if (knownArchivesEVM.includes(<KnownArchivesEVM>network))
            opts.type = "EVM"
    }
    switch (opts?.type) {
        case "Substrate":
            return lookupInSubstrateRegistry(<KnownArchivesSubstrate> network, archivesRegistrySubstrate, <LookupOptionsSubstrate> opts)[0].dataSourceUrl
        case "EVM":
            return lookupInEVMRegistry(<KnownArchivesEVM> network, archivesRegistryEVM, <LookupOptionsEVM> opts)[0].dataSourceUrl
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
    network: string, registry: ArchiveRegistrySubstrate, opts?: LookupOptionsSubstrate): (ArchiveProviderSubstrate)[] {
    
    let archives = registry.archives.filter(a => a.network.toLowerCase() === network.toLowerCase())
    if (opts?.genesis) {
        archives = archives.filter(a => a.genesisHash?.toLowerCase() === opts.genesis?.toLowerCase())
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
        matched = matched.filter(p => p.image === opts.image)
    }

    if (opts?.ingest) {
        matched = matched.filter(p => p.ingest === opts.ingest)
    }

    if (opts?.gateway) {
        matched = matched.filter(p => p.gateway === opts.gateway)
    }

    if (opts?.release) {
        matched = matched.filter(p => p.release === opts.release)
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
    network: string, registry: ArchiveRegistryEVM, opts?: LookupOptionsEVM): (ArchiveProviderEVM)[] {

    let archives = archivesRegistryEVM.archives.filter(a => a.network.toLowerCase() === network.toLowerCase())

    let matched = archives[0].providers
    
    if (opts?.ingester) {
        matched = matched.filter(p => p.ingester === opts.ingester)
    }
    if (opts?.worker) {
        matched = matched.filter(p => p.worker === opts.worker)
    }
    if (opts?.release) {
        matched = matched.filter(p => p.release === opts.release)
    }

    if (matched.length === 0) {
        throw new Error(`Failed to lookup a matching EVM archive. \
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
    let matched =  networkRegistrySubstrate.networks.filter(n => n.name.toLowerCase() === network.toLowerCase()) 
    
    if (genesis) {
        matched = matched.filter(a => a.genesisHash?.toLowerCase() === genesis.toLowerCase())
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

export async function getGenesisHash(endpoint: string): Promise<string> {
    const query = `
    query {
        blocks(where: {height_eq: 0}, limit: 1) {
            hash
        }
    }
    `
    const result = await archiveRequest<{ blocks: {hash: string}[] }>(endpoint, query)
    return result.blocks[0].hash
}  


async function archiveRequest<T>(endpoint: string, query: string): Promise<T> {
    const controller = new AbortController()
    // 5 second timeout:
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    let response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({query}),
        headers: {
            'content-type': 'application/json',
            'accept': 'application/json',
            'accept-encoding': 'gzip, br'
        },
        signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
        let body = await response.text()
        throw new Error(`Got http ${response.status}${body ? `, body: ${body}` : ''}`)
    }
    let result = await response.json() as any
    if (result.errors?.length) {
        throw new Error(`GraphQL error: ${result.errors[0].message}`)
    }
    assert(result.data != null)
    return result.data as T
}
