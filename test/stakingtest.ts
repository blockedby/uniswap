// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { Contract, ContractFactory } from "ethers";
// import { ZepToken__factory,ZepToken } from "typechain"
import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { describe, it } from "mocha";
// import { HardhatEthersHelpers } from "@nomiclabs/hardhat-ethers/types";

// chai.use(chaiAsPromised);
async function passMinutes(time:number) {
    await ethers.provider.send('evm_increaseTime', [time*60]);
    await ethers.provider.send("evm_mine",[]);
    console.log("                  ("+time+" minutes passed)");
}

describe('Staking', () => {
    let
        decimals : string,
        alice : SignerWithAddress,
        bob : SignerWithAddress,
        owner : SignerWithAddress,
        staking : Contract,
        mainToken : Contract,
        lpToken : Contract,
        stakingFactory : ContractFactory,
        tokenFactory : ContractFactory;

    before(async () => {
        // [alice, owner, bob] = await ethers.getSigners();
        // stakingFactory = await ethers.getContractFactory("Staking", owner);
        // tokenFactory = await ethers.getContractFactory("ZepToken");
    });
    beforeEach(async () => {
        [alice, owner, bob] = await ethers.getSigners();
        stakingFactory = await ethers.getContractFactory("Staking", owner);
        tokenFactory = await ethers.getContractFactory("ZepToken");
        mainToken = await tokenFactory.connect(owner).deploy(
            ethers.utils.parseEther("10000"),
            "Main",
            "MN"
        );
        await mainToken.deployed();
        lpToken = await tokenFactory.connect(alice).deploy(
            ethers.utils.parseEther("10000"),
            "StakTok",
            "LP"
        );
        await lpToken.deployed();
        staking = await stakingFactory.connect(bob).deploy(
            lpToken.address,
            mainToken.address
        )
        await staking.deployed();
    });
    describe('Start', () => {
        it('Should deployed with right names', async () => {
            expect(await mainToken.name()).to.equal("Main");
            expect(await lpToken.name()).to.equal("StakTok");
        });
        it('Token addresses should be correct', async function() {
            expect(await staking.getStakingTokenAddress()).to.equal(lpToken.address);
            expect(await staking.getRewardTokenAddress()).to.equal(mainToken.address);
        });
        it('Should get withdrawal delay', async function() {
            expect(await staking.connect(owner).getWithdrawDelay()).to.equal(2);
            
        });    
    });
    describe('Staking', () => {
        it("'stake' function should works", async () => {
            let amount = ethers.utils.parseEther("100");

            await lpToken.connect(alice).transfer(owner.address, amount);
            await lpToken.connect(owner).approve(staking.address,amount);
            await staking.connect(owner).stake(amount);

            expect (await lpToken.balanceOf(staking.address)).to.equal(amount);
            expect (await staking.connect(owner).getMyStakeBalance()).to.equal(amount);
            expect (await staking.connect(owner).getMyBalance()).to.equal(amount);
        });
        it('Staking should be reverted', async function() {
            await expect (staking.connect(alice).stake(0)).to.be.revertedWith("");
            await startStaking();
            await staking.connect(alice).claim();
            await staking.connect(alice).requestUnstake();
            await expect(
                staking.connect(alice).claim()
                ).to.be.revertedWith("Sorry, staking was not started yet");
            // ?????????
            // await expect(
            //     staking.connect(bob).stake(ethers.utils.parseEther("1.01"))
            // ).to.be.revertedWith("Allow me more!!!");
        });    
    });
    async function startStaking() {
        // await ethers.provider.send('evm_increaseTime', [300*60]);
        let amount = ethers.utils.parseEther("100");
        await lpToken.connect(alice).approve(staking.address, amount);
        let before = await ethers.provider.send('evm_increaseTime', [0]);
        await staking.connect(alice).stake(100);
        console.log("                  ("+"staking started at "+before+" )");
        await mainToken.connect(owner).transfer(staking.address,ethers.utils.parseEther("10000"));
        let after = await ethers.provider.send('evm_increaseTime', [3*60]);
        await ethers.provider.send("evm_mine",[]);
        console.log("                  (now is ", + after+" )");
        return (after-before-2); /* why -2 ???? */
    }
    describe('Calculating reward request', () => {
        it("Should calculate reward", async () => {
            const delay = await staking.getStakingDelay();
            const percent = await staking.getStakingPercent();          
            const timeDiff = await startStaking();
            const balance = await staking.connect(alice).getMyStakeBalance();
            const currentReward = await staking.connect(alice).calculateReward(alice.address)

            const expectedReward = balance * (percent / 100) * (timeDiff - delay*60)/60;
            console.log("delay is " + delay);
            console.log("reward is "+ expectedReward);
            console.log("percent is " + percent);
            console.log("balance is " + balance);
            console.log("current reward is " + currentReward);
            console.log("timediff is " + timeDiff);
            expect(currentReward).to.equal(expectedReward);
        });
        it("Should calculate reward after unstake", async () => {
            await startStaking();
            passMinutes(10);
            await staking.connect(alice).requestUnstake();
            await staking.connect(alice).calculateReward(alice.address);
        });
        it("Shouldn't calculate reward before staking", async () => {
            await lpToken.connect(alice).approve(staking.address, 100);
            await staking.connect(alice).stake(100);
            await expect(staking.calculateReward(alice.address)).to.be.revertedWith("");
        });
    });
    describe('Unstaking request', () => {
        it("'unstaking request' function should work", async () => {
            // alice is staker
            await startStaking();
            await staking.connect(alice).requestUnstake();
        });
        it("'unstaking request' function shouldn't work", async () => {
            // alice is staker
            await expect(
                staking.connect(alice).requestUnstake()
                ).to.be.revertedWith("Your stake balance is 0");
            await startStaking();
            await staking.connect(alice).requestUnstake();
            await expect(
                staking.connect(alice).requestUnstake()
                ).to.be.revertedWith("Already requested");
        });
    });
    describe('Claim', () => {
        it("claim should work", async () => {
            // alice is staker
            await startStaking();
            await staking.connect(alice).claim();
        });
        it("'claim' shouldn't work", async () => {
            // await startStaking();
            // await staking.connect(alice).requestUnstake();
            // passMinutes(10);
            // await staking.connect(alice).claim();
            // await startStaking();
            // expect (await staking.connect(alice).claim()).to.be.revertedWith("");
        });
    });
    describe('Unstake', () =>{
        it("Should unstake", async () =>{
            const initBalance = await lpToken.balanceOf(alice.address);
            await startStaking();
            const block = await staking.connect(alice).requestUnstake();
            const currentTime = await ethers.provider._getBlock(block.blocknumber);
            const delay = await staking.getStakingDelay();
            await passMinutes(delay);
            await staking.connect(alice).unstake();
            const afterBalance = await lpToken.balanceOf(alice.address);
        });
        it("Shouldn't unstake",async () =>{
            await expect(staking.connect(alice).unstake()).to.be.revertedWith("Your balance is 0");
            await startStaking();
            await expect(staking.connect(alice).unstake()).to.be.revertedWith("Please request unstake at first");
            await staking.connect(alice).requestUnstake();
            await expect(staking.connect(alice).unstake()).to.be.revertedWith("Please wait, unstaking in progress");
        });
        
    });
    describe('Setters', () =>{
        it("Should change admin",async () =>{
            await staking.connect(bob).setAdmin(alice.address);
        });
        it("Shouldn't change admin",async () =>{
            await expect(staking.connect(alice).setAdmin(alice.address)).to.be.revertedWith("");
        })
        it("Should change staking delay",async () =>{
            await staking.connect(bob).setAdmin(alice.address);
            await staking.connect(alice).setStakingDelay(10);
        })
        it("Shouldn't change staking delay",async () =>{
            await expect(staking.connect(alice).setStakingDelay(10)).to.be.revertedWith("");
        })
        it("Should change withdraw delay",async () =>{
            await staking.connect(bob).setWithdraDelay(100);
        })
        it("Shouldn't change withdraw delay",async () =>{
            await expect(staking.connect(alice).setWithdraDelay(100)).to.be.revertedWith("");
        })
    });
})