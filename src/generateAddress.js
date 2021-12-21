import "dotenv/config";
import Transport from "@ledgerhq/hw-transport-node-hid";
import AppEth from "@ledgerhq/hw-app-eth";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

const argv = yargs(hideBin(process.argv)).positional("path", {
  describe: "derivation path of the owner",
  type: "string",
}).argv;

const DERIVATION_PATH = process.env.BASE_PATH + argv.path;

console.log("Derivation Path:", DERIVATION_PATH);

async function main() {
  const devices = await Transport.list();
  if (devices.length === 0) throw "no device";
  const transport = await Transport.create();
  const eth = new AppEth(transport);

  const addr = await eth.getAddress(DERIVATION_PATH);

  console.log("Address:", addr);
}

main();
