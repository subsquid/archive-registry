import fs from "fs"
import fetch from "node-fetch"
import { AbortController } from "node-abort-controller";
import assert from "assert"
import { Network, ArchiveRegistry, NetworkRegistry } from "."


export const networkRegistry = JSON.parse(fs.readFileSync(`${__dirname}/../networks.json`).toString()) as NetworkRegistry
export const archivesRegistry = JSON.parse(fs.readFileSync(`${__dirname}/../registryNew.json`).toString()) as ArchiveRegistry

/**
 * Lookup an archive endpoint by name, provider (optional) and genesis hash (optional)
 * 
 * @param Filter for the lookup
 * @returns Archive endpoint url matching the filter
 */
export function lookupArchive(
    network: string,
    genesis?: string,
    provider?: string): { url: string, version: string } {
    
    let archives = archivesRegistry.archives.filter(a => a.network.toLowerCase() === network.toLowerCase())
    if (genesis) {
        archives = archives.filter(a => a.genesisHash?.toLowerCase() === genesis.toLowerCase())
    }

    if (archives.length === 0) {
        throw new Error(`Failed to lookup a matching archive. \
Please consider submitting a PR to subsquid/archive-registry github repo to extend the registry`)
    }
    
    const archive = archives[0]
    if (provider) {
        const filtered = archive.providers.filter(p => p.name.toLowerCase() === provider.toLowerCase()) 
        if (filtered.length === 0) {
            throw new Error(`Failed to lookup a matching archive. \
Please consider submitting a PR to subsquid/archive-registry github repo to extend the registry`)
        }
        return filtered[0]
    }
    // take the first one by default (which is subsquid)
    return archive.providers[0]
}

/**
 * Get parachain information by its name
 * 
 * @param network Network name
 * @returns Chain info incluing genesis hash, token symbols, parachainId if relevent, etc
 */
export function getChainInfo(network: string): Network {
    const filtered =  networkRegistry.networks.filter(n => n.name.toLowerCase() === network.toLowerCase()) 
    if (filtered.length === 0) {
        throw new Error(`Failed to get info on ${network}. \
Please consider submitting a PR to subsquid/archive-registry github repo to extend the registry`) 
    }
    return filtered[0]
}

export async function getGenesisHash(endpoint: string): Promise<string> {
    const query = `
    query {
        substrate_block(where: {height: {_eq: 0}}) {
            hash
        }
    }
    `
    const result = await archiveRequest<{ substrate_block: {hash: string}[] }>(endpoint, query)
    return result.substrate_block[0].hash
}  

export async function getVersion(endpoint: string): Promise<string> {
    const query = `
    query {
        indexerStatus {
            hydraVersion
        }
    }
    `
    const result = await archiveRequest<{indexerStatus: { hydraVersion: string }}>(endpoint, query)
    return result.indexerStatus.hydraVersion
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
