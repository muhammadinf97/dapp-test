const hre = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0x4B331fc149eA04eDe5FB31C69409f0444b9D8490"; // Alamat kontrak Anda
  const depositAmount = hre.ethers.parseEther("1"); // Deposit 1 TEA

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