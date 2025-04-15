const hre = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0x1e4C71616D9d69538d325B2673d110940D1F359C"; // Alamat kontrak Anda
  const depositAmount = hre.ethers.parseEther("0.1"); // Deposit 1 TEA

  const [deployer] = await hre.ethers.getSigners();
  const contract = await hre.ethers.getContractAt("NumberGuessingGame", CONTRACT_ADDRESS, deployer);

  console.log("Mengisi prize pool...");
  const tx = await contract.depositPrizePool({ value: depositAmount });
  await tx.wait();

  const prizePool = await contract.prizePool();
  console.log("Prize pool sekarang:", hre.ethers.formatEther(prizePool), "TEA");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});