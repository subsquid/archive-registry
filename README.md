# Squid Archive Registry

A community-owned registry of [Squid archives](https://github.com/subsquid/squid/tree/master/substrate-archive) in a json format. 

## Usage of `@subsquid/archive-registry`

The registry is available as an npm package `@subsquid/archive-registry`. It can be used to conveniently access registry files and e.g. lookup a Squid Archive by network name:

```typescript
import { lookupArchive } from '@subsquid/archive-registry'

const processor = new SubstrateProcessor("kusama_balances");
processor.setDataSource({
  archive: lookupArchive("kusama"), 
  chain: "wss://kusama-rpc.polkadot.io",
});

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

To contribute a new archive, make a PR updating `registry.json` specifying the network name and the url.
