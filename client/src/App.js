import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import contractABI from "./NumberGuessingGame.json";

const CONTRACT_ADDRESS = "0x1e4C71616D9d69538d325B2673d110940D1F359C";

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [prizePool, setPrizePool] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const web3Modal = new Web3Modal({
    network: "teaSepolia",
    cacheProvider: true,
  });

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setMessage("Metamask is not installed!");
      return;
    }

    try {
      const instance = await web3Modal.connect();
      const provider = new ethers.BrowserProvider(instance);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);
      const accounts = await provider.listAccounts();

      setProvider(provider);
      setSigner(signer);
      setContract(contract);
      setAccount(accounts[0].address);
      setMessage("");
    } catch (error) {
      console.error("Connection error:", error);
      setMessage("Failed to connect wallet");
    }
  }, []);

  const refreshPrizePool = useCallback(async () => {
    if (contract) {
      try {
        const balance = await contract.getContractBalance();
        setPrizePool(ethers.formatEther(balance));
      } catch (error) {
        console.error("Error fetching prize pool:", error);
      }
    }
  }, [contract]);

  const playGame = useCallback(async () => {
    if (!guess || guess < 1 || guess > 10) {
      setMessage("Enter a number between 1 and 10");
      return;
    }

    if (!contract) {
      setMessage("Contract is not ready");
      return;
    }

    try {
      setIsLoading(true);
      setMessage("Sending transaction...");
      const tx = await contract.play(BigInt(guess), {
        value: ethers.parseEther("0.001"),
      });

      await tx.wait();
      setMessage("Transaction completed! Refreshing result...");
      await refreshPrizePool();
      await fetchLastResult();
    } catch (error) {
      console.error("Play error:", error);
      setMessage("Error: " + (error.reason || error.message));
    } finally {
      setIsLoading(false);
    }
  }, [guess, contract, refreshPrizePool]);

  const fetchLastResult = useCallback(async () => {
    if (!contract || !account) return;

    try {
      const result = await contract.getLastResult(account);
      const won = result[0];
      const guess = result[1].toString();
      const prize = ethers.formatEther(result[2]);
      setLastResult({ won, guess, prize });
    } catch (error) {
      console.error("Failed to fetch last result:", error);
    }
  }, [contract, account]);

  useEffect(() => {
    if (contract) {
      refreshPrizePool();
      fetchLastResult();
    }
  }, [contract, refreshPrizePool, fetchLastResult]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6">Number Guessing Game</h1>

      {!account ? (
        <button
          onClick={connectWallet}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="w-full max-w-md bg-white p-6 rounded shadow">
          <p className="mb-4">Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
          <p className="mb-4">Prize Pool: {prizePool} TEA</p>

          <input
            type="number"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Guess (1-10)"
            className="w-full p-2 mb-4 border rounded"
            min="1"
            max="10"
          />

          <button
            onClick={playGame}
            className={`w-full text-white p-2 rounded ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Play (0.001 TEA)"}
          </button>

          <button
            onClick={fetchLastResult}
            className="w-full mt-3 bg-indigo-500 text-white p-2 rounded hover:bg-indigo-600"
          >
            View Last Result
          </button>

          {message && <p className="mt-4 text-center">{message}</p>}

          {lastResult && (
            <div className="mt-4 p-4 bg-gray-50 border rounded text-center">
              <p className="font-semibold">Last Result:</p>
              <p>Your Guess: {lastResult.guess}</p>
              <p>{lastResult.won ? `You Won! +${lastResult.prize} TEA 🎉` : "You Lost 😢"}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
