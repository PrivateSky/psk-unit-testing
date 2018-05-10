
var assert=require("double-check").assert;
var subSwarm = $$.swarm.create("subSwarm",{
    doSomething:function(){
        this.return(null,1);
        this.return(null,2);
        this.return(null,3);
        this.return(null,4);
    }
});

var f = $$.swarm.create("simpleSwarm", {
    protected:{
        count:"int"
    },
    public:{
        xcount:"int",
        callCounter:"int"
    },
    begin:function(callback){
        this.count = 3; //allow only 3 messages
        this.xcount = 0;
        this.callCounter=0;
        this.callback=callback;
        $$.swarm.create("keepAliveLib.subSwarm").swarm("agent", "doSomething").onReturn(this.afterExecution, this.waitForMore);
    },
    waitForMore:function(){
        this.count--;
        this.xcount--;
        this.callCounter++;
        if(this.callCounter==3){
            this.callback();
        }
        assert.equal(this.xcount,0,"Fail in callback sequence");
        return this.count > 0;
    },
    afterExecution: function(err, res){
        console.log("res =",res);
        assert.equal(err,null,"Error");
        this.xcount++;

    }
});