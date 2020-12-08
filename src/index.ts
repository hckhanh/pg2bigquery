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
    {
      name: "dataset",
      required: true,
      description: "destination dataset name in BigQuery database",
    },
    {
      name: "tables",
      required: true,
      description: "path to list of tables (in json format)",
      default: "tables.json",
    },
  ];

  async run() {
    const { args, flags } = this.parse(Pg2Bigquery);
    const input = path.resolve(args.input);
    const tables = path.resolve(args.tables);
    const output = path.resolve(args.output);

    // create output folder
    await fs.mkdir(output, { recursive: true });

    flags.clean && (await cleanUp(output));

    // get all input files
    cli.action.start("get input files");
    const files = await fs.readdir(input);
    cli.action.stop(`${files.length} files`);

    // get table regexes
    const tableRegexes = await getTableRegexes(tables);

    // convert all files
    cli.action.start(`convert ${files.length} files`);
    const filePromises = [];
    for (const file of files) {
      filePromises.push(
        convertFile(file, input, output, args.dataset, tableRegexes)
      );
    }

    await Promise.all(filePromises);
    cli.action.stop();
  }
}

export = Pg2Bigquery;
