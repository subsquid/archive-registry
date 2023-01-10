import fs from "fs"
import { ArchiveRegistrySubstrate, ArchiveRegistryEVM, NetworkRegistrySubstrate } from "./intefaces"

export const networkRegistrySubstrate = JSON.parse(fs.readFileSync(`${__dirname}/../networks.json`).toString()) as NetworkRegistrySubstrate
export const archivesRegistrySubstrate = JSON.parse(fs.readFileSync(`${__dirname}/../archives.json`).toString()) as ArchiveRegistrySubstrate
export const archivesRegistryEVM = JSON.parse(fs.readFileSync(`${__dirname}/../archives-evm.json`).toString()) as ArchiveRegistryEVM
