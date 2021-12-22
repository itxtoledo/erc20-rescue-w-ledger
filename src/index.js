import "dotenv/config";
import Transport from "@ledgerhq/hw-transport-node-hid";
import AppEth from "@ledgerhq/hw-app-eth";
import { Transaction as Tx } from "ethereumjs-tx";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import Web3 from "web3";
import abi from "./abi.json";

const CHAIN_ID = 3; // mainnet is 1 ropsten is 3
const CHAIN = "ropsten"; // can be ropsten or mainnet
const GAS_PRICE = 10; // in gwei

const argv = yargs(hideBin(process.argv))
  .positional("owner", {
    describe: "owner address that you need withdrawal tokens",
    type: "string",
  })
  .positional("path", {
    describe: "derivation path of the owner",
    type: "string",
  }).argv;

const OWNER_ADDRESS = argv.owner;
const DERIVATION_PATH = process.env.BASE_PATH + argv.path;

const RESCUE_ADDRESS = process.env.RESCUE_ADDRESS;
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;

console.log("Owner Address:", OWNER_ADDRESS);
console.log("Derivation Path:", DERIVATION_PATH);

// MetaMask default RPC
const web3 = new Web3(
  "https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
);

const token = new web3.eth.Contract(abi, TOKEN_ADDRESS);

async function main() {
  const devices = await Transport.list();
  if (devices.length === 0) throw "no device";
  const transport = await Transport.create();
  const eth = new AppEth(transport);

  const tokenDecimals = await token.methods.decimals().call();
  const tokenRawBalance = await token.methods.balanceOf(OWNER_ADDRESS).call();
  const tokenFormattedBalance = tokenRawBalance / 10 ** tokenDecimals;

  const etherRawBalance = await web3.eth.getBalance(OWNER_ADDRESS);
  const etherFormattedBalance = etherRawBalance / 10 ** 18;

  console.log("Owner Ether Balance:", etherFormattedBalance, "ETH");
  console.log("Owner Token Balance:", tokenFormattedBalance, "TKN$");

  const callData = token.methods
    .transfer(RESCUE_ADDRESS, tokenRawBalance)
    .encodeABI();

  console.log("Call data:", callData);

  const txData = {
    nonce: await web3.eth.getTransactionCount(OWNER_ADDRESS),
    gasLimit: web3.utils.toHex(50000),
    gasPrice: web3.utils.toHex(GAS_PRICE * 10 ** 9), // convert wei to gwei
    to: TOKEN_ADDRESS,
    data: callData,
  };

  const tx = new Tx(txData, { chain: CHAIN });

  // hack to work https://github.com/LedgerHQ/ledgerjs/issues/436
  tx.raw[6] = Buffer.from([CHAIN_ID]); // v
  tx.raw[7] = Buffer.from([]); // r
  tx.raw[8] = Buffer.from([]); // s

  const serializedTx = tx.serialize().toString("hex");

  console.log("Serialized Tx:", serializedTx);

  console.log("Sign transaction in your device");

  const sig = await eth.signTransaction(DERIVATION_PATH, serializedTx);

  console.log("Signature:", sig);

  txData.v = "0x" + sig.v;
  txData.r = "0x" + sig.r;
  txData.s = "0x" + sig.s;

  const signedTx = new Tx(txData, { chain: CHAIN });
  const signedSerializedTx = signedTx.serialize().toString("hex");

  console.log(
    "Sender Address (only for verification): ",
    "0x" + signedTx.getSenderAddress().toString("hex")
  );

  console.log("Signed Transaction:", signedSerializedTx);

  console.log("Sending transaction.");
  const txHash = await web3.eth.sendSignedTransaction(
    "0x" + signedSerializedTx
  );

  console.log("Transaction sent.");
  console.log("TxID:", txHash);
}

main();
