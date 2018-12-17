pragma solidity ^0.4.24;

/**
 * @title Bonding Curve Interface
 * @dev A bonding curve is a method for continuous token generation.
 */
interface IBondingCurve {

    event CurveBuy (uint256 amount, uint256 paid, address indexed purchaser);
    event SurveSell(uint256 amount, uint256 rewarded, address indexed seller);

    function price (uint256 tokens) public view returns (uint256 thePrice);
    function reward(uint256 tokens) public view returns (uint256 theReward);

    function buy (uint256 tokens) external returns (uint256 paid);
    function sell(uint256 tokens) external returns (uint256 rewarded);

    function marketCap() public view returns (uint256 theMarketCap);
}
