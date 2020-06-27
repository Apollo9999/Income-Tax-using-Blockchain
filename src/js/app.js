//global
var taxArtifacts;
var taxContractAddress;
var taxContractInstance;
var web3;

//init web3 to node, using web3 1.0.xxx
function web3Init() {
    //check if using external provider eg. metamask
    if (typeof web3 !== "undefined") {
        console.warn("Using web3 detected from external source like Metamask");
        web3 = new Web3(web3.currentProvider); //use external provider
    } else {
        console.warn("No web3 detected. Falling back to http://localhost:8545.");
        //using websockets because web3 1.0.xxx
        web3 = new Web3("ws://localhost:8545"); //dont init constructor as per below
        //var web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:8545"))
    }
}

//init contract, using pure web3 1.0.xxx
function setupContract(){
    //in src folder or cant find at "../../build/contracts/Tax.json"
    $.getJSON('./js/Tax.json', function(data) {
        taxArtifacts = data;
        taxContractAddress = "0x3ebaa75c433d4d98c03d327aa174a6e3b774cf9c"; //your contract address here
        //make sure new, Contract and .abi
        taxContractInstance = new web3.eth.Contract(taxArtifacts.abi, taxContractAddress);
    }).then(function(){
        //web3 >1.0.xxx must be async
        web3.eth.getAccounts().then(function(response){
            web3.eth.defaultAccount = response[0]; //needed to begin transactions
        }).catch(function(err){ 
            console.error("ERROR! " + err.message)
        });
        
        //check to see if contract is working, hit a call/non transactional function
        taxContractInstance.methods.getTotalTaxpayers().call().then(function(response){
            console.log(response + " working!");
        }).catch(function(err){ 
            console.error("ERROR! " + err.message)
        });
    });
}

//
function addTaxPayer(payerAddress, payerID, payerName) {
    //input checks
    if (payerAddress == ""){
      alert("Taxpayer must have a valid ethereum address!");
    }

    if (payerID == ""){
        alert("Taxpayer must have a valid identifying number!");
    }

    if (payerName == ""){
        alert("Taxpayer must have a valid name!");
    }

    //func send
    if(payerAddress != "" && payerID != "" && payerName != ""){
        taxContractInstance.methods.addTaxPayer(payerAddress,parseInt(payerID),web3.utils.fromAscii(payerName))
        .send({from: web3.eth.defaultAccount, gas: 200000}).then(function(response){ //put some large gas #
            //console.log(response);
            var addTaxpayerEvent;
            //if there was an event
            if(response.events.addedTaxpayper != null){
                addTaxpayerEvent = response.events.addedTaxpayper.returnValues;
                //console.log(addTaxpayerEvent);
            }
            //just in case check if event returned true
            if(addTaxpayerEvent.added == true){
                alert("Taxpayer added successfully");
            }else{
                alert("Taxpayer add fail");
            }
        }).catch(function(err){ 
            console.error("ERROR! " + err.message)
        });
    }
}

//
function addTaxForTaxpayer(payerID, payerAmount, payerTaxyear) {
    //input checks
    if (payerID == ""){
        alert("Taxpayer must have a valid identifying number");
    }

    if (payerAmount <= 0){
        alert("Adding tax must have a positive number!");
    }

    if (payerTaxyear == ""){
        alert("Must have a valid tax year!");
    }

    //func send
    if(payerID != "" && payerAmount != "" && payerAmount > 0 && payerTaxyear != ""){
        taxContractInstance.methods.addTaxForTaxpayer(parseInt(payerID),parseInt(payerAmount),
        parseInt(payerTaxyear)).send({from: web3.eth.defaultAccount, gas: 200000})
        .then(function(response){ //put some large gas #
            //console.log(response);
        }).catch(function(err){ 
            console.error("ERROR! " + err.message)
        });
    }
}

//
function taxpayerPayingTax(payerID, payerAmount, payerTaxyear) {
    //input checks
    if (payerID == ""){
        alert("You must have a valid identifying number");
    }

    if (payerAmount <= 0){
        alert("Paying tax must have a positive number!");
    }

    if (payerTaxyear == ""){
        alert("Must have a valid tax year!");
    }

    //func send
    if(payerID != "" && payerAmount != "" && payerAmount > 0 && payerTaxyear != ""){
        taxContractInstance.methods.taxpayerPayingTax(parseInt(payerID),parseInt(payerAmount),
        parseInt(payerTaxyear)).send({from: web3.eth.defaultAccount, gas: 200000})
        .then(function(response){ //put some large gas #
            //console.log(response);
            var payingTaxEvent;
            //if there was an event
            if(response.events.paidTax != null){
                payingTaxEvent = response.events.paidTax.returnValues;
                //console.log(payingTaxEvent);
                alert(payingTaxEvent.payingAddress + " has just paid " + payingTaxEvent.paidAmount);
            }
        }).catch(function(err){ 
            console.error("ERROR! " + err.message)
        });
    }
}

//
function getTotalTaxpayers() {
    //func call
    taxContractInstance.methods.getTotalTaxpayers().call().then(function(response){
        //console.log(response);
        $("#returnedcount").text(response);
    }).catch(function(err){ 
        console.error("ERROR! " + err.message);
    });
}

//
function getTaxpayer(taxpayerID) {
    //input checks
    if (taxpayerID == ""){
        alert("You must have a valid identifying number");
    }

    //func call
    if(taxpayerID != ""){
        taxContractInstance.methods.getTaxpayer(parseInt(taxpayerID)).call().then(function(response){
            //console.log(response);
            $("#taxpayer-description1").text(response[0]);
            $("#taxpayer-description2").text(response[1]);
            $("#taxpayer-description3").text(web3.utils.hexToAscii(response[2]));
        }).catch(function(err){ 
            console.error("ERROR! " + err.message)
        });
    }
}

//
function getTotalTaxPaidOwedOrBalance(taxpayerID, selector) {
    //input checks
    if (taxpayerID == ""){
        alert("You must have a valid identifying number");
    }

    if (selector == ""){
        alert("You must have a valid selector to show choice");
    }

    //func call
    if(taxpayerID != "" && selector != ""){
        taxContractInstance.methods.getTotalTaxPaidOwedOrBalance(parseInt(taxpayerID), parseInt(selector))
        .call().then(function(response){
            //console.log(response);
            $("#tax-amt-display").text(response);
        }).catch(function(err){ 
            console.error("ERROR! " + err.message);
        });
    }
}

$(document).ready(function() {
    web3Init();
    setupContract();

    //UI events
    $("#addTaxpayerForm").submit(function(event) {
        event.preventDefault();  //prevent form from submitting, or page reloads wipe callback data
        var data = $("#addTaxpayerForm :input").serializeArray();
        addTaxPayer(data[0].value, data[1].value, data[2].value);
    });

    $("#addTaxForm").submit(function(event) {
        event.preventDefault();  //prevent form from submitting, or page reloads wipe callback data
        var data = $("#addTaxForm :input").serializeArray();
        addTaxForTaxpayer(data[0].value, data[1].value, data[2].value);
    });

    $("#payTaxForm").submit(function(event) {
        event.preventDefault();  //prevent form from submitting, or page reloads wipe callback data
        var data = $("#payTaxForm :input").serializeArray();
        taxpayerPayingTax(data[0].value, data[1].value, data[2].value);
    });

    $("#taxpayerDescription").submit(function(event) {
        event.preventDefault();  //prevent form from submitting, or page reloads wipe callback data
        var data = $("#taxpayerDescription :input").serializeArray();
        getTaxpayer(data[0].value);
    });

    $("#displayAmount").submit(function(event) {
        event.preventDefault();  //prevent form from submitting, or page reloads wipe callback data
        var data = $("#displayAmount :input").serializeArray();
        getTotalTaxPaidOwedOrBalance(data[0].value, data[1].value);
    });

    //only button, no input taken
    $('#totaltaxpayers').on('click', getTotalTaxpayers)

    //functionality hide/show
    $('#myModal').modal('show');

    //hide non admin functions
    $('#taxpayer').on('click', function(){
        $('#addTaxpayerRow').hide();
        $('#addTaxRow').hide();
        $('#displayCountRow').hide();
        $('#displayInfoRow').hide();
    });
});