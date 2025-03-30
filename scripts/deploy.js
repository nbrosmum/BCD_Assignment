const hre = require("hardhat");

async function main() {
    // Get the first few accounts from Hardhat
    const [deployer, user, seller] = await hre.ethers.getSigners();
  
    console.log(`Deploying contracts with the account: ${deployer.address}`);
    console.log(`User Address: ${user.address}`);
    console.log(`Seller Address: ${seller.address}`);
  
    // Deploy IdentityVerification Contract
    const IdentityVerification = await hre.ethers.getContractFactory("IdentityVerification");
    const identityVerification = await IdentityVerification.deploy();
    await identityVerification.waitForDeployment();
  
    console.log(`IdentityVerification deployed to: ${identityVerification.target}`);
  
    // Deploy Marketplace Contract (pass IdentityVerification contract address)
    const Marketplace = await hre.ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy(identityVerification.target);
    await marketplace.waitForDeployment();
  
    console.log(`Marketplace deployed to: ${marketplace.target}`);
  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  