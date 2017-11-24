// var SolidityCoder = require("./node_modules/web3/lib/solidity/coder.js");
var SolidityCoder = require("web3/lib/solidity/coder.js");

web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
// update API for solar
abi = JSON.parse('[{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"buy","outputs":[{"name":"bought","type":"uint256"},{"name":"","type":"address"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"b","type":"bool"}],"name":"getQueue","outputs":[{"components":[{"name":"amount","type":"uint256"},{"name":"price","type":"uint256"},{"name":"user","type":"address"}],"name":"ret","type":"tuple[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"sell","outputs":[{"name":"sold","type":"uint256"},{"name":"","type":"address"}],"payable":true,"stateMutability":"payable","type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"price","type":"uint256"}],"name":"PriceCalculated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"length","type":"uint256"}],"name":"showLength","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"s","type":"string"}],"name":"test","type":"event"}]')
VotingContract = web3.eth.contract(abi);
// In your nodejs console, execute contractInstance.address to get the address at which the contract is deployed and change the line below to use your deployed address
contractInstance =  VotingContract.at('0x7e566b95cfdd9599634f7842d3a35f4a4729f10b');
candidates = {"0": "candidate-0", "1": "candidate-1", "2": "candidate-2", "3": "candidate-3", "4": "candidate-4"}

var functionHashes = getFunctionHashes(abi);
// function voteForCandidate() {
//   candidateName = $("#candidate").val();
//   contractInstance.voteForCandidate(candidateName, {from: web3.eth.accounts[1]}, function() {
//     let div_id = candidates[candidateName];
//     $("#" + div_id).html(contractInstance.totalVotesFor.call(candidateName).toString());
//   });
// }

function getFunctionHashes(abi) {
  var hashes = [];
  for (var i=0; i<abi.length; i++) {
    var item = abi[i];
    if (item.type != "function") continue;
    var signature = item.name + "(" + item.inputs.map(function(input) {return input.type;}).join(",") + ")";
    var hash = web3.sha3(signature);
    console.log(item.name + '=' + hash);
    hashes.push({name: item.name, hash: hash});
  }
  return hashes;
}

function findFunctionByHash(hashes, functionHash) {
  for (var i=0; i<hashes.length; i++) {
    if (hashes[i].hash.substring(0, 10) == functionHash.substring(0, 10))
    return hashes[i].name;
  }
  return null;
}

global.buySolar = function () {
  contractInstance.buy($(".buy [name=solarAmount]").val(), {from: web3.eth.accounts[$(".buy [name=id]").val()], value:web3.toWei($(".buy [name=ether]").val(), "ether"), gas:3000000});
}

global.sellSolar = function () {
  contractInstance.sell($(".sell [name=solarAmount]").val(), {from: web3.eth.accounts[$(".sell [name=id]").val()], value:web3.toWei($(".sell [name=ether]").val(), "ether"), gas:3000000});
}

// function tradeSolar() {
//   contractInstance.buy(10, {from: web3.eth.accounts[2], value:web3.toWei(10, "ether"), gas:3000000});
//   contractInstance.sell(10, {from: web3.eth.accounts[1], value:web3.toWei(10, "ether"), gas:3000000});
// }



// // get transaction hash
// web3.eth.getBlock(4).transactions
// // get transaction content
// web3.eth.getTransaction
// var inputData = web3.eth.abi.decodeParameter("uint256", t.input.substring(10));
// console.dir(inputData);
// $('#transactions').append('<tr><td>' + t.blockNumber +
//   '</td><td>' + from +
//   '</td><td>' + "ApolloTrade" +
//   '</td><td>sellEnergy(' + inputData[0].toString() + ')</td></tr>');

$(document).ready(function() {
  // candidateNames = Object.keys(candidates);
  // for (var i = 0; i < candidateNames.length; i++) {
  //   let name = candidateNames[i];
  //   let val = contractInstance.totalVotesFor.call(name).toString()
  //   $("#" + candidates[name]).html(val);
  // }
  candidateNames = [0,1,2,3,4,5,6,7,8,9];
  for (var i = 0; i < candidateNames.length; i++) {
    let name = candidateNames[i];
    // let val = contractInstance.totalVotesFor.call(name).toString()
    let address = web3.eth.accounts[i];
    $("#" + candidates[name]).html(address);
    let ether = web3.eth.getBalance(address).c[0];
    $("#" + "ethers-" + name).html(ether/10000);
  }

  $('#transactions').empty();
  for(let i=0; i<web3.eth.blockNumber; i++) {
    if (web3.eth.getBlock(i).transactions.length > 0) {
      let transactionHash = web3.eth.getBlock(i).transactions[0];
      console.log(transactionHash);

      let oneTransaction = (web3.eth.getTransaction(transactionHash));
      let functionName = findFunctionByHash(functionHashes, oneTransaction.input);
      let inputData = SolidityCoder.decodeParams(["uint256"], oneTransaction.input.substring(10));
      inputData[0] = (inputData[0] > 100)?  0 :  inputData[0];
      if (oneTransaction) {
        $('#transactions').append
        ('<tr><td>' +
        oneTransaction.from + '</td><td>' +
        oneTransaction.to + '</td><td>' +
        functionName + '</td><td>' +
        inputData[0].toString() +
        '</td></tr>'
        );
    }    // console.log(oneTransaction);
  }
}
});
