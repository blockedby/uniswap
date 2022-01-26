import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { Contract, ContractFactory } from "ethers";
// import { ZepToken__factory,ZepToken } from "typechain"
import { ethers } from "hardhat";
import { expect, } from "chai";
// import {chaiAsPromised} from "chai-as-promised";
// import chaiAsPromised = require("chai-as-promised");
// import {chaiAsPromised} = require("chaiAsPromised");
// import { HardhatEthersHelpers } from "@nomiclabs/hardhat-ethers/types";

// chai.use(chaiAsPromised);

describe('another try', () => {

    // ethers.utils.parseUnits("10.0", await token.decimals());
    let
        decimals: String,
        tokenFactory: ContractFactory,
        token: Contract,
        owner: SignerWithAddress,
        alice: SignerWithAddress,
        bob: SignerWithAddress;
    const zero_address = "0x0000000000000000000000000000000000000000";
    before(async () => {
        [alice, owner, bob] = await ethers.getSigners();
        tokenFactory = await ethers.getContractFactory("ZepToken", owner);
    });
    beforeEach(async () => {
        // was a problem, fixed here : https://github.com/sc-forks/solidity-coverage/issues/652 
        // token = await tokenFactory.deploy(1000,{
        //     gasPrice: 5000000000000,
        // });
        token = await tokenFactory.connect(owner).deploy(ethers.utils.parseEther("1000"));
        await token.deployed();
        decimals = await token.decimals().toString();
    });
    describe('FULL', () => {
        it('Should set right name', async () => {
            expect(await token.name()).to.equal("KCNCtoken");
        });

        it('Should set right symbol', async () => {
            expect(await token.symbol()).to.equal("KCNC");
        });
        it('Should set right decimals', async () => {
            expect(await token.decimals()).to.equal(18);
        })
        it('Should set right owner for tokens', async () => {
            expect(await token.owner()).to.equal(owner.address);
        });
        it('Should set right balance for owner address', async () => {
            expect(await token.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("1000"));
        });
        it('Balance of Alice should be zero', async () => {
            expect(await token.balanceOf(alice.address)).to.equal(0);
        })
        it('Should set right total supply', async () => {
            expect(await token.totalSupply()).to.equal(ethers.utils.parseEther("1000"));
        })
        it("Modifier should works with owner", async function () {
            expect(await token.owner()).to.equal(owner.address);
            await token.connect(owner).mint(alice.address, 100);
            await token.connect(owner).burn(alice.address, 10);
            await token.connect(alice).approve(owner.address, 90);
            // await token.connect(owner).burnFrom(alice.address,90);
        });

        it("Modifier shouldn't works with other", async function () {
            // really not Alice
            await expect(token.owner()).to.not.equal(alice.address);
            await token.connect(owner).transfer(alice.address, ethers.utils.parseEther("100"));
            await token.connect(owner).approve(alice.address, ethers.utils.parseEther("100"));

            await expect(
                token.connect(alice).mint(alice.address, ethers.utils.parseEther("1"))
            ).to.be.revertedWith(
                "VM Exception while processing transaction: reverted with reason string 'Unauthorized'");

            await expect(
                token.connect(alice).burn(alice.address, ethers.utils.parseEther("1"))
            ).to.be.revertedWith(
                "VM Exception while processing transaction: reverted with reason string 'Unauthorized'");

            // await expect(
            //     token.connect(alice).burnFrom(owner.address, 1)
            // ).to.be.revertedWith(
            //     "VM Exception while processing transaction: reverted with custom error 'Unauthorized()'");    
        });

        it("Should be transfered by account and update balances", async function () {
            await token.connect(owner).transfer(alice.address, ethers.utils.parseEther("100"));
            expect(await token.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("900"));
            expect(await token.balanceOf(alice.address)).to.equal(ethers.utils.parseEther("100"));
        });
        it("Transfer should fail due to lack of token amount", async () => {
            await expect(
                token.connect(owner).transfer(alice.address, ethers.utils.parseEther("1001"))
            ).to.be.revertedWith("Balance less then value");

            await expect(
                token.connect(bob).transfer(alice.address, ethers.utils.parseEther("1"))
                // catch an error
            ).to.be.revertedWith("Balance less then value");

        })
        it("Transfer should fail by sending to zero address", async function () {
            await expect(
                token.connect(owner).transfer(zero_address, ethers.utils.parseEther("100"))
            ).to.be.revertedWith("'To' can't be zero");
        });
        it("Approve should fail by sending to zero address", async function () {
            await expect(
                token.connect(owner).approve(zero_address, ethers.utils.parseEther("100"))
            ).to.be.revertedWith("'Spender' can't be zero");
        });
        it("Can be transferedFrom", async function () {
            await token.connect(owner).approve(alice.address, ethers.utils.parseEther("100"));
            await token.connect(alice).transferFrom(owner.address, bob.address, ethers.utils.parseEther("100"));
            expect(await token.balanceOf(bob.address)).to.equal(ethers.utils.parseEther("100"));

        });
        it("Cannot be transferedFrom", async function () {
            await token.connect(owner).approve(alice.address, ethers.utils.parseEther("100"));
            // await token.connect(alice).transferFrom(owner.address,bob.address,100);

            await expect(
                token.connect(alice).transferFrom(owner.address, bob.address, ethers.utils.parseEther("1001"))
            ).to.be.revertedWith("Balance less then value");
            await expect(
                token.connect(alice).transferFrom(owner.address, owner.address, ethers.utils.parseEther("101"))
            ).to.be.revertedWith('Unauthorised, please approve');
            await expect(
                token.connect(alice).transferFrom(owner.address, zero_address, ethers.utils.parseEther("10"))
            ).to.be.revertedWith("'To' can't be zero");
        });
        it('Should store balances', async function () {
            await token.connect(owner).transfer(alice.address, ethers.utils.parseEther("100"));
            await token.connect(owner).transfer(bob.address, ethers.utils.parseEther("200"));

            const _owner_balance = await token.connect(bob).balances(owner.address);
            const _alice_balance = await token.connect(owner).balances(alice.address);
            const _bob_balance = await token.connect(alice).balances(bob.address);

            expect(_owner_balance).to.equal(ethers.utils.parseEther("700"));
            expect(_alice_balance).to.equal(ethers.utils.parseEther("100"));
            expect(_bob_balance).to.equal(ethers.utils.parseEther("200"));

            expect(await token.connect(alice).balanceOf(owner.address)).to.equal(_owner_balance);
            expect(await token.connect(bob).balanceOf(alice.address)).to.equal(_alice_balance);
            expect(await token.connect(owner).balanceOf(bob.address)).to.equal(_bob_balance);
        });
        it("Should be able to approve", async function () {
            await token.connect(owner).approve(alice.address, ethers.utils.parseEther("100"));
            let _allowedStorage = await token.connect(owner).allowed(owner.address, alice.address);

            expect(
                await token.connect(owner).allowance(owner.address, alice.address)
            ).to.equal(_allowedStorage);
        });
        // it("Should be approved", async function (){

        // }); 
        it("Allowed amount should be increased", async function () {
            await token.connect(owner).approve(alice.address, ethers.utils.parseEther("0.1"));
            await token.connect(owner).increaseAllowance(alice.address, ethers.utils.parseEther("1"));
            let _currentApproved = await token.connect(alice).allowance(owner.address, alice.address);
            // console.log(_currentApproved.toNumber());
            await expect(
                _currentApproved
            ).to.equal(ethers.utils.parseEther("1.1"));
            await expect(
                token.connect(owner).increaseAllowance(zero_address, 50)
            ).to.be.revertedWith("'Spender' can't be zero");
        });
        it("Allowed amount should be decreased", async function () {
            await token.connect(owner).approve(alice.address, ethers.utils.parseEther("100"));
            await token.connect(owner).decreaseAllowance(alice.address, ethers.utils.parseEther("50"));
            let _currentApproved = await token.connect(alice).allowance(owner.address, alice.address);
            // console.log(_currentApproved.toNumber());
            await expect(
                _currentApproved
            ).to.equal(ethers.utils.parseEther("50"));
            await expect(
                token.connect(owner).decreaseAllowance(zero_address, ethers.utils.parseEther("50"))
            ).to.be.revertedWith("'Spender' can't be zero");
        });
        it("Should be minted", async function () {
            // can't understand working with Bignumbers and ethers.utils here

            // bignumbers
            let _initialSupply = await token.connect(bob).totalSupply();
            let _initialBalance = await token.connect(owner).balanceOf(alice.address);

            await token.connect(owner).mint(alice.address, ethers.utils.parseEther("0.1"));

            let _changedSupply = await token.connect(bob).totalSupply();
            let _changedBalance = await token.connect(owner).balanceOf(alice.address);

            expect(
                _initialSupply.add(ethers.BigNumber.from(ethers.utils.parseEther("0.1")))
            ).to.equal(_changedSupply);

            expect(
                _initialBalance.add(ethers.BigNumber.from(ethers.utils.parseEther("0.1")))
            ).to.equal(_changedBalance);

            await expect(
                token.connect(owner).mint(zero_address, ethers.utils.parseEther("0.1"))
            ).to.be.revertedWith("Account can't be zero");
        });
        it("Should be burned", async function () {
            // can't understand working with Bignumbers and ethers.utils here 
            await token.connect(owner).transfer(alice.address, ethers.utils.parseEther("10"));

            let _initialSupply = await token.connect(owner).totalSupply();
            let _initialBalance = await token.connect(alice).balanceOf(alice.address);

            await token.connect(owner).burn(alice.address, ethers.utils.parseEther("5"));

            let _changedSupply = await token.connect(bob).totalSupply();
            let _changedBalance = await token.connect(owner).balanceOf(alice.address);

            expect(
                _initialSupply.sub(ethers.BigNumber.from(ethers.utils.parseEther("5")))
            ).to.equal(_changedSupply);
            expect(_initialBalance.sub(ethers.BigNumber.from(ethers.utils.parseEther("5")))
            ).to.equal(_changedBalance);

            await expect(
                token.connect(owner).burn(zero_address, ethers.utils.parseEther("50"))
            ).to.be.revertedWith("Account can't be zero");
            await expect(
                token.connect(owner).burn(owner.address, ethers.utils.parseEther("1001"))
            ).to.be.revertedWith("Account doesn't own such amount");
        });
    });
})