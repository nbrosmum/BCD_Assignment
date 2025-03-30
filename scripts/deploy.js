require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
    const [deployer, buyer, seller] = await ethers.getSigners();

    console.log(`Deploying contracts with the account: ${deployer.address}`);
    console.log(`Buyer Address: ${buyer.address}`);
    console.log(`Seller Address: ${seller.address}`);

    // Deploy IdentityVerification Contract
    const IdentityVerification = await ethers.getContractFactory("IdentityVerification");
    const identityVerification = await IdentityVerification.deploy();
    await identityVerification.waitForDeployment();
    console.log(`IdentityVerification deployed to: ${await identityVerification.getAddress()}`);

    // Deploy Marketplace Contract
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy(await identityVerification.getAddress());
    await marketplace.waitForDeployment();
    console.log(`Marketplace deployed to: ${await marketplace.getAddress()}`);

    console.log("Deployment Completed");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});



    
  