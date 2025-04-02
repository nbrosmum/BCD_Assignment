/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_URL,
      chainId: 11155111,
      accounts: [
        process.env.PRIVATE_KEY,
        process.env.BUYER_PRIVATE_KEY,  // Buyer
        process.env.SELLER_PRIVATE_KEY, // Seller
        process.env.OTHER_PRIVATE_KEY,  // other
      ].filter(Boolean), // Filter out undefined values,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY, // API key for contract verification
  },
};
