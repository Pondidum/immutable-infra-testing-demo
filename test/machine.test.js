import { spawnSync } from "child_process";
import { createConnection } from "net";

const host = process.env.LOGSTASH_ADDRESS; // e.g. "172.27.48.28";
const sshUser = process.env.LOGSTASH_SSH; // vagrant
const keyPath = process.env.LOGSTASH_KEYPATH; // ".vagrant/machines/default/hyperv/private_key";

const execute = command => {
  const args = [`${sshUser}@${host}`, `-i`, keyPath, command];
  const ssh = spawnSync("ssh", args, { encoding: "utf8" });
  const lines = ssh.stdout.split("\n");

  const last = lines.length - 1;

  if (lines[last] === "") {
    return lines.slice(0, last);
  }
  return lines;
};

const testPort = port =>
  new Promise((resolve, reject) => {
    const client = createConnection({ host: host, port: port });

    client.on("error", err => reject(err));
    client.on("connect", () => {
      client.end();
      resolve();
    });
  });

describe("the machine", () => {
  it("should have the correct configuration", () => {
    const result = execute("find /etc/logstash/conf.d/* -type f");

    expect(result).toEqual(["/etc/logstash/conf.d/beats.conf"]);
  });

  it("should be listening on 5044 for beats", () => testPort(5044));
  it("should not be listening on 9600", () =>
    expect(testPort(9600)).rejects.toThrow("ECONNREFUSED"));
});
