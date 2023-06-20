import assert from "assert"
import { ArchiveRegistrySubstrate, ArchiveRegistryEVM, lookupArchive, lookupInSubstrateRegistry, lookupInEVMRegistry } from '.'

const mockRegistrySubstrate: ArchiveRegistrySubstrate = {
    "archives": [
        {
            "network": "polkadot",
            "providers": [
                {
                    "provider": "subsquid",
                    "dataSourceUrl": "https://polkadot.archive.subsquid.io/graphql",
                    "explorerUrl": "https://polkadot.explorer.subsquid.io/graphql",
                    "release": "FireSquid",
                    "image": "substrate-ingest:1",
                    "ingest": "substrate-ingest:1",
                    "gateway": "archive-gateway:2"
                }
            ],
            "genesisHash": "0xfe58ea77779b7abda7da4ec526d14db9b1e9cd40a217c34892af80a9b332b76d"
        },
        {
          "network": "moonbase",
          "genesisHash": "0x91bc6e169807aaa54802737e1c504b2577d4fafedd5a02c10293b1cd60e39527",
          "providers": [
            {
              "provider": "subsquid",
              "dataSourceUrl": "https://moonbase.archive.subsquid.io/graphql",
              "explorerUrl": "https://moonbase.explorer.subsquid.io/graphql",
              "release": "FireSquid",
              "image": "subsquid/substrate-ingest:1",
              "ingest": "subsquid/substrate-ingest:1",
              "gateway": "subsquid/substrate-gateway:2"
            }
          ]
        },
    ]
}

const mockRegistryEVM: ArchiveRegistryEVM = {
    "archives": [
        {
            "network": "binance",
            "providers": [
                {
                    "provider": "subsquid",
                    "dataSourceUrl": "https://binance.archive.subsquid.io",
                    "release": "FireSquid",
                }
            ]
        },
        {
          "network": "moonbase",
          "providers": [
            {
              "provider": "subsquid",
              "dataSourceUrl": "https://moonbase-evm.archive.subsquid.io",
              "release": "FireSquid",
            }
          ]
        },
    ]
}

describe("archive lookup", function() {
    it("looks up by archive name", () => {
        const polkaArchive = lookupInSubstrateRegistry("polkadot", mockRegistrySubstrate)[0].dataSourceUrl
        assert.equal(polkaArchive, "https://polkadot.archive.subsquid.io/graphql")
    })

    it("looks up by a named version", () => {
        const polkaArchive = lookupInSubstrateRegistry("polkadot", mockRegistrySubstrate)[0].dataSourceUrl
        assert.equal(polkaArchive, "https://polkadot.archive.subsquid.io/graphql")
    })

    it("lookups up by name and genesis hash", () => {
        const polkaArchive = lookupInSubstrateRegistry("polkadot", mockRegistrySubstrate, { genesis : "0xfe58ea77779b7abda7da4ec526d14db9b1e9cd40a217c34892af80a9b332b76d" })[0].dataSourceUrl
        assert.equal(polkaArchive, "https://polkadot.archive.subsquid.io/graphql")
    })

    it("fails to lookup by wrong hash", () => {
        assert.throws(() => lookupInSubstrateRegistry("polkadot", mockRegistrySubstrate, { genesis : "0xaaa" }), Error);
    })

    it("looks up by evm archive name", () => {
        const binanceArchive = lookupInEVMRegistry("binance", mockRegistryEVM)[0].dataSourceUrl
        assert.equal(binanceArchive, "https://binance.archive.subsquid.io")
    })
})