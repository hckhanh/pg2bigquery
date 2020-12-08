import { Command, flags } from "@oclif/command";
import cli from "cli-ux";
import { promises as fs } from "fs";
import path from "path";
import { cleanUp, convertFile, getTableRegexes } from "./utils";

class Pg2Bigquery extends Command {
  static description = "describe the command here";

  static flags = {
    version: flags.version({ char: "v" }),
    help: flags.help({ char: "h" }),
    clean: flags.boolean({
      char: "c",
      description: "clean output folder before converting files",
    }),
    dataset: flags.string({
      char: "d",
      required: true,
      description: "destination dataset name in BigQuery database",
    }),
    tables: flags.string({
      char: "t",
      required: true,
      description: "path to a file contains list of tables (in json format)",
    }),
  };

  static args = [
    {
      name: "input",
      required: true,
      description:
        "input path to PostgresSQL file or folder contains query files",
    },
    {
      name: "output",
      required: true,
      description: "output path to BigQuery folder contains query files",
    },
  ];

  async run() {
    const { args, flags } = this.parse(Pg2Bigquery);
    const input = path.resolve(args.input);
    const tables = path.resolve(flags.tables);
    const output = path.resolve(args.output);

    // create output folder
    cli.action.start("checking output folder");
    await fs.mkdir(output, { recursive: true });
    cli.action.stop();

    if (flags.clean) {
      cli.action.start("cleaning output folder");
      await cleanUp(output);
      cli.action.stop();
    }

    // get all input files
    cli.action.start("getting input files");
    const files = await fs.readdir(input);
    cli.action.stop(`${files.length} files`);

    // get table regexes
    cli.action.start("getting tables");
    const tableRegexes = await getTableRegexes(tables);
    cli.action.stop(`${tableRegexes.length} tables`);

    // convert all files
    cli.action.start(`converting ${files.length} files`);
    const filePromises = [];
    for (const file of files) {
      filePromises.push(
        convertFile(file, input, output, flags.dataset, tableRegexes)
      );
    }

    await Promise.all(filePromises);
    cli.action.stop();
  }
}

export = Pg2Bigquery;
