import Transport from "@ledgerhq/hw-transport-node-hid";
import AppEth from "@ledgerhq/hw-app-eth";
import { Transaction as Tx } from "ethereumjs-tx";
import Web3 from "web3";
import abi from "./abi.json";

const web3 = new Web3("https://mainnet.infura.io:443");

const cbrl = new web3.eth.Contract(abi, "");

async function main() {
  const index = 1;
  const devices = await Transport.list();
  if (devices.length === 0) throw "no device";
  const transport = await Transport.create();
  const eth = new AppEth(transport);

  const txData = {
    nonce: web3.utils.toHex(0),
    gasLimit: web3.utils.toHex(21000),
    gasPrice: web3.utils.toHex(20e9), // 20 Gwei
    to: "0x541Ef339F71d15C9401F50e0e2b1632A276e67Ee",
    from: "0x08437Bc9E3C317f9c00b584fF8D29a8EF0A2783E",
    value: web3.utils.toHex(web3.utils.toWei(web3.utils.toBN(1), "ether")), // eth
  };

  const tx = new Tx(txData, { chain: "mainnet" });

  const serializedTx = tx.serialize().toString("hex");
  const sig = await eth.signTransaction(`44'/60'/0'/${index}`, serializedTx);
  txData.v = "0x" + sig.v;
  txData.r = "0x" + sig.r;
  txData.s = "0x" + sig.s;

  const signedTx = new Tx(txData);
  const signedSerializedTx = signedTx.serialize().toString("hex");
  const txHash = await web3.eth.sendSignedTransaction(
    "0x" + signedSerializedTx
  );
  console.log(txHash);
}

main();
