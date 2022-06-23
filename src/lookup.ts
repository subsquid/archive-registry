import fetch from "node-fetch"
import { AbortController } from "node-abort-controller";
import assert from "assert"
import { Network, ArchiveProvider, ArchiveRegistry, ArchiveRegistryV5, ArchiveProviderV5 } from "."
import { KnownArchives, KnownArchivesV5 } from "./chains";
import { archivesRegistry, archivesRegistryV5, networkRegistry } from "./registry";

export interface LookupOptions {
    genesis?: string,
    image?: string,
    gateway?: string
    version?: string
}

/**
 * Lookup Subsquid V5 Archive endpoint by network name, provider (optional) and genesis hash (optional)
 * 
 * @param opts.network network name for lookup
 * @param opts.version matches the major version for numbered versions (e.g. 5 matches 5.0.1-alpha) 
 *                     or an exact match for named versions
 * @param opts.genesis network genesis hex string (must start with "0x...")
 * @param opts.semver semver range to match archive image version 
 * @param opts.image archive image name
 * @param opts.gateway archive gateway image 
 * 
 * @returns Archive endpoint url matching the filter
 * @throws If none matching archive is found or if there's ambiguity in choosing the network
 */
export function lookupV5Archive (network: KnownArchivesV5, opts?: LookupOptions): ArchiveProviderV5[] {
    return doLookup(network, { ...opts, version: '5'}, archivesRegistryV5)
}

/**
 * Lookup Subsquid Archive endpoint by network name, provider (optional) and genesis hash (optional)
 * 
 * @param opts.network network name for lookup
 * @param opts.version matches the major version for numbered versions (e.g. 5 matches 5.0.1-alpha) 
 *                     or an exact match for named versions
 * @param opts.genesis network genesis hex string (must start with "0x...")
 * @param opts.semver semver range to match archive image version 
 * @param opts.image archive image name
 * @param opts.gateway archive gateway image 
 * 
 * @returns Archive endpoint url matching the filter
 * @throws If none matching archive is found or if there's ambiguity in choosing the network
 */
 export function lookupFireSquidArchive(network: KnownArchives, opts?: LookupOptions): ArchiveProvider[] {
    return doLookup(network, { ...opts, version: 'fire-squid'}, archivesRegistry) as ArchiveProvider[]
}

/**
 * Lookup an archive endpoint by network name, provider (optional) and genesis hash (optional)
 * 
 * @param opts.network network name for lookup
 * @param opts.version matches the major version for numbered versions (e.g. 5 matches 5.0.1-alpha) 
 *                     or an exact match for named versions
 * @param opts.genesis network genesis hex string (must start with "0x...")
 * @param opts.semver semver range to match archive image version 
 * @param opts.image archive image name
 * @param opts.gateway archive gateway image 
 * 
 * @returns Archive endpoint url matching the filter
 * @throws If none matching archive is found or if there's ambiguity in choosing the network
 */
export function doLookup(
    network: string, opts?: LookupOptions, registry: ArchiveRegistry | ArchiveRegistryV5 = archivesRegistry): (ArchiveProvider | ArchiveProviderV5)[] {
    
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
Provide genesis hash option to prevent ambiguity.`)
    }

    let matched = archives[0].providers

    if (opts?.image) {
        matched = matched.filter(p => p.image === opts.image)
    }

    if (opts?.gateway) {
        matched = matched.filter(p => p.gateway === opts.gateway)
    }

    if (opts?.version) {

        let majVersion = (s: string) => {
            if (s.indexOf('.') > 0) {
                 // take the major version if it's not a named version
                return s.split('.')[0]
            }
            return s
        }
        
        matched = matched.filter(p => majVersion(p.version) === opts.version)
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
export function getChainInfo(network: string, genesis?: string): Network {
    let matched =  networkRegistry.networks.filter(n => n.name.toLowerCase() === network.toLowerCase()) 
    
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
        blocks(where: {height_eq: 0}) {
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
