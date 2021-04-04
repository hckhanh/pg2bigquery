# pg2bigquery

A CLI tool to convert query from PostgreSQL to BigQuery

![Release](https://github.com/hckhanh/pg2bigquery/workflows/Release/badge.svg)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/hckhanh/pg2bigquery.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/hckhanh/pg2bigquery/context:javascript)
[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/pg2bigquery.svg)](https://npmjs.org/package/pg2bigquery)
[![Downloads/week](https://img.shields.io/npm/dw/pg2bigquery.svg)](https://npmjs.org/package/pg2bigquery)
[![License](https://img.shields.io/npm/l/pg2bigquery.svg)](https://github.com/hckhanh/pg2bigquery/blob/master/package.json)

# Installation

For npm:

```shell
npm i -g pg2bigquery
```

or yarn:

```shell
yarn global add pg2bigquery
```

# Usage

## Requirements

```sh-session
$ pg2bigquery -d dataset -t tables.json input output
```

You need these things to use:

- **input**: input folder that contains PostgresSQL query files
- **output**: output folder that contains BigQuery query files
- **dataset**: destination dataset which is used to run BigQuery query
- **tables**: list of tables of pg database in json file

> If you want to know about the files format, go to [samples](samples)

### Tables JSON file

For now, you need to put the list of tables in a json file like this:

```json
["forms", "roles", "steps", "wards", "people", "staffs", "products"]
```

You can easily get the list of tables in your sql editor by this query:

```sql
select table_name from information_schema.tables;
```

Run `pg2bigquery` with `--help` option to get more details:

```sh-session
$ pg2bigquery --help
```

A success run will be:

```sh-session
$ pg2bigquery -d dataset -t tables.json input output
check output folder... done
get input files... 10 files
get tables... 55 tables
convert 10 files... done
```

# Limitations

> [No Silver Bullet](https://en.wikipedia.org/wiki/No_Silver_Bullet).
>
> The converted files might not be perfect.

When you use my tool, you will see these cases:

### `No matching signature for operator` (two different types)

```
No matching signature for operator = for argument types: INT64, STRING. Supported signature: ANY = ANY at [382:44]
```

BigQuery don't implicit cast one type to another when using with operators (+, -, <, >,...)
so you have to do it for yourself.
