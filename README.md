# ERC20 Rescuer with Ledger 

Code for rescuing ERC20 tokens from specific addresses using a ledger hardware wallet.

When you use a custom BIP44 derivation path, or when the wallets' default look ahead isn't enough, your ERC20 tokens might get inaccessible by a regular ETH wallet. This tool allows you to access any address provided you know its BIP44 derivation path, using a Ledger Wallet.

## Requirements

NodeJS v12 or above


## Setup

1. Run `npm install`

2. Create an `.env` on the project root using `.env.example` as model:

```
BASE_PATH=m/44'/60'/1'/0/  -- BIP44 base path
TOKEN_ADDRESS=0xA6FA6531acDf1f9F96EDdD66a0F9481E35c2e42A  -- the token contract address
RESCUE_ADDRESS=0xDD85F9CB462F38e2c34dE38EcC9135030D8ADcbd  -- the destination address
```



## Running

`node -r esm src/index.js --owner=<eth-address> --path=<bip44-index>`

where `eth-address` is the address where the ERC20 tokens are currently on, and `bip44-index` is an integer corresponding to the BIP44 ending that will get concatenated to the `BASE_PATH` provided in `.env`.
