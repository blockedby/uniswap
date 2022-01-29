import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);
  const Token = await ethers.getContractFactory('ZepToken');
  const value = ethers.utils.parseEther("10000");

  const token1 = await Token.deploy(value,"MainToken","MT");
  console.log('Token address:', token1.address);
  
  const token2 = await Token.deploy(value,"RewardToken","RT");
  console.log('Token address:', token2.address);
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
