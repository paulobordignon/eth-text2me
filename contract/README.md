### about the contract

Using hardhat and Alchemy the contract was deployed on Goerli testnet network and the address is: 0x64C189e96Eb2Dbb770991d4fF41f44582FfA0aC9.

If you want clone the repository, first fill in your keys and run:

```shell
npx hardhat run scripts/run.js
```

To do a local deploy, run:
```shell
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

If you want to deploy on some online network, First fill in your alchemy key and your wallet private key in hardhat.config.js, then run:
```shell
npx hardhat run scripts/deploy.js --network goerli
```