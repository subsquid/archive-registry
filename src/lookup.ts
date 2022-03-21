import fs from "fs"
import fetch from "node-fetch"
import assert from "assert"
import { Network } from './intefaces'
import { ArchiveRegistry, NetworkRegistry } from "."


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
    provider?: string): string {
    //const { network, provider, genesis } = filter
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
        return filtered[0].url
    }
    // take the first one by default (which is subsquid)
    return archive.providers[0].url
}

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
        substrate_block(where: {height: {_eq: 0}}) {
           hash
        }
    `
    const result = await archiveRequest<{hash: string}[]>(endpoint, query)
    return result[0].hash
}  

async function archiveRequest<T>(endpoint: string, query: string): Promise<T> {
    let response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({query}),
        headers: {
            'content-type': 'application/json',
            'accept': 'application/json',
            'accept-encoding': 'gzip, br'
        }
    })
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
