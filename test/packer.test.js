import fs from "fs";

const packer = JSON.parse(fs.readFileSync("./logstash.json"));

const validRegions = ["eu-west-1", "eu-central-1", "eu-north-1"];
const ourAccounts = ["1111", "2222", "3333", "4444"];
const otherOwners = ["amazon", "099720109477" /*canonical*/];

const variablePattern = (name, scope = "user") =>
  new RegExp("{{\\s*" + scope + "\\s*`" + name + "`\\s*}}");

describe("packer config", () => {
  describe("variables", () => {
    it("should have a variable for who can use the ami", () => {
      expect(packer.variables).toHaveProperty("ami_users");
    });

    it("should read ami_users from AMI_ACCOUNTS", () => {
      const variable = variablePattern("AMI_ACCOUNTS", "env");
      expect(packer.variables.ami_users).toMatch(variable);
    });
  });

  describe("ami builder", () => {
    it("should be based on a whitelisted owner", () => {
      const allOwners = ourAccounts.concat(otherOwners);
      const onlyInvalid = (owners = ["NO OWNER SPECIFIED"]) =>
        owners.filter(owner => allOwners.includes(owner) == false);

      packer.builders
        .filter(builder => builder.source_ami_filter)
        .forEach(builder => {
          const invalidOwners = onlyInvalid(builder.source_ami_filter.owners);
          expect(invalidOwners).toEqual([]);
        });
    });

    it("should be in a whitelisted region", () => {
      packer.builders.forEach(builder => {
        expect(validRegions).toContain(builder.region);
      });
    });

    const cases = [
      ["ami_users", "ami_users"],
      ["access_key", "aws_access_key"],
      ["secret_key", "aws_secret_key"]
    ];

    it.each(cases)("should set the %s to %s", (property, variableName) => {
      const variable = variablePattern(variableName);

      packer.builders.forEach(builder => {
        expect(builder[property]).toMatch(variable);
      });
    });
  });
});
