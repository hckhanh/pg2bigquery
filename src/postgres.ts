/**
 * All data types of PostgresSQL that are not available in BigQuery will be here
 */
const dataTypes = [
  "text",
  "date",
  "bigint",
  "character varying",
  "double precision",
];

export const dataTypeRegexes = dataTypes.map(
  (type) => new RegExp("\\s?::\\s?" + type, "gi")
);
