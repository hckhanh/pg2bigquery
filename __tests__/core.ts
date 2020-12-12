import sqlFormatter from "sql-formatter";
import { postgres2Bigquery } from "../src/core";
import { getTableRegexes } from "../src/utils";

jest.mock("fs");

let tableRegexes: RegExp[];

describe("core", () => {
  beforeAll(async () => {
    tableRegexes = await getTableRegexes("./tables.json");
  });

  it("should remove type casts in unavailable type list", async () => {
    const query = `
      SELECT created_at::date AS start_date
      FROM users
      WHERE role = 'admin'::text;
    `;

    const expectedQuery = `
      SELECT created_at AS start_date
      FROM demo_dataset.users
      WHERE role = 'admin';
    `;

    const bQuery = postgres2Bigquery(query, "demo_dataset", tableRegexes);
    expect(bQuery).toBe(sqlFormatter.format(expectedQuery));
  });

  it("should add prefix dataset to tables", async () => {
    const query = `
      SELECT created_at AS start_date, role, id
      FROM users, roles
      WHERE users.id = roles.user_id and role = 'admin';
    `;

    const expectedQuery = `
      SELECT created_at AS start_date, role, id
      FROM demo_dataset.users, demo_dataset.roles
      WHERE users.id = roles.user_id and role = 'admin';
    `;

    const bQuery = postgres2Bigquery(query, "demo_dataset", tableRegexes);
    expect(bQuery).toBe(sqlFormatter.format(expectedQuery));
  });

  it("should convert time calculations", async () => {
    const query = `
      SELECT *
      FROM users
      WHERE created_at > (('now'::text)::date - 30) and created_at <= ('now'::text::date-180);
    `;

    const expectedQuery = `
      SELECT *
      FROM demo_dataset.users
      WHERE created_at > (TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)) and created_at <= (TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 180 DAY));
    `;

    const bQuery = postgres2Bigquery(query, "demo_dataset", tableRegexes);
    expect(bQuery).toBe(sqlFormatter.format(expectedQuery));
  });

  it("should find products with product id array", async () => {
    const query = `
      SELECT *
      FROM products
      WHERE id = ANY (ARRAY[10, 11, 12, 14]);
    `;

    const expectedQuery = `
      SELECT *
      FROM demo_dataset.products
      WHERE id IN UNNEST (ARRAY [10, 11, 12, 14]);
    `;

    const bQuery = postgres2Bigquery(query, "demo_dataset", tableRegexes);
    expect(bQuery).toBe(sqlFormatter.format(expectedQuery));
  });

  it("should find products not in product id array", async () => {
    const query = `
      SELECT *
      FROM products
      WHERE id <> ALL (ARRAY[10, 11, 12, 14]);
    `;

    const expectedQuery = `
      SELECT *
      FROM demo_dataset.products
      WHERE id NOT IN UNNEST (ARRAY [10, 11, 12, 14]);
    `;

    const bQuery = postgres2Bigquery(query, "demo_dataset", tableRegexes);
    expect(bQuery).toBe(sqlFormatter.format(expectedQuery));
  });

  it("should remove quotes for all numbers", async () => {
    const query = `
      SELECT *
      FROM products
      WHERE id = '9' or id = 10;
    `;

    const expectedQuery = `
      SELECT *
      FROM demo_dataset.products
      WHERE id = 9 or id = 10;
    `;

    const bQuery = postgres2Bigquery(query, "demo_dataset", tableRegexes);
    expect(bQuery).toBe(sqlFormatter.format(expectedQuery));
  });

  it("should convert date_part function", async () => {
    const query = `
      SELECT id, name, date_part('day'::text, created_at) AS year
      FROM products;
    `;

    const expectedQuery = `
      SELECT id, name, EXTRACT(DAY FROM created_at) AS year
      FROM demo_dataset.products;
    `;

    const bQuery = postgres2Bigquery(query, "demo_dataset", tableRegexes);
    expect(bQuery).toBe(sqlFormatter.format(expectedQuery));
  });

  it("should cast else case of date_part to string", async () => {
    const query = `
      SELECT
        id,
        name,
        date_part('day'::text, created_at) AS year,
        CASE
          WHEN date_part('month', created_at) < 10
          THEN concat('0', date_part('month', created_at))
          ELSE date_part('month', created_at)
        END AS month
      FROM products;
    `;

    const expectedQuery = `
      SELECT
        id,
        name,
        EXTRACT(DAY FROM created_at) AS year,
        CASE
          WHEN EXTRACT(MONTH FROM created_at) < 10 THEN concat(0, EXTRACT(MONTH FROM created_at))
          ELSE CAST(EXTRACT(MONTH FROM created_at) AS STRING)
        END AS month
      FROM
        demo_dataset.products;
    `;

    const bQuery = postgres2Bigquery(query, "demo_dataset", tableRegexes);
    expect(bQuery).toBe(sqlFormatter.format(expectedQuery));
  });
});
