import { Command, Option } from "commander";
import Table from "easy-table";
import { runProgram } from "@subsquid/util-internal";
import { archivesRegistryEVM, archivesRegistrySubstrate } from "../registry";

runProgram(async () => {
    let program = new Command();

    program.description(`Display list of available archives`);
    program.addOption(
        new Option(`-t --type <string>`, `Network type`).choices([
            `evm`,
            `substrate`,
        ])
    );
    program.addOption(
        new Option(`-r --release <string>`, `Release name`).choices([
            `FireSquid`,
            `ArrowSquid`,
        ])
    );

    program.parse();
    let opts: {
        type?: "substrate" | "evm";
        release?: "FireSquid" | "ArrowSquid";
    } = program.opts();

    const filter: Filter = { release: opts.release };

    switch (opts.type) {
        case "evm":
            printEvmArchives(filter);
            break;
        case "substrate":
            printSubstrateArchives(filter);
            break;
        case null:
        case undefined:
            printEvmArchives(filter);
            printSubstrateArchives(filter);
            break;
    }
});

interface Filter {
    release?: string;
}

function printEvmArchives(filter: Filter) {
    console.log(`EVM archives:`);
    let table = new Table();
    table.pushDelimeter(["network", "release", "endpoint"]);
    for (let archive of archivesRegistryEVM().archives) {
        table.cell("network", archive.network);
        for (let provider of archive.providers) {
            if (filter.release != null && filter.release != provider.release)
                continue;

            table.cell("release", provider.release);
            table.cell("endpoint", provider.dataSourceUrl);
            table.newRow();
        }
    }

    console.log(table.print());
}

function printSubstrateArchives(filter: Filter) {
    console.log(`Substrate archives:`);
    let table = new Table();
    table.pushDelimeter(["network", "release", "endpoint"]);
    for (let archive of archivesRegistrySubstrate().archives) {
        table.cell("network", archive.network);
        for (let provider of archive.providers) {
            if (filter.release != null && filter.release != provider.release)
                continue;

            table.cell("release", provider.release);
            table.cell("endpoint", provider.dataSourceUrl);
            table.newRow();
        }
    }

    console.log(table.print());
}
