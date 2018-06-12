const cutil  = $$.requireModule("signsensus/lib/consUtil");
const ssutil = $$.requireModule("signsensus/lib/ssutil");

var pset = require("../../../../../psk-unit-testing/signsensus/pds/utilityCreateSet").set;

var arr = cutil.orderTransactions(pset);


console.log(arr); //check the order, specially regarding the faked  T3 transaction that could oscillate to  be first or second: T1,3|T2|T4