pragma solidity ^0.4.24;

import "openzeppelin-eth/contracts/math/SafeMath.sol";
import "openzeppelin-eth/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-eth/contracts/token/ERC20/ERC20Detailed.sol";
import "zos-lib/contracts/Initializable.sol";

contract WithERC20Reserve is Initializable, ERC20, ERC20Detailed {
    using SafeMath for uint256;

    ERC20 public reserveToken;
    uint256 public reserve;

    event CurveBuy(uint256 amount, uint256 paid, uint256 indexed when);
    event CurveSell(uint256 amount, uint256 rewarded, uint256 indexed when);

    function initialize(string name, string symbol, uint8 decimals, address token)
        initializer
        public
    {
        ERC20Detailed.initialize(name, symbol, decimals);
        reserveToken = ERC20(token);
    }

    /**
     * curve function interfaces */

    function price(uint256 tokens) public view returns (uint256 thePrice);
    function reward(uint256 tokens) public view returns (uint256 theReward);

    /**
     * stake and withdraw */
    
    function buy(uint256 tokens)
        public returns (uint256 paid)
    {
        require(tokens > 0, "Must request non-zero amount of new tokens.");

        paid = price(tokens);
        require(
            reserveToken.balanceOf(msg.sender) >= paid,
            "Sender does not have enough reserve tokens to stake!"
        );

        reserveToken.transferFrom(msg.sender, address(this), paid);
        reserve = reserve.add(paid);
        _mint(msg.sender, tokens);

        emit CurveBuy(tokens, paid, block.timestamp);
    }

    function sell(uint256 tokens)
        public returns (uint256 rewarded)
    {
        require(tokens > 0, "Must spend non-zero amount of tokens.");
        require(
            balanceOf(msg.sender) >= tokens,
            "Sender does not have enough tokens to spend."
        );

        rewarded = reward(tokens);
        reserve = reserve.sub(rewarded);        
        _burn(msg.sender, tokens);
        reserveToken.transfer(msg.sender, rewarded);

        emit CurveSell(tokens, rewarded, block.timestamp);
    }
}
