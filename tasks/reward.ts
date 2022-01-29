import { task } from "hardhat/config";

task("reward", "Get reward amount")
    .setAction(async (taskArgs, hre) => {
        const signer = hre.ethers.provider.getSigner(0);
        const staking = await hre.ethers.getContractAt("Staking", "0xfB9709c3be3dc236da564250d4259B78f1C66E9A");
        const reward = await staking.calculateReward(await signer.getAddress());
        console.log("success, " + reward);
    });