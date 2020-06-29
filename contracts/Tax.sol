// solium-disable linebreak-style
pragma solidity ^0.4.24; //above line is needed

contract Tax {
    //events fire immediately as a log to web3, whereas transactions in functions have to be mined for return values
    event paidTax(address payingAddress, uint paidAmount); //can be used as cheaper storage, have web3 grab results
    event addedTaxpayper(bool added);

    struct Tax {
        address addressOfTaxpayer;
        int amount; //needed instrad for uint for negative numbers, making tax balance go down
        uint taxYear;
    }

    struct TaxPayer {
        address taxpayerAddress;
        uint nationalID;
        bytes32 name; //string
    }

    //declares state variables to keep track of total amounts in mapping(the value)
    uint public numberOfTaxpayers = 0;
    uint public numberOfTaxEvents = 0;

    //key-value pairs, uint/address is key, struct is value
    mapping (uint => Tax[]) taxesForATaxpayer;
    mapping (address => TaxPayer) taxpayers;
    mapping (uint => address) nationalIDRepo; //this is needed for getTaxpayer()
    /*below doesnt work because for tax everytime a tax for a taxpayer is added based on address after the 1st one,
    it will overwrite the previous entry, it will not create a new one because the key(address) already exists
    mapping (uint=> TaxPayer ) public taxpayers; //amt of taxpayers
    mapping (address => Tax) public taxes; //each taxpayer(unique address) has taxes
    */



    //write functions - functions are transactions, will require ether/gas
    //must be unique, a person cannot have >1 tax ids
    function addTaxPayer(address payerAddress, uint payerID, bytes32 payerName) public {
        //checks if the address(key in mapping) exists for that taxpayer
        if (taxpayers[payerAddress].taxpayerAddress == 0x0) { //checks for default value
            //create new taxpayer and save to storage
            taxpayers[payerAddress] = TaxPayer(payerAddress, payerID, payerName);
            nationalIDRepo[payerID] = payerAddress; //needed to search by national id
            numberOfTaxpayers++;
            emit addedTaxpayper(true); //needed, web3 cannot get non-mined results
        } else {
            revert("Taxpayer exists already");
        }
    }

    //for any person, could be multiple taxes owed
    function addTaxForTaxpayer(uint payerID, int payerAmount, uint payerTaxYear) public {
        address addressKey = nationalIDRepo[payerID];
        //Create new Tax Struct with details and saves it to storage.
        //then add value consecutively to array
        //keys are the array index position, -1 because array 0 indexed
        taxesForATaxpayer[payerID].push(Tax(addressKey, payerAmount, payerTaxYear))-1; 
        numberOfTaxEvents++;
        //no need to broadcast event here, not sending any value
    }

    //when taxpayer pays tax, event broadcast because cannot return value in transaction function
    function taxpayerPayingTax(uint payerID, int payerAmount, uint payerTaxYear) public payable {
        int negativeAmount = payerAmount*(-1); //if taxpayer transaction then tax balance drops, must be a negative number
        address addressKey = nationalIDRepo[payerID];
        //then add value consecutively to array
        //keys are the array index position, -1 because array 0 indexed
        taxesForATaxpayer[payerID].push(Tax(addressKey, negativeAmount, payerTaxYear))-1;
        numberOfTaxEvents++;
        emit paidTax(msg.sender, msg.value); //the current taxpayer address and ether value
    }

    

    //read functions - functions are view, aka calls that require no ether/gas
    //for any person, get the current balance, current total paid amt, or current total owed amt
    function getTotalTaxPaidOwedOrBalance(uint payerID, uint selector) public view returns (int) {
        int amtOfTax = 0; // we will return this
        //local(memory) var below doesnt need fixed size initialization because implictly copying array from mapping
        Tax[] memory allTaxes = taxesForATaxpayer[payerID];
        
        //1 = balance, 2 = paid, 3 = owed
        if (selector == 1) {
            //sum balance
            for (uint index = 0; index < allTaxes.length; index++) {
                amtOfTax += allTaxes[index].amount;
            }
            return amtOfTax;
        } else if (selector == 2) {
            //paid amts only
            for (uint index1 = 0; index1 < allTaxes.length; index1++) {
                if (allTaxes[index1].amount < 0) {
                    amtOfTax += allTaxes[index1].amount;
                }
            } 
            return amtOfTax;
        } else if (selector == 3) {
            //owed amts only
            for (uint index2 = 0; index2 < allTaxes.length; index2++) {
                if (allTaxes[index2].amount > 0) {
                    amtOfTax += allTaxes[index2].amount;
                }
            } 
            return amtOfTax;
        }
    }

    function getTotalTaxpayers() public view returns(uint) {
        return numberOfTaxpayers;
    }

    //returns taxpayer information by nationalID, including its address, nationalID, name
    function getTaxpayer(uint payerID) public view returns (address, uint, bytes32) {
        address addressKey = nationalIDRepo[payerID]; //value is the address
        return (taxpayers[addressKey].taxpayerAddress, taxpayers[addressKey].nationalID,
        taxpayers[addressKey].name);
    }
}

