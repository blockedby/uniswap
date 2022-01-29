import { ethers } from "hardhat";
// import {ethers} from "hardhat";
import hre from "hardhat";

// import { } from "@nomiclabs/hardhat-ethers"
async function main() {
    const Token = await ethers.getContractFactory('ZepToken');
    const stdin = process.openStdin();
    let addr = "";
    stdin.addListener("data", async function(d) {
        // note:  d is an object, and when converted to a string it will
        // end with a linefeed.  so we (rather crudely) account for that  
        // with toString() and then substring() 
        
         console.log("enter contract address: [" + d.toString().trim() + "]");
        addr = d.toString().trim();
    });
    await hre.run("verify:verify", {
        
        address: addr,
        constructorArguments: [
          50,
          "a string argument",
          {
            x: 10,
            y: 5,
          },
          "0xabcdef",
        ],
      });
      
//   const [deployer] = await ethers.getSigners();
//   console.log('Deploying contracts with the account:', deployer.address);
//   const Token = await ethers.getContractFactory('ZepToken');
//   const value = ethers.utils.parseEther("10000");

//   const token1 = await Token.deploy(value,"MainToken","MT");
//   console.log('Token address:', token1.address);
  
//   const token2 = await Token.deploy(value,"RewardToken","RT");
//   console.log('Token address:', token2.address);
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
