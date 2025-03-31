const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Marketplace", function () {
  async function deployMarketplaceFixture() {
    const [owner, seller, buyer, other] = await ethers.getSigners();
    
    // Deploy IdentityVerification first
    const IdentityVerification = await ethers.getContractFactory("IdentityVerification");
    const identityVerification = await IdentityVerification.deploy();
    
    // Wait for deployment to complete
    await identityVerification.waitForDeployment();

    // Verify seller and buyer roles
    await identityVerification.connect(seller).register("Seller", "SELLER123", 2);
    await identityVerification.connect(buyer).register("Buyer", "BUYER123", 1);
    await identityVerification.connect(owner).verifyUser(seller.address);
    await identityVerification.connect(owner).verifyUser(buyer.address);
    
    // Deploy Marketplace with the deployed IdentityVerification address
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy(identityVerification.target);
    
    // Wait for deployment to complete
    await marketplace.waitForDeployment();
    
    return { 
        marketplace, 
        identityVerification: { 
            ...identityVerification, 
            address: identityVerification.target 
        }, 
        owner, 
        seller, 
        buyer, 
        other 
    };
  }

  describe("Deployment", function () {
    it("Should set the correct identity contract", async function () {
      const { marketplace, identityVerification } = await loadFixture(deployMarketplaceFixture);
      expect(await marketplace.identityContract()).to.equal(identityVerification.target);
    });
  });

  describe("Product Listing", function () {
    it("Should allow verified sellers to list products", async function () {
      const { marketplace, seller } = await loadFixture(deployMarketplaceFixture);
      
      await marketplace.connect(seller).listProduct("Test Product", 100);
      const product = await marketplace.products(0);
      
      expect(product.name).to.equal("Test Product");
      expect(product.price).to.equal(100);
      expect(product.seller).to.equal(seller.address);
      expect(product.sold).to.equal(false);
    });

    it("Should prevent unverified users from listing products", async function () {
      const { marketplace, other } = await loadFixture(deployMarketplaceFixture);
      
      await expect(
        marketplace.connect(other).listProduct("Test Product", 100)
      ).to.be.revertedWith("Unverified seller");
    });
  });

  describe("Product Purchasing", function () {
    it("Should allow verified buyers to purchase products", async function () {
      const { marketplace, seller, buyer } = await loadFixture(deployMarketplaceFixture);
      
      await marketplace.connect(seller).listProduct("Test Product", 100);
      await expect(
        marketplace.connect(buyer).buyProduct(0, { value: 100 })
      ).to.changeEtherBalance(seller, 100);
      
      const product = await marketplace.products(0);
      expect(product.sold).to.equal(true);
      expect(await marketplace.productBuyers(0)).to.equal(buyer.address);
    });

    it("Should prevent incorrect payment amounts", async function () {
      const { marketplace, seller, buyer } = await loadFixture(deployMarketplaceFixture);
      
      await marketplace.connect(seller).listProduct("Test Product", 100);
      await expect(
        marketplace.connect(buyer).buyProduct(0, { value: 50 })
      ).to.be.revertedWith("Incorrect payment amount");
    });
  });

  describe("Product Removal", function () {
    it("Should allow sellers to remove their own products", async function () {
      const { marketplace, seller } = await loadFixture(deployMarketplaceFixture);
      
      await marketplace.connect(seller).listProduct("Test Product", 100);
      await marketplace.connect(seller).removeProduct(0);
      
      const product = await marketplace.products(0);
      expect(product.name).to.equal("");
    });

    it("Should prevent removal of sold products", async function () {
      const { marketplace, seller, buyer } = await loadFixture(deployMarketplaceFixture);
      
      await marketplace.connect(seller).listProduct("Test Product", 100);
      await marketplace.connect(buyer).buyProduct(0, { value: 100 });
      
      await expect(
        marketplace.connect(seller).removeProduct(0)
      ).to.be.revertedWith("Cannot remove sold product");
    });
  });

  describe("View Functions", function () {
    it("Should return correct product count", async function () {
      const { marketplace, seller } = await loadFixture(deployMarketplaceFixture);
      
      await marketplace.connect(seller).listProduct("Product 1", 100);
      await marketplace.connect(seller).listProduct("Product 2", 200);
      
      expect(await marketplace.getProductCount()).to.equal(2);
    });

    it("Should return only active products", async function () {
      const { marketplace, seller, buyer } = await loadFixture(deployMarketplaceFixture);
      
      await marketplace.connect(seller).listProduct("Product 1", 100);
      await marketplace.connect(seller).listProduct("Product 2", 200);
      await marketplace.connect(buyer).buyProduct(0, { value: 100});
      
      const activeProducts = await marketplace.getActiveProducts();
      expect(activeProducts.length).to.equal(1);
      expect(activeProducts[0].name).to.equal("Product 2");
    });
  });
});