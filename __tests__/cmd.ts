import { exec as execCallback } from "child_process";
import { promisify } from "util";

const exec = promisify(execCallback);

describe("cmd", () => {
  it("should convert the query file successfully", async () => {
    const output = await exec(
      "node bin/run -d demo_dataset -t samples/tables.json samples converted_samples"
    );

    expect(output.stderr).toBe(
      "check output folder... done\n" +
        "get input files... 2 files\n" +
        "get tables... 5 tables\n" +
        "convert 2 files... done\n"
    );
  });

  it("should not accept the same input and output", () => {
    const output = exec(
      "node bin/run -d demo_dataset -t samples/tables.json samples samples"
    );

    return expect(output).rejects.toThrow(
      "input and output cannot be the same path"
    );
  });
});
