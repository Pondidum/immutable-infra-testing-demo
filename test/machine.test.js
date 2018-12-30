import { execute, testPort } from "./machine";

describe("the machine", () => {
  it("should have the correct configuration", () => {
    const result = execute("find /etc/logstash/conf.d/* -type f");

    expect(result).toEqual([
      "/etc/logstash/conf.d/beats.conf",
      "/etc/logstash/conf.d/input.conf",
      "/etc/logstash/conf.d/output.conf"
    ]);
  });

  it("should be listening on 5044 for beats", () => testPort(5044));
  it("should not be listening on 9600", () =>
    expect(testPort(9600)).rejects.toThrow("ECONNREFUSED"));
});
