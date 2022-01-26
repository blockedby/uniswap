import {expect} from "chai";
import {ethers} from "hardhat";

describe ("Greeter", () => {
    it("Should return the new greeting once it's changed", async function () {
        // 
        const greeter = await (await ethers.getContractFactory("Greeter")).deploy("Hello, world!");
        await greeter.deployed();
        
        expect(await greeter.greet()).to.eq("Hello, world!")
    })
})