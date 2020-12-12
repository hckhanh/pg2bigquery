import sqlFormatter from "sql-formatter";
import { dataTypeRegexes } from "./postgres";

const timeOperators: { [operator: string]: string } = {
  "+": "ADD",
  "-": "SUB",
};

function removeTypeCasts(query: string): string {
  for (const typeRegex of dataTypeRegexes) {
    query = query.replace(typeRegex, "");
  }

  return query;
}

function addPrefixDatasetToTables(
  tableRegexes: RegExp[],
  query: string,
  dataset: string
): string {
  for (const tableRegex of tableRegexes) {
    query = query.replace(tableRegex, function (substring: string) {
      const regex = new RegExp(tableRegex.source);
      const matches = regex.exec(substring);

      if (matches && matches[3] !== ".") {
        return `${matches[1]}${dataset}.${matches[2]}${matches[3]}`;
      }

      return substring;
    });
  }

  return query;
}

function convertTimeCalculations(query: string): string {
  query = query.replace(
    /(\('now'\)|'now') ([+-]) (\d+)/g,
    function (substring: string) {
      const matches = substring.match(/(\('now'\)|'now') ([+-]) (\d+)/);

      if (matches) {
        const operator = timeOperators[matches[2]];
        return `TIMESTAMP_${operator}(CURRENT_TIMESTAMP(), INTERVAL ${matches[3]} DAY)`;
      }

      return substring;
    }
  );

  return query;
}

function convertFindAnyInArrays(query: string): string {
  return query.replace(/ = ANY /gi, " IN UNNEST ");
}

function convertCheckAllInArrays(query: string): string {
  return query.replace(/ <> ALL /gi, " NOT IN UNNEST ");
}

function removeQuotesForNumber(query: string): string {
  return query.replace(/'\d+'/g, function (substring: string) {
    const matches = substring.match(/'(\d+)'/);
    if (matches) {
      return matches[1];
    }
    return substring;
  });
}

function convertDatePartFunction(query: string): string {
  return query.replace(
    /date_part\('\w+', [\w.]+\)/gi,
    function (substring: string) {
      const matches = substring.match(/date_part\('(\w+)', ([\w.]+)\)/);
      if (matches) {
        return `EXTRACT(${matches[1].toUpperCase()} FROM ${matches[2]})`;
      }
      return substring;
    }
  );
}

function castElseCaseToString(query: string): string {
  return query.replace(/ELSE \(EXTRACT \(.+/gi, function (substring: string) {
    const matches = substring.match(/ELSE (.+)/);
    if (matches) {
      return `ELSE CAST(${matches[1]} AS STRING)`;
    }
    return substring;
  });
}

export function postgres2Bigquery(
  pgQuery: string,
  dataset: string,
  tableRegexes: RegExp[]
): string {
  let bQuery = sqlFormatter.format(pgQuery);

  bQuery = removeTypeCasts(bQuery);
  bQuery = addPrefixDatasetToTables(tableRegexes, bQuery, dataset);
  bQuery = convertTimeCalculations(bQuery);
  bQuery = convertFindAnyInArrays(bQuery);
  bQuery = convertCheckAllInArrays(bQuery);
  bQuery = removeQuotesForNumber(bQuery);
  bQuery = convertDatePartFunction(bQuery);
  bQuery = castElseCaseToString(bQuery);

  return sqlFormatter.format(bQuery);
}
