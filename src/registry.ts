import fs from "fs"
import { ArchiveRegistry, NetworkRegistry } from "./intefaces"

export const networkRegistry = JSON.parse(fs.readFileSync(`${__dirname}/../networks.json`).toString()) as NetworkRegistry
export const archivesRegistry = JSON.parse(fs.readFileSync(`${__dirname}/../archives.json`).toString()) as ArchiveRegistry
