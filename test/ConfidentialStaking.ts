import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

import {
  ConfidentialETH,
  ConfidentialETH__factory,
  ConfidentialUSDT,
  ConfidentialUSDT__factory,
  ConfidentialZama,
  ConfidentialZama__factory,
  ConfidentialStaking,
  ConfidentialStaking__factory,
} from "../types";

type SignerSet = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

type TokenSet = {
  ceth: ConfidentialETH;
  cusdt: ConfidentialUSDT;
  czama: ConfidentialZama;
};

describe("ConfidentialStaking", function () {
  let signers: SignerSet;
  let tokens: TokenSet;
  let staking: ConfidentialStaking;
  let stakingAddress: string;

  before(async function () {
    const allSigners = await ethers.getSigners();
    signers = {
      deployer: allSigners[0],
      alice: allSigners[1],
      bob: allSigners[2],
    };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      this.skip();
    }

    const confidentialEthFactory = (await ethers.getContractFactory(
      "ConfidentialETH",
    )) as ConfidentialETH__factory;
    const confidentialUsdtFactory = (await ethers.getContractFactory(
      "ConfidentialUSDT",
    )) as ConfidentialUSDT__factory;
    const confidentialZamaFactory = (await ethers.getContractFactory(
      "ConfidentialZama",
    )) as ConfidentialZama__factory;

    const ceth = (await confidentialEthFactory.deploy()) as ConfidentialETH;
    const cusdt = (await confidentialUsdtFactory.deploy()) as ConfidentialUSDT;
    const czama = (await confidentialZamaFactory.deploy()) as ConfidentialZama;

    await Promise.all([ceth.waitForDeployment(), cusdt.waitForDeployment(), czama.waitForDeployment()]);

    tokens = {
      ceth,
      cusdt,
      czama,
    };

    const stakingFactory = (await ethers.getContractFactory(
      "ConfidentialStaking",
    )) as ConfidentialStaking__factory;

    staking = (await stakingFactory.deploy([
      await ceth.getAddress(),
      await cusdt.getAddress(),
      await czama.getAddress(),
    ])) as ConfidentialStaking;

    await staking.waitForDeployment();
    stakingAddress = await staking.getAddress();

    const expiry = Math.floor(Date.now() / 1000) + 86400;

    await Promise.all([
      tokens.ceth.connect(signers.alice).setOperator(stakingAddress, expiry),
      tokens.cusdt.connect(signers.alice).setOperator(stakingAddress, expiry),
      tokens.czama.connect(signers.alice).setOperator(stakingAddress, expiry),
    ]);

    await Promise.all([
      tokens.ceth.faucet(signers.alice.address),
      tokens.cusdt.faucet(signers.alice.address),
      tokens.czama.faucet(signers.alice.address),
    ]);
  });

  it("registers supported tokens", async function () {
    const supported = await staking.supportedTokens();
    expect(supported).to.have.length(3);
    expect(supported).to.include(await tokens.ceth.getAddress());
    expect(supported).to.include(await tokens.cusdt.getAddress());
    expect(supported).to.include(await tokens.czama.getAddress());
  });

  it("stakes confidential amounts for each token", async function () {
    const stakeInputs: Record<keyof TokenSet, bigint> = {
      ceth: 500_000n,
      cusdt: 80n * 1_000_000n,
      czama: 2n * 1_000_000n,
    };

    for (const key of Object.keys(tokens) as (keyof TokenSet)[]) {
      const token = tokens[key];
      const amount = stakeInputs[key];

      const encrypted = await fhevm
        .createEncryptedInput(stakingAddress, signers.alice.address)
        .add64(amount)
        .encrypt();

      await staking
        .connect(signers.alice)
        .stake(await token.getAddress(), encrypted.handles[0], encrypted.inputProof);

      const userStake = await staking.stakeOf(signers.alice.address, await token.getAddress());
      const decryptedStake = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        userStake,
        stakingAddress,
        signers.alice,
      );

      expect(BigInt(decryptedStake)).to.equal(amount);

      const totalStake = await staking.totalStaked(await token.getAddress());
      const decryptedTotal = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        totalStake,
        stakingAddress,
        signers.alice,
      );

      expect(BigInt(decryptedTotal)).to.equal(amount);
    }
  });

  it("returns staked balance on withdrawAll", async function () {
    const token = tokens.ceth;
    const amount = 500_000n;

    const initialBalanceHandle = await token.confidentialBalanceOf(signers.alice.address);
    const initialBalance = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      initialBalanceHandle,
      await token.getAddress(),
      signers.alice,
    );

    const encrypted = await fhevm
      .createEncryptedInput(stakingAddress, signers.alice.address)
      .add64(amount)
      .encrypt();

    await staking
      .connect(signers.alice)
      .stake(await token.getAddress(), encrypted.handles[0], encrypted.inputProof);

    await staking.connect(signers.alice).withdrawAll(await token.getAddress());

    const remainingStake = await staking.stakeOf(signers.alice.address, await token.getAddress());
    const decryptedRemainingStake = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      remainingStake,
      stakingAddress,
      signers.alice,
    );
    expect(BigInt(decryptedRemainingStake)).to.equal(0n);

    const totalStake = await staking.totalStaked(await token.getAddress());
    const decryptedTotal = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      totalStake,
      stakingAddress,
      signers.alice,
    );
    expect(BigInt(decryptedTotal)).to.equal(0n);

    const aliceBalanceHandle = await token.confidentialBalanceOf(signers.alice.address);
    const aliceBalance = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      aliceBalanceHandle,
      await token.getAddress(),
      signers.alice,
    );
    expect(BigInt(aliceBalance)).to.equal(BigInt(initialBalance));
  });
});
