// import * as dotenv from "dotenv";
import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
// to verify contracts
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
// import "hardhat-gas-reporter";
import "solidity-coverage";

// import "@uniswap/v2-core";
// import "@uniswap/v2-periphery";

import "./tasks/index";
import "@nomiclabs/hardhat-ethers" /* fixed "hre.ethers" error */
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(await account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

export default {
  defaultNetwork: "rinkeby",
  networks: {
    hardhat: {
    },
    rinkeby: {
      url: "https://eth-rinkeby.alchemyapi.io/v2/tC8Wohz7VjyYMdWLkmMhhdLeEuy5TsF7",
      accounts: [
        "e99fd9144775fe7d3a2550d6a004bb1545662f41536ecce4f8501477fe13ab9d",
        "b84fb60c89b03079467e9737114ce241381521594f3778ee1316c227b355a455",
      ],
    }
  },
  etherscan:{
    apiKey:"ZMIBQNQKVFYZAWN787W7YA2E6QPTCFQNTZ",
  },
  solidity: {
    compilers: [
      {
        version: "0.8.4",
      },
      {
        version: "0.6.6",
      },
    ]
  }
};
