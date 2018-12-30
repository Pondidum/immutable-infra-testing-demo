import fs from "fs";
import path from "path";
import { DiffPatcher, formatters } from "jsondiffpatch";
import { execute } from "../machine";

const readFile = filename =>
  fs
    .readFileSync(filename, "utf8")
    .split("\n")
    .map(str => str.trim())
    .filter(str => str.length)
    .filter(str => /^\{.*\}$/.test(str)) // starts with '{' and ends with '}'
    .map(line => {
      const o = JSON.parse(line);
      // convert the message property from json string to actual object
      if (o.message && o.message.startsWith('{"')) {
        o.message = JSON.parse(o.message);
      }
      return o;
    });

describe("logstash", () => {
  beforeAll(() => execute("/vagrant/scripts/test.sh"), Number.MAX_SAFE_INTEGER);

  const source = "./test/acceptance";
  const isDirectory = p => fs.lstatSync(p).isDirectory();

  const cases = fs
    .readdirSync(source)
    .map(name => path.join(source, name))
    .filter(isDirectory);

  test.each(cases)("%s", directoryPath => {
    const expected = readFile(path.join(directoryPath, "output.log"));
    const actual = readFile(path.join(directoryPath, "result.log"));

    const diffpatch = new DiffPatcher({
      propertyFilter: (name, context) => {
        if (name !== "id") {
          return true;
        }

        return context.left.id !== "<generated>";
      }
    });
    const delta = diffpatch.diff(expected, actual);
    const output = formatters.console.format(delta);

    if (output.length) {
      console.log(output);
    }

    expect(output.length).toBe(0);
  });
});
