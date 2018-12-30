import { spawnSync } from "child_process";
import { createConnection } from "net";

const host = process.env.LOGSTASH_ADDRESS; // e.g. "172.27.48.28";
const sshUser = process.env.LOGSTASH_SSH; // vagrant
const keyPath = process.env.LOGSTASH_KEYPATH; // ".vagrant/machines/default/hyperv/private_key";

export const execute = command => {
  const args = [`${sshUser}@${host}`, `-i`, keyPath, command];
  const ssh = spawnSync("ssh", args, { encoding: "utf8" });
  const lines = ssh.stdout.split("\n");

  const last = lines.length - 1;

  if (lines[last] === "") {
    return lines.slice(0, last);
  }
  return lines;
};

export const testPort = port =>
  new Promise((resolve, reject) => {
    const client = createConnection({ host: host, port: port });

    client.on("error", err => reject(err));
    client.on("connect", () => {
      client.end();
      resolve();
    });
  });
