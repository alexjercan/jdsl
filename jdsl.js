import { readFileSync } from "fs";
import { spawn } from "child_process";
import path from "path";

function cmd(...command) {
  let p = spawn(command[0], command.slice(1));
  let result = "";
  return new Promise((resolveFunc) => {
    p.stdout.on("data", (x) => { result += x; });
    p.stderr.on("data", (x) => { result += x; });
    p.on("exit", (_) => { resolveFunc(result); });
  });
}

async function checkout(revision) {
    await cmd("svn", "checkout", revision);
}

function loadJSON(path) {
    return JSON.parse(readFileSync(new URL(path, import.meta.url)));
}

function loadJS(path) {
    return readFileSync(new URL(path, import.meta.url));
}

async function createClass(name) {
    const jdsl = loadJSON(path.resolve(process.cwd(), `${name}.json`));
    const className = jdsl.Class;
    const revisions = jdsl.Functions;

    let prototypes = [];
    for (const revision of revisions) {
        await checkout(revision);
        prototypes.push(loadJS(path.resolve(process.cwd(), `${name}.js`)));
    }

    let prefix = `function ${className}() {}`;
    let body = prototypes.join("\n");
    let suffix = `return ${className};`;

    return new Function([prefix, body, suffix].join("\n"))();
}

let className = process.argv[2];
let functionName = process.argv[3];
let entry = await createClass(className);

new entry()[functionName]();
