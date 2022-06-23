import fs from "fs"
import { ArchiveRegistry, ArchiveRegistryV5, NetworkRegistry } from "./intefaces"

export const networkRegistry = JSON.parse(fs.readFileSync(`${__dirname}/../networks.json`).toString()) as NetworkRegistry
export const archivesRegistry = JSON.parse(fs.readFileSync(`${__dirname}/../archives.json`).toString()) as ArchiveRegistry
export const archivesRegistryV5 = JSON.parse(fs.readFileSync(`${__dirname}/../archives-v5.json`).toString()) as ArchiveRegistryV5
