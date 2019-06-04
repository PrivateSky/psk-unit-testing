require("../../../builds/devel/pskruntime");
require("../../../builds/devel/virtualMQ");
require("../../../builds/devel/psknode");

const assert = require("double-check").assert;
const VirtualMQ  = require('virtualmq');
const CHANNEL_NAME = Buffer.from('testChannel').toString('base64');
const fs = require("fs");
const http = require("http");

try{
    folder = fs.mkdtempSync("test");
}catch(err){
    console.log("Failed to create tmp directory");
}

let port = 8089;
//var server = new Server(sslConfig).listen(port);
function createServer(callback){
    var server = VirtualMQ.createVirtualMQ(port, folder, undefined, (err, res)=>{
        if(err){
            console.log("Failed to create VirtualMQ server on port ", port);
            console.log("Trying again...");
            if(port >0 && port< 50000){
                port++;
                createServer(callback);
            }else{
                console.log("There is no available port to start VirtualMQ instance need it for test!");
            }            
        }else{
            console.log("Server ready and available on port ", port);
            callback(server);
        }
    });
}

createServer((server)=>{
    assert.callback("VirtualMQ channel request test", finish=>{

            const options = {
                host: '127.0.0.1',
                port: port,
                path: '/'+CHANNEL_NAME,
                method: 'GET'
            };

            http.get(`http://localhost:${port}/${CHANNEL_NAME}`, (resp) => {
                let data = '';

                // A chunk of data has been recieved.
                resp.on('data', (chunk) => {
                    data += chunk;
                });

                // The whole response has been received. Print out the result.
                resp.on('end', () => {
                    console.log(JSON.parse(data).explanation);
                });

                }).on("error", (err) => {
                console.log("Error: " + err.message);
                });
            
            // Make a request
            var req = http.request(options, (res) => {
                console.log(res);
                    const statusCode = res;
                    console.log(statusCode);
                    let error;
                    if (statusCode >= 400) {
                        error = new Error('Request Failed.\n' +
                            `Status Code: ${statusCode}`);
                    }
            
                    if (error) {
                        console.log(error);
                        res.resume();
                        return;
                    }
            
                    let rawData = '';
                    console.log("Setting listners");
                    res.on('data', (chunk) => { rawData += chunk; });
                    res.on('end', () => {
                        try {
                        console.log(rawData);
                        } catch (err) {
                            //callback(err);
                        }
                    });
                });
                req.write("");
          req.end();

       /*client.post('/:testChannel_01', function (req, res) {
			$$.flow.start("RemoteSwarming").startSwarm(req.params.testChannel_01, req, function (err, result) {
				res.statusCode = 201;
				if (err) {
					console.log(err);
					res.statusCode = 500;
				}
                res.end();
               //assert.true(201==res.statusCode,`DIDN'T WORK`);
			});
        });

        server.get('/:testChannel_01', function(req, res){
            $$.flow.start("RemoteSwarming").waitForSwarm(req.params.testChannel_01, res, function (err, result, confirmationId) {
				if (err) {
					console.log(err);
					res.statusCode = 500;
				}else res.statusCode = 201;
				let responseMessage = result;
				if((req.query.waitConfirmation || 'false')  === 'false') {
					res.on('finish', () => {
						$$.flow.start('RemoteSwarming').confirmSwarm(req.params.testChannel_01, confirmationId, (err) => {});
					});
				} else {
					responseMessage = {result, confirmationId};
				}
				res.write(JSON.stringify(responseMessage));
                res.end();
                console.log(responseMessage);
                //assert.true(201==res.statusCode,`DIDN'T WORK`);
			});
        })*/
        //assert.true(201, res.statusCode);
       
       
        // finish();
       // process.exit(0);
    })
}, 50000);


/*
var f = $$.flow.describe("Existing Channel",{
    init:function(cb){
        this.cb = cb;
        VirtualMQ.subscribe(CHANNEL_NAME, function(){});
        this.test();
    },
    test:function() {
        assert.true(VirtualMQ.hasChannel(CHANNEL_NAME) == true, "Could not subscribe")
        this.cb();
    }
})();
assert.callback("Existing Channel", function(callback){
    f.init(callback);
},1500);
*/
