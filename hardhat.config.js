require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    teaSepolia: {
      url: process.env.ALCHEMY_API_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 10218,
    },
  },
};