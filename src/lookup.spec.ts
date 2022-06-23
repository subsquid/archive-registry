import assert from "assert"
import { ArchiveRegistry, doLookup, lookupFireSquidArchive, lookupV5Archive } from '.'

const mockRegistry: ArchiveRegistry = {
    "archives": [
      {
        "network": "polkadot",
        "providers": [
          {
            "provider": "subsquid",
            "url": "https://polkadot.archive.subsquid.io/graphql",
            "explorerUrl": "https://polkadot.explorer.subsquid.io/graphql",
            "version": "fire-squid",
            "image": "substrate-ingest",
            "gateway": "archive-gateway"
          }
        ],
        "genesisHash": "0xfe58ea77779b7abda7da4ec526d14db9b1e9cd40a217c34892af80a9b332b76d"
      },
      {
        "network": "moonbeam",
        "providers": [
          {
            "provider": "subsquid",
            "url": "https://moonbeam.archive.subsquid.io/graphql",
            "explorerUrl": "https://moonbeam.explorer.subsquid.io/graphql",
            "version": "5.0.0.alpha-23",
            "image": "substrate-ingest",
            "gateway": "archive-gateway"
          }
        ],
        "genesisHash": "0xfe58ea77779b7abda7da4ec526d14db9b1e9cd40a217c34892af80a9b332b76d"
      },
    ]
}

describe("archive lookup", function() {
    it("looks up by archive name", () => {
        const polkaArchive = doLookup("polkadot", undefined, mockRegistry)[0].url
        assert(polkaArchive === "https://polkadot.archive.subsquid.io/graphql")
    })

    it("looks up by a numbered version", () => {
        const polkaArchive = doLookup("moonbeam", { version : "5" }, mockRegistry)[0].url
        assert(polkaArchive === "https://moonbeam.archive.subsquid.io/graphql")
    })

    it("looks up by a named version", () => {
        const polkaArchive = doLookup("polkadot", { version : "fire-squid" }, mockRegistry)[0].url
        assert(polkaArchive === "https://polkadot.archive.subsquid.io/graphql")
    })

    it("lookups up by name and genesis hash", () => {
        const polkaArchive = doLookup("polkadot", { genesis : "0xfe58ea77779b7abda7da4ec526d14db9b1e9cd40a217c34892af80a9b332b76d" }, mockRegistry)[0].url
        assert(polkaArchive === "https://polkadot.archive.subsquid.io/graphql")
    })

    it("fails to lookup by wrong hash", () => {
        assert.throws(() => doLookup("polkadot", { genesis : "0xaaa" }, mockRegistry)[0].url, Error);
    })

    it("lookups up fire squid archive by name", () => {
        const polkaArchive = lookupFireSquidArchive("polkadot")[0].url
        assert(polkaArchive === "https://polkadot.archive.subsquid.io/graphql")
    })

    it("lookups up v5 archive by name", () => {
        const polkaArchive = lookupV5Archive("polkadot")[0].url
        assert(polkaArchive === "https://polkadot.indexer.gc.subsquid.io/v4/graphql")
    })
})