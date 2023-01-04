import { archivesRegistrySubstrate, getGenesisHash } from '../src/'


async function verifyGenesisHashes() {
    for (const archive of archivesRegistrySubstrate.archives) {
        for (const provider of archive.providers) {
            console.log(`Archive: ${provider.dataSourceUrl}`)
            try {
                const hash = await getGenesisHash(provider.explorerUrl)
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