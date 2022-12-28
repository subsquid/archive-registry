import assert from "assert"
import { ArchiveRegistry, ArchiveRegistryEVM, lookupInSubstrateRegistry, lookupInEVMRegistry, lookupArchive, lookupArchiveEVM } from '.'

const mockRegistry: ArchiveRegistry = {
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
          "release": "Stage 1",
          "ingester": "eth-stage1-ingester:0.0.43",
          "worker": "eth-stage1-worker:0.0.43"
        }
      ]
    },
  ]
}

describe("archive lookup", function() {
    it("looks up by archive name", () => {
        const polkaArchive = lookupInSubstrateRegistry("polkadot", mockRegistry)[0].dataSourceUrl
        assert(polkaArchive === "https://polkadot.archive.subsquid.io/graphql")
    })

    it("looks up by a named version", () => {
        const polkaArchive = lookupInSubstrateRegistry("polkadot", mockRegistry)[0].dataSourceUrl
        assert(polkaArchive === "https://polkadot.archive.subsquid.io/graphql")
    })

    it("lookups up by name and genesis hash", () => {
        const polkaArchive = lookupInSubstrateRegistry("polkadot", mockRegistry, { genesis : "0xfe58ea77779b7abda7da4ec526d14db9b1e9cd40a217c34892af80a9b332b76d" })[0].dataSourceUrl
        assert(polkaArchive === "https://polkadot.archive.subsquid.io/graphql")
    })

    it("fails to lookup by wrong hash", () => {
        assert.throws(() => lookupInSubstrateRegistry("polkadot", mockRegistry, { genesis : "0xaaa" }), Error);
    })

    it("looks up by evm archive name", () => {
        const binanceArchive = lookupInEVMRegistry("binance", mockRegistryEVM)[0].dataSourceUrl
        assert(binanceArchive === "https://binance.archive.subsquid.io")
    })

    it("lookups up fire squid archive by name", () => {
        const polkaArchive = lookupArchive("polkadot", { release: "FireSquid" })
        assert(polkaArchive === "https://polkadot.archive.subsquid.io/graphql")
    })

    it("lookups up evm archive by name", () => {
        const binanceArchive = lookupArchiveEVM("binance")
        assert(binanceArchive === "https://binance.archive.subsquid.io")
    })
})