import { task } from "hardhat/config";

task("stake", "Stakes your tokens")
    .addParam("amount", "amount of tokens to approve")
    .setAction(async (taskArgs, hre) => {
        const staking = await hre.ethers.getContractAt("Staking", "0xfB9709c3be3dc236da564250d4259B78f1C66E9A");
        await staking.stake(taskArgs.amount);
        console.log("success");
    });