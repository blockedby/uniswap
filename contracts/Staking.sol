//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract Staking{

    IERC20 public stakingToken;
    IERC20 public rewardsToken;

    struct stakingInfo {
        uint staked;
        uint reward;
        uint paid;
        uint stakedDate;
        bool isRequested;
        uint requestedDate;
    }

    mapping(address => uint) private balances;
    mapping(address => stakingInfo) private info;

    uint private stakingDelayMinutes = 2;
    uint private withdrawDelayMinutes = 2; 
    uint private stakingPercent = 20;
    address private admin;


    constructor(address _stakingToken, address _rewardsToken){
        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardsToken);
        admin = msg.sender;
    }

    function getStakingTokenAddress() public view returns(address){
        return(address(stakingToken));
    }
    function getRewardTokenAddress() public view returns(address){
        return(address(rewardsToken));
    }
    function getMyBalance() public view returns(uint){
        return(balances[msg.sender]);
    }
    function getMyStakeBalance() public view returns(uint){
        return(info[msg.sender].staked);
    }
    function getStakingDelay() public view returns(uint){
        return(stakingDelayMinutes);
    }
    function getWithdrawDelay() public view returns(uint){
        return(withdrawDelayMinutes);
    }
    function getStakingPercent() public view returns(uint){
        return(stakingPercent);
    }

    function stake (uint256 amount) public payable{
        require(amount > 0,"Amount must be greater then 0");
        stakingToken.transferFrom(msg.sender, address(this), amount);
        info[msg.sender].stakedDate = block.timestamp;
        info[msg.sender].staked = amount;
        balances[msg.sender]+= amount;
        info[msg.sender].isRequested = false;
    }
    function unstake() public {
        require (balances[msg.sender] >0, "Your balance is 0");
        require (info[msg.sender].isRequested == true,"Please request unstake at first");
        require (
            block.timestamp > (info[msg.sender].requestedDate + withdrawDelayMinutes * 1 minutes)
            ,"Please wait, unstaking in progress"
            );
        stakingToken.transfer(msg.sender, balances[msg.sender]);
        balances[msg.sender]=0;
        info[msg.sender].isRequested = false;
        info[msg.sender].staked = 0;
    }
    function requestUnstake() public{
        require (info[msg.sender].staked > 0, "Your stake balance is 0");
        require(info[msg.sender].isRequested == false,"Already requested");
        info[msg.sender].reward = calculateReward(msg.sender);
        info[msg.sender].isRequested = true;
        info[msg.sender].requestedDate = block.timestamp;
    }

    function claim () public{
        info[msg.sender].reward = calculateReward(msg.sender);
        uint reward = info[msg.sender].reward - info[msg.sender].paid;
        rewardsToken.transfer(msg.sender, reward);
        info[msg.sender].paid = info[msg.sender].reward;
    }
    function calculateReward(address user) public view returns(uint reward) {
        uint startOfStaking = info[user].stakedDate + stakingDelayMinutes * 60;
        uint currentdate = block.timestamp;
        require(currentdate>=startOfStaking,"Sorry, staking was not started yet");
        
        if (info[user].isRequested == false){
            return info[user].staked * (currentdate - startOfStaking)/60 * stakingPercent / 100 - info[user].paid;
        } else {
                return info[user].reward;
            }
    }

    function setAdmin(address _admin) public onlyBy(admin){
        admin = _admin;
    }
    function setStakingDelay(uint _delay) public onlyBy(admin){
        stakingDelayMinutes = _delay;
    }
    function setWithdraDelay(uint _delay) public onlyBy(admin){
        withdrawDelayMinutes = _delay;
    }
    modifier onlyBy(address _account) {
        require(msg.sender == _account, "Unauthorized");
    _;
    }
}
