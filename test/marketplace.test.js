const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");

describe("Marketplace and IdentityVerification Contracts", function () {
    let deployer, buyer, seller, other;
    let identityVerification, marketplace;

    // Load deployment data from JSON file
    const deploymentData = JSON.parse(fs.readFileSync('./deployment-data.json', 'utf8'));
    const identityVerificationAddress = deploymentData.contracts.IdentityVerification;
    const marketplaceAddress = deploymentData.contracts.Marketplace;

    before(async function () {
        [deployer, buyer, seller, other] = await ethers.getSigners();
        identityVerification = await ethers.getContractAt("IdentityVerification", identityVerificationAddress);
        marketplace = await ethers.getContractAt("Marketplace", marketplaceAddress);
    });

    it("should have valid contract addresses", async function () {
        // Verify IdentityVerification contract address
        expect(identityVerificationAddress).to.be.a('string');
        expect(identityVerificationAddress).to.match(/^0x[a-fA-F0-9]{40}$/);
        expect(await identityVerification.getAddress()).to.equal(identityVerificationAddress);

        // Verify Marketplace contract address
        expect(marketplaceAddress).to.be.a('string');
        expect(marketplaceAddress).to.match(/^0x[a-fA-F0-9]{40}$/);
        expect(await marketplace.getAddress()).to.equal(marketplaceAddress);
    });

    it("should allow verified user to list a product", async function () {
        // Register and verify seller
        await identityVerification.connect(deployer).registerUser("Seller", "ID123", "0123456789", "SSM123");
        await identityVerification.connect(deployer).verifyUser(seller.address);

        // List product with 0.01 ETH price
        await marketplace.connect(seller).listProduct("Test Product", ethers.parseEther("0.01"));
        const product = await marketplace.products(1);
        
        expect(product.name).to.equal("Test Product");
        expect(product.price).to.equal(ethers.parseEther("0.01"));
        expect(product.seller).to.equal(seller.address);
    });

    it("should allow verified user to buy a product", async function () {
        // Register and verify buyer
        await identityVerification.connect(deployer).registerUser("Buyer", "ID456", "9876543210", "SSM456");
        await identityVerification.connect(deployer).verifyUser(buyer.address);

        // Buy product with 0.01 ETH payment
        await expect(
            marketplace.connect(buyer).purchaseProduct(1, {value: ethers.parseEther("0.01")})
        ).to.emit(marketplace, "ProductPurchased");

        const product = await marketplace.products(1);
        expect(product.isSold).to.be.true;
    });

    it("should prevent unverified users from listing products", async function () {
        await expect(
            marketplace.connect(other).listProduct("Invalid Product", ethers.parseEther("0.01"))
        ).to.be.revertedWith("User must be verified to participate");
    });
});
