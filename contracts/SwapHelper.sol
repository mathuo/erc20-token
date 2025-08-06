// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IUniswapV3Pool {
    function swap(
        address recipient,
        bool zeroForOne,
        int256 amountSpecified,
        uint160 sqrtPriceLimitX96,
        bytes calldata data
    ) external returns (int256 amount0, int256 amount1);
}

contract SwapHelper {
    struct SwapCallbackData {
        address tokenIn;
        address tokenOut;
        address payer;
    }

    function swapExact(
        address pool,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        bool zeroForOne
    ) external returns (int256 amount0, int256 amount1) {
        // Transfer tokens from user to this contract first
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        
        // Prepare callback data
        SwapCallbackData memory data = SwapCallbackData({
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            payer: address(this)
        });
        
        // Execute swap with proper price limit
        uint160 sqrtPriceLimitX96;
        if (zeroForOne) {
            // Swapping token0 for token1, price will decrease
            sqrtPriceLimitX96 = 4295128739; // Very low price limit
        } else {
            // Swapping token1 for token0, price will increase  
            sqrtPriceLimitX96 = 1461446703485210103287273052203988822378723970341; // Very high price limit
        }
        
        // Execute swap
        (amount0, amount1) = IUniswapV3Pool(pool).swap(
            msg.sender, // recipient gets the output tokens
            zeroForOne,
            int256(amountIn),
            sqrtPriceLimitX96,
            abi.encode(data)
        );
    }

    // This is called by the pool during swap
    function uniswapV3SwapCallback(
        int256 amount0Delta,
        int256 amount1Delta,
        bytes calldata _data
    ) external {
        SwapCallbackData memory data = abi.decode(_data, (SwapCallbackData));
        
        // Pay the pool what it requires
        if (amount0Delta > 0) {
            IERC20(data.tokenIn).transfer(msg.sender, uint256(amount0Delta));
        }
        if (amount1Delta > 0) {
            IERC20(data.tokenIn).transfer(msg.sender, uint256(amount1Delta));
        }
    }
}