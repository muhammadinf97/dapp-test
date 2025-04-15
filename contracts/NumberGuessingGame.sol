// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract NumberGuessingGame is Ownable {
    uint256 public constant MIN_GUESS = 1;
    uint256 public constant MAX_GUESS = 10;
    uint256 public constant BET_AMOUNT = 0.001 ether;
    uint256 private secretNumber;
    uint256 public prizePool;

    struct GameResult {
        bool won;
        uint256 guess;
        uint256 prize;
    }

    mapping(address => GameResult) private results;

    event GamePlayed(address indexed player, uint256 guess, bool won, uint256 prize);
    event SecretNumberReset(uint256 newSecretNumber);

    constructor() Ownable(msg.sender) {
        _resetSecretNumber();
    }

    function play(uint256 _guess) external payable {
        require(_guess >= MIN_GUESS && _guess <= MAX_GUESS, "Guess must be between 1 and 10");
        require(msg.value == BET_AMOUNT, "Incorrect bet amount");
        require(prizePool >= BET_AMOUNT * 2, "Insufficient prize pool");

        prizePool += msg.value;
        bool won = _guess == secretNumber;
        uint256 prize = 0;

        if (won) {
            prize = BET_AMOUNT * 2;
            prizePool -= prize;
            payable(msg.sender).transfer(prize);
            _resetSecretNumber();
        }

        // Store the latest game result for this player
        results[msg.sender] = GameResult(won, _guess, prize);

        emit GamePlayed(msg.sender, _guess, won, prize);
    }

    function getLastResult(address player) external view returns (bool, uint256, uint256) {
        GameResult memory result = results[player];
        return (result.won, result.guess, result.prize);
    }

    function _resetSecretNumber() private {
        secretNumber = (uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao))) % MAX_GUESS) + 1;
        emit SecretNumberReset(secretNumber);
    }

    function depositPrizePool() external payable onlyOwner {
        prizePool += msg.value;
    }

    function withdrawPrizePool() external onlyOwner {
        uint256 amount = prizePool;
        prizePool = 0;
        payable(owner()).transfer(amount);
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
