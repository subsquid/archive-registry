# Squid Archive Registry

A community-owned registry of [Squid archives](https://github.com/subsquid/squid/tree/master/substrate-archive) in a json format. 

## Usage of `@subsquid/archive-registry`

The registry is available as an npm package `@subsquid/archive-registry`. It can be used to conveniently access registry files and e.g. lookup a Squid Archive by network name:

```typescript
import { lookupArchive } from '@subsquid/archive-registry'

const processor = new SubstrateProcessor("kusama_balances");
processor.setDataSource({
  archive: lookupArchive("kusama")[0].url, 
  chain: "wss://kusama-rpc.polkadot.io",
});

```

`lookupArchive()` supports additional filtering by genesis hash, archive version (semver range) and docker image names (of archive and archive gateway).

There is also a convenience method to get network infomation by its name:
```typescript
import { getChainInfo } from '@subsquid/archive-registry'

const info = getChainInfo("kusama")
console.log(info.genesisHash) // 0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe
```



## What is a Squid Archive?

Squid Archive provides easy access to the historical on-chain data with little modifications. It is essential for [Squid pipelines](https://github.com/subsquid/squid-template). It can also be used on its own as a [GraphQL-based](https://graphql.org/) block explorer with powerful filtering and search capabilities over historical events and transactions.


## How to use an Archive ?

The primary use case of a Squid Archive is to serve data to a [Squid Processor](https://github.com/subsquid/squid/tree/master/substrate-processor)

The urls are not supposed to be accessed with a browser. To explore the endpoint with an interactive and human-friendly console, replace `/graphql` with `/console` in the url. 

For example, for exploring Kusama historical data, open `https://kusama.indexer.gc.subsquid.io/v4/console` and use the pane on right hand side to filter (`where:`) and pick the fields of interest.

For example, the following query will return details on the last 10 transfers:

```gql
query RecentBalancesTransfers {
  substrate_event(where: {name: {_eq: "balances.Transfer"}}, limit: 10, order_by: {blockNumber: desc}) {
    blockNumber
    blockId
    data
  }
}
```

To learn more how to construct the queries, consult [Hasura Docs](https://hasura.io/docs/latest/graphql/core/databases/postgres/queries/index.html)

## How to contribute

To contribute a new archive, make a PR updating `archives.json` specifying the network name and the url. Further, one has to regenerate types in `src/chains.ts` by running `npm run gen-types`. This will update the list of supported chain names and makes it easier to developers to discover which lookups will succeed at compile time.
