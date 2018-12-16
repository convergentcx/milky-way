import { expect } from 'chai';
import { MockERC20Instance, SpreadERC20Instance } from '../../types/truffle-contracts';

import BN = require('bn.js');
import Web3 = require('web3');

import { findEvent } from '../helpers';

declare const web3: Web3;

const MockERC20 = artifacts.require('MockERC20');
const SpreadERC20 = artifacts.require('SpreadERC20');

contract('SpreadERC20', ([owner, user1, user2]) => {
  let mockERC20: MockERC20Instance;
  let spreadERC20: any;

  before(async () => {
    mockERC20 = await MockERC20.new();
    await mockERC20.initialize(
      "Mock Token",
      "MOCK",
      18,
    );

    expect(mockERC20.address).to.exist;

    spreadERC20 = await SpreadERC20.new();
    await spreadERC20.initialize(
      "Logan Coin",
      "LOGAN",
      18,
      mockERC20.address,
      1,
      1,
      1000,
      1200,
    );
  });

  it('Sanity checks', async () => {
    const name = await spreadERC20.name();
    expect(name).to.equal("Logan Coin");

    const symbol = await spreadERC20.symbol();
    expect(symbol).to.equal("LOGAN");

    const decimals = await spreadERC20.decimals();
    expect(decimals.toNumber()).to.equal(18);

    const buyExponent = await spreadERC20.buyExponent();
    expect(buyExponent.toNumber()).to.equal(1);

    const sellExponent = await spreadERC20.sellExponent();
    expect(sellExponent.toNumber()).to.equal(1);

    const buyInverseSlope = await spreadERC20.buyInverseSlope();
    expect(buyInverseSlope.toNumber()).to.equal(1000);

    const sellInverseSlope = await spreadERC20.sellInverseSlope();
    expect(sellInverseSlope.toNumber()).to.equal(1200);
  });

  it('Allows for stake()', async () => {
    mockERC20.mint(user1, web3.utils.toWei('20', 'ether'));
    expect(
      (await mockERC20.balanceOf(user1)).toString()
    ).to.equal(web3.utils.toWei('20', 'ether'));

    mockERC20.approve(spreadERC20.address, web3.utils.toWei('1', 'ether'), {
      from: user1,
    });

    const buyTx = await spreadERC20.buy(
      web3.utils.toWei('1', 'ether'),
      {
        from: user1,
      }
    );

    const buyEvent = findEvent(buyTx.logs, "CurveBuy");
    expect(buyEvent).to.exist;

    expect(buyEvent.args.amount.toString()).to.equal(web3.utils.toWei('1', 'ether'));
    expect(web3.utils.fromWei(buyEvent.args.paid.toString())).to.equal('0.0005');

    const payoutEvent = findEvent(buyTx.logs, "Payout");
    expect(web3.utils.fromWei(payoutEvent.args.amount.toString())).to.equal('0.000083333333333334');

    const tokenBalance = await spreadERC20.balanceOf(user1);
    expect(tokenBalance.toString()).to.equal(web3.utils.toWei('1', 'ether'));
  });

  it('Allows for withdraw()', async () => {
    expect(
      (await spreadERC20.balanceOf(user1)).toString(),
      'The user1 should have 10**18 of spread tokens.',
    ).to.equal(web3.utils.toWei('1', 'ether'));

    // Some constants from last test.
    const { toWei, toBN } = web3.utils;
    const buyAmt: BN = toBN(toWei('0.0005', 'ether'));
    const spreadAmt: BN = toBN(toWei('0.000083333333333334', 'ether'));
    const shouldHaveReserved: BN = buyAmt.sub(spreadAmt);

    expect(
      (await mockERC20.balanceOf(spreadERC20.address)).toString(),
      'Balance of the bonding curve contract should be buy integral minus the spread integral.'
    ).to.equal(shouldHaveReserved.toString());

    expect(
      (await spreadERC20.reserve()).toString()
    ).to.equal(shouldHaveReserved.toString());

    expect(
      (await spreadERC20.reward(web3.utils.toWei('1', 'ether'))).toString()
    ).to.equal(shouldHaveReserved.toString());

    const sellTx = await spreadERC20.sell(
      web3.utils.toWei('1', 'ether'),
      {
        from: user1,
      },
    );

    // Sanity
    expect(sellTx.receipt).to.exist;

    const sellEvent = findEvent(sellTx.logs, "CurveSell");
    expect(sellEvent).to.exist;

    expect(sellEvent.args.amount.toString()).to.equal(toWei('1', 'ether'));
    expect(sellEvent.args.rewarded.toString()).to.equal(shouldHaveReserved.toString());

    // Check user1 balance of spread token === 0
    const tokenBalance = await spreadERC20.balanceOf(user1)
    expect(tokenBalance.toString()).to.equal('0')

    // Check bonding curve reserve === 0 and balance === 0
    const reserve = await spreadERC20.reserve();
    expect(reserve.toString()).to.equal('0');

    const bcBalance = await mockERC20.balanceOf(spreadERC20.address);
    expect(bcBalance.toString()).to.equal('0');
  });
})