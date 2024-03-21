import assert from "assert";
import {
    ArchiveRegistrySubstrate,
    ArchiveRegistryEVM,
    lookupInSubstrateRegistry,
    lookupInEVMRegistry,
} from ".";

const mockRegistrySubstrate: ArchiveRegistrySubstrate = {
    archives: [
        {
            network: "polkadot",
            providers: [
                {
                    provider: "subsquid",
                    dataSourceUrl:
                        "https://polkadot.archive.subsquid.io/graphql",
                    release: "FireSquid",
                },
            ],
            genesisHash:
                "0xfe58ea77779b7abda7da4ec526d14db9b1e9cd40a217c34892af80a9b332b76d",
        },
        {
            network: "moonbase",
            providers: [
                {
                    provider: "subsquid",
                    dataSourceUrl:
                        "https://moonbase.archive.subsquid.io/graphql",
                    release: "FireSquid",
                },
                {
                    provider: "subsquid",
                    dataSourceUrl:
                        "https://v2.archive.subsquid.io/network/moonbase-substrate",
                    release: "ArrowSquid",
                },
            ],
        },
    ],
};

const mockRegistryEVM: ArchiveRegistryEVM = {
    archives: [
        {
            network: "binance",
            providers: [
                {
                    provider: "subsquid",
                    dataSourceUrl: "https://binance.archive.subsquid.io",
                    release: "FireSquid",
                },
            ],
        },
        {
            network: "moonbase",
            providers: [
                {
                    provider: "subsquid",
                    dataSourceUrl: "https://moonbase-evm.archive.subsquid.io",
                    release: "FireSquid",
                },
            ],
        },
    ],
};

describe("archive lookup", function () {
    it("looks up by archive name", () => {
        const polkaArchive = lookupInSubstrateRegistry(
            "polkadot",
            mockRegistrySubstrate
        )[0].dataSourceUrl;
        assert.equal(
            polkaArchive,
            "https://polkadot.archive.subsquid.io/graphql"
        );
    });

    it("looks up by archive name with specified release 1", () => {
        const polkaArchive = lookupInSubstrateRegistry(
            "moonbase",
            mockRegistrySubstrate,
            { release: "FireSquid" }
        )[0].dataSourceUrl;
        assert.equal(
            polkaArchive,
            "https://moonbase.archive.subsquid.io/graphql"
        );
    });

    it("looks up by archive name with specified release 2", () => {
        const polkaArchive = lookupInSubstrateRegistry(
            "moonbase",
            mockRegistrySubstrate,
            { release: "ArrowSquid" }
        )[0].dataSourceUrl;
        assert.equal(
            polkaArchive,
            "https://v2.archive.subsquid.io/network/moonbase-substrate"
        );
    });

    it("looks up by a named version", () => {
        const polkaArchive = lookupInSubstrateRegistry(
            "polkadot",
            mockRegistrySubstrate
        )[0].dataSourceUrl;
        assert.equal(
            polkaArchive,
            "https://polkadot.archive.subsquid.io/graphql"
        );
    });

    it("lookups up by name and genesis hash", () => {
        const polkaArchive = lookupInSubstrateRegistry(
            "polkadot",
            mockRegistrySubstrate,
            {
                genesis:
                    "0xfe58ea77779b7abda7da4ec526d14db9b1e9cd40a217c34892af80a9b332b76d",
            }
        )[0].dataSourceUrl;
        assert.equal(
            polkaArchive,
            "https://polkadot.archive.subsquid.io/graphql"
        );
    });

    it("fails to lookup by wrong hash", () => {
        assert.throws(
            () =>
                lookupInSubstrateRegistry("polkadot", mockRegistrySubstrate, {
                    genesis: "0xaaa",
                }),
            Error
        );
    });

    it("looks up by evm archive name", () => {
        const binanceArchive = lookupInEVMRegistry(
            "binance",
            mockRegistryEVM
        )[0].dataSourceUrl;
        assert.equal(binanceArchive, "https://binance.archive.subsquid.io");
    });
});
