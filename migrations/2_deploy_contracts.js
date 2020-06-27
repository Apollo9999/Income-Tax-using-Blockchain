var Tax = artifacts.require("Tax");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(Tax);
  console.log("deployed!");
};