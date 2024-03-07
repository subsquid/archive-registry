# Squid Archive Registry

A community-owned registry of Squid archives in a json format.

## Usage of `@subsquid/archive-registry`

The registry is available as an npm package `@subsquid/archive-registry`. It can be used to conveniently access registry files and e.g. lookup a Substrate Squid Archive or EVM Squid Archive by network name.

### Listing the available networks

Use the included `squid-archive-registry` executable to list supported networks:

```bash
$ squid-archive-registry --help
Usage: run [options]

Display list of available archives

Options:
  -t --type <type>  Network type (choices: "evm", "substrate")
  -h, --help        display help for command
```

### Substrate archives

The first argument is the name of the network. The second argument is set of lookup filters of type `LookupOptionsSubstrate`.

```typescript
import { lookupArchive } from '@subsquid/archive-registry'

const processor = new SubstrateProcessor()
  .setDataSource({
    archive: lookupArchive("kusama"),
  });
```

More accurate way to choose from Substrate networks is to specify `type` parameter inside options for the function. By default `type` is set to `Substrate`.

```typescript
const processor = new SubstrateProcessor()
  .setDataSource({
    archive: lookupArchive("kusama", { type: "Substrate" }),
  });
```

`LookupOptionsSubstrate` supports additional filtering by genesis hash, archive version (semver range) and docker image names (of archive and archive gateway).

There is also a convenience method to get network information by its name:
```typescript
  // ...
  .setDataSource({
    archive: lookupArchive("kusama", { genesis: "0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe" }),
  });
```

### EVM archives

Similar to Substrate archive: first argument is the name of the network, second one is a set of lookup filters of type `LookupOptionsEVM`.

```typescript
import { lookupArchive } from '@subsquid/archive-registry'

const processor = new EvmBatchProcessor()
  .setDataSource({
    archive: lookupArchive("avalanche"),
  });
```

`LookupOptionsEVM` supports additional filtering by release type:

There is also a convenience method to get network information by its name:
```typescript
  // ...
  .setDataSource({
    archive: lookupArchive("avalanche", { type: "EVM", release: "ArrowSquid" }),
  });
```

## What is a Squid Archive?

Squid Archive provides easy access to the historical on-chain data with little modifications. It is essential for [Substrate Squid pipelines](https://github.com/subsquid/squid-substrate-template) or [EVM Squid pipelines](https://github.com/subsquid/squid-evm-template). It can also be used on its own as a [GraphQL-based](https://graphql.org/) block explorer with powerful filtering and search capabilities over historical events and transactions.

## How to use an Archive?

The primary use case of a Squid Archive is to serve data to a [Substrate Squid Processor](https://github.com/subsquid/squid-sdk/tree/master/substrate/substrate-processor) or [EVM Squid Processor](https://github.com/subsquid/squid-sdk/tree/master/evm/evm-processor). The urls are not supposed to be accessed with a browser.

## How to suggest a network

To suggest a new network, make an issue with all information about the network: name, cebab-case name, RPC endpoint and link to an block explorer. Please do not forget about the sensitivity of the information you post (for example, private endpoints). We will review your request and contact you if necessary.
