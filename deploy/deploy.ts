import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, log } = hre.deployments;

  const confidentialEth = await deploy("ConfidentialETH", {
    from: deployer,
    log: true,
  });

  const confidentialUsdt = await deploy("ConfidentialUSDT", {
    from: deployer,
    log: true,
  });

  const confidentialZama = await deploy("ConfidentialZama", {
    from: deployer,
    log: true,
  });

  const staking = await deploy("ConfidentialStaking", {
    from: deployer,
    args: [[confidentialEth.address, confidentialUsdt.address, confidentialZama.address]],
    log: true,
  });

  log(`ConfidentialETH contract: ${confidentialEth.address}`);
  log(`ConfidentialUSDT contract: ${confidentialUsdt.address}`);
  log(`ConfidentialZama contract: ${confidentialZama.address}`);
  log(`ConfidentialStaking contract: ${staking.address}`);
};

export default func;
func.id = "deploy_confidential_staking";
func.tags = ["confidential-staking"];
