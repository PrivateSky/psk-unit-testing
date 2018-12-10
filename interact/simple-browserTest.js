describe('console-interact', function () {
    var interact = require("interact");
    interact.enableLocalInteractions();
    var is = interact.createInteractionSpace();
    require("callflow");
    require("launcher");
    let assert = require("assert");

    let firstObj = {foo: "foo", bar: "bar"};
    let secondObj = {buz: "buz", baz: "baz"};
    it('should return the same objects and in the same order ', function (done) {
        $$.swarm.describe("swarmTest", {
            start: function (value, secondValue) {
                this.value = value;
                this.swarm("interaction", "step1", this.value, secondValue);
            },
            step1: "interaction",
            step2: function (value, secondValue) {
                assert.strictEqual(value, secondObj);
                assert.strictEqual(secondValue, firstObj);
                //change the order back
                this.swarm("interaction", "step3", secondValue, value);
            },
            end: function (value, secondValue) {
                assert.strictEqual(value, firstObj);
                assert.strictEqual(secondValue, secondObj);
                done();
            }
        });

        is.startSwarm("swarmTest", "start", firstObj, secondObj).on({
            step1: function (value, secondValue) {
                assert.strictEqual(value, firstObj);
                assert.strictEqual(secondValue, secondObj);
                //change the order
                this.swarm("step2", secondValue, value);
            },
            step3: function (value, secondValue) {
                assert.strictEqual(value, firstObj);
                assert.strictEqual(secondValue, secondObj);
                this.swarm("end", value, secondValue);
            }
        });
    });


});


