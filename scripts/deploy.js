require("dotenv").config();
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    // 1. Initialize Signers
    const [deployer, buyer, seller, other] = await ethers.getSigners();
    
    console.log("\n=== Deployment Initialized ===");
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Buyer:    ${buyer.address}`);
    console.log(`Seller:   ${seller.address}`);
    console.log(`Other:    ${other.address}\n`);

    // 2. Deploy IdentityVerification
    console.log("Deploying IdentityVerification...");
    const IdentityVerification = await ethers.getContractFactory("IdentityVerification");
    const identityVerification = await IdentityVerification.deploy();
    await identityVerification.waitForDeployment();
    const identityAddress = await identityVerification.getAddress();
    console.log(`IdentityVerification deployed to: ${identityAddress}`);

    // 3. Deploy Marketplace
    console.log("\nDeploying Marketplace...");
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy(identityAddress);
    await marketplace.waitForDeployment();
    const marketplaceAddress = await marketplace.getAddress();
    console.log(`Marketplace deployed to: ${marketplaceAddress}`);

    // 4. Save Deployment Data in the Root Directory
    const deploymentData = {
        network: (await ethers.provider.getNetwork()).name,
        timestamp: new Date().toISOString(),
        contracts: {
            IdentityVerification: identityAddress,
            Marketplace: marketplaceAddress
        },
        accounts: {
            deployer: deployer.address,
            buyer: buyer.address,
            seller: seller.address,
            other: other.address
        }
    };

    // Save to the root directory
    const filePath = path.join(__dirname, "..", "deployment-data.json"); // Moves one level up
    fs.writeFileSync(filePath, JSON.stringify(deploymentData, null, 2));
    console.log("\n✅ Deployment data saved to:", filePath);

    // 5. Verification Instructions
    console.log("\n=== Verification Commands ===");
    console.log(`npx hardhat verify --network ${deploymentData.network} ${identityAddress}`);
    console.log(`npx hardhat verify --network ${deploymentData.network} ${marketplaceAddress} "${identityAddress}"`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment Failed:", error);
        process.exit(1);
    });
