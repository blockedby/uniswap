import { task } from "hardhat/config";

task("approve", "Approves account to transferFrom")
    .addParam("token", "deployed contract addresss")
    .addParam("spender", "to allow to")
    .addParam("amount", "amount of tokens to approve")
    .addOptionalParam("signer", "signers form hh config, number from 0 to any")
    .setAction(async (taskArgs, hre) => {
        const token = await hre.ethers.getContractAt("ZepToken", taskArgs.token);
        await token.approve(taskArgs.spender,taskArgs.amount);
        // const myAcc = await hre.ethers.utils.getAddress()
        let signer = hre.ethers.provider.getSigner(0);
        let myAddress = await signer.getAddress();
        // console.log(myAddress2)
        const name = await token.name();
        const allowed = await token.allowance(myAddress,taskArgs.spender);
        console.log(allowed.toNumber() +" of "+name+ " is approved from \n"+myAddress+" to "+taskArgs.spender);
    });