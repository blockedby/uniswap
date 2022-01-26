import { task } from "hardhat/config";
// require("@nomiclabs/hardhat-web3");

task("approve", "Approves account to transferFrom")
    .addParam("token", "deployed contract addresss")
    .addParam("spender", "to allow to")
    .addParam("amount", "amount of tokens to approve")
    // .addParam("sender", "approve from")
    .setAction(async (taskArgs, hre) => {
        // const provider = hre.ethers.provider;
        // const sender = await provider.getSigner(taskArgs.sender);
        // const owner = await sender.getAddress();
        // const token = await hre.ethers.getContractAt("ZepToken", taskArgs.token);
        // await token.connect(sender).approve(taskArgs.spender, taskArgs.amount);
        // await token.allowance(owner, taskArgs.spender);
        const token = await hre.ethers.getContractAt("ZepToken", taskArgs.token);
        await token.approve()
    });