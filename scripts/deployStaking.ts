import { ethers } from "hardhat";
import { connect } from "http2";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);
  const stakingF = await ethers.getContractFactory('Staking');
//   const value = ethers.utils.parseEther("10000");
  const staking = await stakingF.deploy("0xccc64208173c7738f599848efdd816c67b6c63f9","0x58f1ac6d806e4f15064b61b118e7514cfade6cec");
  console.log('Staker address:', staking.address);
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
