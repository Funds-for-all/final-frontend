// contract addresses
export const FACTORY_CONTRACT_ADDRESS = "0x25C0a2F0A077F537Bd11897F04946794c2f6f1Ef"
export const POOL_ABI = [
  "function name() view returns (string)",
  "function creator() view returns (address)",
  "function goalAmount() view returns (uint256)",
  "function deadline() view returns (uint256)",
  "function isEnded() view returns (bool)",
  "function goalReached() view returns (bool)",
  "function hasWithdrawn() view returns (bool)",
  "function contributions(address) view returns (uint256)",
  "function hasVoted(address) view returns (bool)",
  "function candidateVotes(address) view returns (uint256)",
  "function addCandidate(address _candidate)",
  "function vote(address _candidate)",
  "function closePool()",
  "function withdrawToWinner()",
  "function claimRefund()",
  "function getBalance() view returns (uint256)",
  "function timeLeft() view returns (uint256)",
  "function getMyContribution(address user) view returns (uint256)",
  "function getCandidates() view returns (address[])",
  "function getCandidateVotes(address candidate) view returns (uint256)",
  "event Funded(address indexed contributor, uint256 amount)",
  "event Refunded(address indexed contributor, uint256 amount)",
  "event PoolClosed(bool goalReached)",
  "event Voted(address indexed voter, address indexed candidate)",
  "event Withdrawn(address indexed to, uint256 amount)",
  "event CandidateAdded(address indexed candidate)",
]

export const FACTORY_ABI = [
  "function createFundPool(string memory _name, uint256 _goalAmount, uint256 _durationInDays)",
  "function getAllPools() view returns (address[])",
  "event PoolCreated(address poolAddress, address creator, string name, uint256 goalAmount, uint256 deadline)",
]
