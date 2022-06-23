import fs from "fs"
import { archivesRegistry, getGenesisHash } from '../src/'


async function verifyGenesisHashes() {
    for (const archive of archivesRegistry.archives) {
        for (const provider of archive.providers) {
            console.log(`Archive: ${provider.url}`)
            try {
                const hash = await getGenesisHash(provider["explorer-url"])
                if (hash !== archive.genesisHash) {
                    console.error(`\tError: expected ${archive.genesisHash} but got ${hash}`)
                } else {
                    console.error(`\tHash match`)
                }
            } catch (e: any) {
                console.error(`Error: ${<Error>e?.message}`)
            }
        }
    }
}

verifyGenesisHashes().then(() => console.log('Done verifying hashes'))