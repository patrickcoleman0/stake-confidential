import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

const TOKEN_DEPLOYMENT_NAMES = {
  ceth: "ConfidentialETH",
  cusdt: "ConfidentialUSDT",
  czama: "ConfidentialZama",
} as const;

type SupportedTokenKey = keyof typeof TOKEN_DEPLOYMENT_NAMES;

function resolveTokenDeploymentName(tokenKey: string): string {
  const normalized = tokenKey.toLowerCase() as SupportedTokenKey;
  const deploymentName = TOKEN_DEPLOYMENT_NAMES[normalized as SupportedTokenKey];
  if (!deploymentName) {
    throw new Error(`Unsupported token key: ${tokenKey}. Use one of ceth, cusdt, czama.`);
  }
  return deploymentName;
}

task("staking:addresses", "Prints deployed confidential token and staking addresses").setAction(
  async function (_taskArguments: TaskArguments, hre) {
    const { deployments } = hre;

    const staking = await deployments.get("ConfidentialStaking");
    const cEth = await deployments.get("ConfidentialETH");
    const cUsdt = await deployments.get("ConfidentialUSDT");
    const cZama = await deployments.get("ConfidentialZama");

    console.log("ConfidentialETH:", cEth.address);
    console.log("ConfidentialUSDT:", cUsdt.address);
    console.log("ConfidentialZama:", cZama.address);
    console.log("ConfidentialStaking:", staking.address);
  },
);

task("staking:faucet", "Calls the faucet on a confidential token")
  .addParam("token", "Token key: ceth | cusdt | czama")
  .addOptionalParam("recipient", "Recipient address. Defaults to first signer")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const deploymentName = resolveTokenDeploymentName(taskArguments.token as string);
    const tokenDeployment = await deployments.get(deploymentName);

    const [signer] = await ethers.getSigners();
    const recipient = (taskArguments.recipient as string | undefined) ?? signer.address;

    const tokenContract = await ethers.getContractAt(deploymentName, tokenDeployment.address);
    const tx = await tokenContract.faucet(recipient);
    console.log(`Waiting for faucet transaction ${tx.hash}...`);
    await tx.wait();
    console.log(`Faucet minted confidential tokens to ${recipient}`);
  });

task("staking:set-operator", "Authorizes the staking contract as operator on a confidential token")
  .addParam("token", "Token key: ceth | cusdt | czama")
  .addOptionalParam("duration", "Authorization duration in seconds. Defaults to 86400")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const deploymentName = resolveTokenDeploymentName(taskArguments.token as string);
    const tokenDeployment = await deployments.get(deploymentName);
    const stakingDeployment = await deployments.get("ConfidentialStaking");

    const [signer] = await ethers.getSigners();

    const duration = taskArguments.duration ? Number(taskArguments.duration) : 86400;
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error("Duration must be a positive number of seconds");
    }

    const until = Math.floor(Date.now() / 1000) + duration;

    const tokenContract = await ethers.getContractAt(deploymentName, tokenDeployment.address);
    const tx = await tokenContract.connect(signer).setOperator(stakingDeployment.address, until);
    console.log(`Waiting for operator authorization ${tx.hash}...`);
    await tx.wait();
    console.log(`Authorized staking contract ${stakingDeployment.address} on ${deploymentName} until ${until}`);
  });
