import fs from "fs"
import fetch from "node-fetch"
import { AbortController } from "node-abort-controller";
import assert from "assert"
import { satisfies } from "semver"
import { Network, ArchiveRegistry, NetworkRegistry, ArchiveProvider } from "."


export const networkRegistry = JSON.parse(fs.readFileSync(`${__dirname}/../networks.json`).toString()) as NetworkRegistry
export const archivesRegistry = JSON.parse(fs.readFileSync(`${__dirname}/../registryNew.json`).toString()) as ArchiveRegistry

/**
 * Lookup an archive endpoint by network name, provider (optional) and genesis hash (optional)
 * 
 * @param network network name for lookup
 * @param genesis network genesis hex string (must start with "0x...")
 * @param semver semver range to match archive image version 
 * @param image archive image name
 * @param gateway archive gateway image 
 * 
 * @returns Archive endpoint url matching the filter
 * @throws If none matching archive is found or if there's ambiguity in choosing the network
 */
export function lookupArchive(
    network: string,
    semver?: string,
    genesis?: string,
    image?: string,
    gateway?: string): ArchiveProvider[] {
    
    let archives = archivesRegistry.archives.filter(a => a.network.toLowerCase() === network.toLowerCase())
    if (genesis) {
        archives = archives.filter(a => a.genesisHash?.toLowerCase() === genesis.toLowerCase())
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
    if (semver) {
        // if (valid(semver) === null) {
        //     throw new Error(`${semver} is not a valid semver range`)
        // }
        matched = matched.filter(p => satisfies(p.version, semver))
    }

    if (image) {
        matched = matched.filter(p => p.image === image)
    }

    if (gateway) {
        matched = matched.filter(p => p.gateway === gateway)
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
