import { task } from "hardhat/config";

task("tTransfer", "Transfer token")
    .addParam("token", "deployed contract addresss")
    .addParam("to", "to address")
    .addParam("amount", "amount of tokens to approve")
    .setAction(async (taskArgs, hre) => {
        const token = await hre.ethers.getContractAt("ZepToken", taskArgs.token);
        const transfer = await token.transfer(taskArgs.to,taskArgs.amount);
        console.log("Created with tx hash: "+ transfer.hash);
    });