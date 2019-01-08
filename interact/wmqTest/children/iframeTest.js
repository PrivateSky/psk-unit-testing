require("callflow");
require("launcher");

$$.swarm.describe("swarmTest", {
    public: {
        collectedValue: "int"
    },
    start: function (firstValue, secondValue) {
        this.value = firstValue;
        this.swarm("interaction", "step1", this.value, secondValue);
    },
    step1: "interaction",
    step2: function (firstValue, secondValue) {
        //change order
        this.swarm("interaction", "step3", secondValue, firstValue);
    },
    step3: "interaction",
    end: function (firstValue, secondValue) {
        this.swarm("interaction", "step4", firstValue, secondValue);
    }
});
var interact = require("interact");
interact.enableIframeInteractions();
var interaction = interact.createWindowInteractionSpace("iframe", window.parent);
interaction.init();