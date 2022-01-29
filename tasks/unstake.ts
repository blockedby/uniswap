import { task } from "hardhat/config";

task("unstake", "Returning tokens")
    .setAction(async (taskArgs, hre) => {
        const staking = await hre.ethers.getContractAt("Staking", "0xfB9709c3be3dc236da564250d4259B78f1C66E9A");
        await staking.unstake();
        console.log("success");
    });