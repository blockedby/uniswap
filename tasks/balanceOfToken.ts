import { task } from "hardhat/config";

task("balanceOfToken", "Approves account to transferFrom")
    .addParam("token", "deployed contract addresss")
    .addParam("of", "balance of address")
    .setAction(async (taskArgs, hre) => {
        const token = await hre.ethers.getContractAt("ZepToken", taskArgs.token);
        const of = hre.ethers.utils.getAddress(taskArgs.of);
        // do not work without it
        const balance = await token.balanceOf(of);
        const name = await token.name();
        console.log(balance.toNumber()+" of "+name);
    });
