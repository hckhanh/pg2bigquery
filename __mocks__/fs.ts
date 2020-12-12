export const promises = {
  async readFile(file: string) {
    if (file.includes("tables.json")) {
      const tables = ["users", "roles", "products", "orders", "addresses"];
      return JSON.stringify(tables);
    }

    if (file.includes("test.sql")) {
      return "postgres query";
    }

    return "";
  },
  async readdir() {
    // 2 files, 1 folder
    return [
      {
        name: "query1.sql",
        isFile: () => true,
        isDirectory: () => false,
      },
      {
        name: "query2.sql",
        isFile: () => true,
        isDirectory: () => false,
      },
      {
        name: "queries",
        isFile: () => false,
        isDirectory: () => true,
      },
    ];
  },
  unlink: jest.fn(),
  rm: jest.fn(),
  writeFile: jest.fn(),
};
