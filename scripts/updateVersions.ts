import fs from "fs"
import { archivesRegistry, getVersion } from '../src/lookup'


async function updateVersions() {
    const a = []
    for (const archive of archivesRegistry.archives) {
        const p = []
        for (const provider of archive.providers) {
            console.log(`Archive: ${provider.url}`)
            try {
                const version = await getVersion(provider.url)
                console.log(`\tversion: ${version}`)
                provider.version = version
            } catch (e: any) {
                console.error(`Error: ${<Error>e?.message}`)
            }
            p.push(provider)
        }
        archive.providers = p 
        a.push(archive)
    }
    console.log(`Updating the registry...`)
    fs.writeFileSync(`${__dirname}/../registryNew.json`, JSON.stringify({ archives: a }, null, 2))
}

updateVersions().then(() => console.log('Done!'))
