import { promises as fs } from "fs";
import * as path from "path";
import { postgres2Bigquery } from "../src/core";
import { cleanUp, convertFile, getTableRegexes } from "../src/utils";

jest.mock("fs");
jest.mock("../src/core");

describe("utils", () => {
  describe("getTableRegexes", () => {
    it("should get table regexes from tables.json", async () => {
      const tableRegexes = await getTableRegexes("./tables.json");
      expect(tableRegexes).toContainEqual(/(\W)(users)(\W)/g);
      expect(tableRegexes).toContainEqual(/(\W)(products)(\W)/g);
      expect(tableRegexes).toHaveLength(5);
    });
  });

  describe("cleanUp", () => {
    it("should clean up 2 files and 2 folder", async () => {
      await cleanUp("./test");
      expect(fs.unlink).toBeCalledTimes(2);
      expect(fs.rm).toBeCalledTimes(1);
    });
  });

  describe("convertFile", () => {
    it("should read from input and write the converted query to output", async () => {
      const output = "./converted";
      const file = "test.sql";
      const dataset = "demo_dataset";

      await convertFile(file, "./test", output, dataset, []);

      expect(postgres2Bigquery).toBeCalledWith("postgres query", dataset, []);
      expect(fs.writeFile).toBeCalledWith(
        path.join(output, file),
        "bigquery query",
        { mode: 448 }
      );
    });
  });
});
