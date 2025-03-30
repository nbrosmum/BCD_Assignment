/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_URL,
      accounts: [
        process.env.PRIVATE_KEY,
        process.env.BUYER_PRIVATE_KEY,  // Buyer
        process.env.SELLER_PRIVATE_KEY  // Seller
      ],
    },
  },
};
