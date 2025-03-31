const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("IdentityVerification", function () {
  async function deployIdentityVerificationFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const IdentityVerification = await ethers.getContractFactory("IdentityVerification");
    const identityVerification = await IdentityVerification.deploy();
    return { identityVerification, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the right admin", async function () {
      const { identityVerification, owner } = await loadFixture(deployIdentityVerificationFixture);
      expect(await identityVerification.admin()).to.equal(owner.address);
    });
  });

  describe("User Registration", function () {
    it("Should register a user correctly", async function () {
      const { identityVerification, addr1 } = await loadFixture(deployIdentityVerificationFixture);
      
      await identityVerification.connect(addr1).register(
        "John Doe", 
        "ID123456", 
        1 // Buyer role
      );
      
      const user = await identityVerification.getUserDetails(addr1.address);
      expect(user[0]).to.equal("John Doe");
      expect(user[1]).to.equal("ID123456");
      expect(user[2]).to.equal(false); // isVerified
      expect(user[3]).to.equal(1); // Buyer role
    });

    it("Should prevent duplicate ID registration", async function () {
      const { identityVerification, addr1, addr2 } = await loadFixture(deployIdentityVerificationFixture);
      
      await identityVerification.connect(addr1).register(
        "John Doe", 
        "ID123456", 
        1
      );
      
      await expect(
        identityVerification.connect(addr2).register(
          "Jane Doe", 
          "ID123456", 
          2
        )
      ).to.be.revertedWith("ID number already registered");
    });
  });

  describe("User Verification", function () {
    it("Should verify a user correctly", async function () {
      const { identityVerification, owner, addr1 } = await loadFixture(deployIdentityVerificationFixture);
      
      await identityVerification.connect(addr1).register(
        "John Doe", 
        "ID123456", 
        1
      );
      
      await identityVerification.connect(owner).verifyUser(addr1.address);
      
      const user = await identityVerification.getUserDetails(addr1.address);
      expect(user[2]).to.equal(true); // isVerified
    });

    it("Should prevent non-admin from verifying users", async function () {
      const { identityVerification, addr1, addr2 } = await loadFixture(deployIdentityVerificationFixture);
      
      await identityVerification.connect(addr1).register(
        "John Doe", 
        "ID123456", 
        1
      );
      
      await expect(
        identityVerification.connect(addr2).verifyUser(addr1.address)
      ).to.be.revertedWith("Only admin can perform this action");
    });
  });

  describe("Admin Transfer", function () {
    it("Should transfer admin correctly", async function () {
      const { identityVerification, owner, addr1 } = await loadFixture(deployIdentityVerificationFixture);
      
      await identityVerification.connect(owner).transferAdmin(addr1.address);
      expect(await identityVerification.admin()).to.equal(addr1.address);
    });
  });
});