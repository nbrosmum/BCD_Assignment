const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log(`Deploying contracts with the account: ${deployer.address}`);

    // Deploy IdentityVerification contract
    const IdentityVerification = await hre.ethers.getContractFactory("IdentityVerification");
    const identityVerification = await IdentityVerification.deploy();
    await identityVerification.waitForDeployment();
    console.log(`IdentityVerification deployed to: ${await identityVerification.getAddress()}`);

    // Deploy Marketplace contract with IdentityVerification contract address
    const Marketplace = await hre.ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy(await identityVerification.getAddress());
    await marketplace.waitForDeployment();
    console.log(`Marketplace deployed to: ${await marketplace.getAddress()}`);
}

// Execute deployment
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
