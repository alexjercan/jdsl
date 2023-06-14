import { readFileSync } from "fs";
import path from "path";
import { spawn } from "child_process";

function cmd(...command) {
  let p = spawn(command[0], command.slice(1));
  let result = "";
  return new Promise((resolveFunc) => {
    p.stdout.on("data", (x) => { result += x; });
    p.stderr.on("data", (x) => { result += x; });
    p.on("exit", (_) => { resolveFunc(result); });
  });
}

async function checkout(remote) {
    await cmd("svn", "checkout", remote);
}

async function update(revision) {
    await cmd("svn", "update", "-r", revision);
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
        await update(revision);
        prototypes.push(loadJS(path.resolve(process.cwd(), `${name}.js`)));
    }

    let prefix = `function ${className}() {}`;
    let body = prototypes.join("\n");
    let suffix = `return ${className};`;

    return new Function([prefix, body, suffix].join("\n"))();
}

export async function init(remote) {
    await checkout(remote);
}

export async function run(className, functionName) {
    let entry = await createClass(className);
    new entry()[functionName]();

    update("HEAD");
}
