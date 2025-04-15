const hre = require("hardhat");

async function main() {
  const NumberGuessingGame = await hre.ethers.getContractFactory("NumberGuessingGame");
  const game = await NumberGuessingGame.deploy();
  await game.waitForDeployment();
  console.log("NumberGuessingGame deployed to:", game.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});