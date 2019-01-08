var assert = require("assert");

if(typeof karmaHTML !=="undefined"){

    describe("WindowMQ ",function(){
        it("should run interact between window and iframe",function(done){
            this.timeout(5000);
            karmaHTML.index.onstatechange = function(state){
                runInteractionTest(done);
            };
            karmaHTML.index.open();
        });
    });
}

function runInteractionTest(doneCallback){

    var childWindow = document.getElementsByTagName("iframe")[0].contentWindow;
    require("callflow");
    require("launcher");
    let initialValue = {
        foo:"foo",
        bar:"bar",
        someArray:["1","2",[1,2]]
    };

    let secondTestValue = {
        boo:"boo"
    };

    let collectedValue = "Super";

    var interact = require("interact");
    interact.enableIframeInteractions();
    var is = interact.createWindowInteractionSpace("iframe",childWindow);
    is.startSwarm("swarmTest", "start", initialValue, secondTestValue).on({
        step1:function(fValue, sValue){
            assert.deepEqual(fValue, initialValue);
            assert.deepEqual(sValue,secondTestValue);
            this.collectedValue=collectedValue;
            setTimeout(()=>{
                this.swarm("step2", fValue, sValue);
            }, 1000);
        },
        step3:function(fValue, sValue){
            //order is changed
            assert.deepEqual(sValue, initialValue);
            assert.deepEqual(fValue, secondTestValue);

            //change order back
            this.swarm("end", sValue,fValue);
        },
        step4:function (value) {
            assert.deepEqual(this.collectedValue, collectedValue,"Objects should have the same value");
            doneCallback();

        }
    });
}








