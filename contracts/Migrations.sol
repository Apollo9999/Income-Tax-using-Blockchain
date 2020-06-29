pragma solidity ^0.4.24;

contract Migrations {
    address public owner;
    uint public last_completed_migration;

    //function Migrations() public {
    constructor() public { //replaces the above line as of version 0.4.22
      owner = msg.sender;
    }

    modifier restricted() {
      if (msg.sender == owner) _;
    }

    function setCompleted(uint completed) public restricted {
      last_completed_migration = completed;
    }

    function upgrade(address new_address) public restricted {
      Migrations upgraded = Migrations(new_address);
      upgraded.setCompleted(last_completed_migration);
    }
}

