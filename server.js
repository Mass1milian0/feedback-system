var rpc = require("./rpc.js");
var data = require("./data");

var checkboxes = data.checkboxes;

var stats = data.stats;

var agID = data.agID;

var statsMax = data.statsMax

var port = process.env.PORT || 4444;

var express = require("express"); 
var app = express(); 

app.use(express.json());
app.use("/client",express.static("./client"));
app.use("/server",express.static("./server"));
app.use("/entry",express.static("./data-entry"));

app.get("/api/max",(req,res)=>{
    try {
        res.status(200).send(statsMax + "");
        return;
    } catch (err) {
        console.log(err);
        res.status(400)
        return;
    }
})

app.get("/api/id",(req,res)=>{
    try{
        res.status(200).send(agID.toString())
        return;
    }
    catch (err){
        console.log(err);
        res.status(400);
        return;
    }
})

app.get("/api/socketport",(req,res)=>{
    try{
        res.status(200).send("4444")
        return;
    }
    catch (err){
        console.log(err);
        res.status(400);
        return;
    }
})

app.get("/api/checkboxes",function(req,res){
    try{
        res.status(200).json(checkboxes);
        return;
    }catch(err){
        alert(err);
        res.status(400);
        return;
    }

});
app.get("/api/stats",function(req,res){
    try{
        res.status(200).json(stats);
        return;
    }catch(err){
        alert(err);
        res.status(400);
        return;
    }

});

app.post("/api/checkboxes/:name",function(req,res){
    checkboxes.push(req.body)
    res.status(200)
    return;
});

app.post("/api/stats/:id",(req,res)=>{
    stats.push(req.body);
    res.status(200);
    return;
})

app.put("/api/max",(req,res)=>{
    statsMax = req.body.max;
    res.status(200).send(statsMax);
    return;
})

app.put("/api/id",(req,res) =>{
    agID = req.body.id;
    res.status(200);
    return;
})


app.put("/api/checkboxes/:id",function(req,res){
    var check = req.params.id;
    for(var i = 0;i<checkboxes.length;i++){
        if(check==checkboxes[i].id){
            checkboxes[i]=req.body;
            res.status(200).send(checkboxes[i]);
            return;
        }
    }
    res.status(404);

});
app.put("/api/stats/:id",function(req,res){
    var stat = req.params.id;
    for(var i = 0;i<stats.length;i++){
        if(stat==stats[i].id){
            stats[i]=req.body;
            res.status(200).send(stats[i]);
            return;
        }
    }
    res.status(404);

});

//client getters
function getMax(){
    return statsMax;
}

function listCheckboxes(){
    var checks1 = [];
    for(var i = 0;i<checkboxes.length;i++){
        checks1.push(checkboxes[i]);
    }
    return checks1;

}

function listStatistics(){
    var stats1 = []
    for(var i = 0;i<stats.length;i++){
        stats1.push(stats[i])
    }
    return stats1;
}

function getId(){
    return agID;
}


var checks = data.checkboxes
function listChecks(connection){
    connection.sendUTF(JSON.stringify({
        operation: "listChecks",
        checks: checks
    }))
}

function listStats(connection){
    connection.sendUTF(JSON.stringify({
        operation: "listStats",
        stats: stats
    }))
}

httpServer = app.listen(port,()=>{
    console.log("listening for connection to " + port)
})

var WebSocketServer = require("websocket").server;
var wsServer = new WebSocketServer({
    httpServer: httpServer
});


var server = rpc.server();
var app = server.createApp("wb_server"); 

app.register(listCheckboxes);
app.register(getId);
app.register(getMax)
app.register(listStatistics)


var connections = [];

wsServer.on("request", function(request){
    var connection = request.accept("main", request.origin);
    connections.push(connection);
    listChecks(connection);
    listStats(connection);
    console.log("Client Connected");
    connection.on("message", function(message){
        if(message.type ==="utf8"){
            var msg = JSON.parse(message.utf8Data);
            if(msg.operation=="add_check"){
                checks.push(msg.new_checks)
                for(var i = 0; i<connections.length;i++){
                    listChecks(connections[i]);
                }
            }
            if(msg.operation=="delete_check"){
                const newChecks = checks.filter(check => check.id != msg.id)
                checks = newChecks;
                for(var i = 0; i<connections.length;i++){
                    listChecks(connections[i]);
                }
            }
            if(msg.operation=="reload_check"){
                for(var i = 0; i<connections.length;i++){
                    listChecks(connections[i]);
                }
            }
            if(msg.operation=="add_stat"){
                console.log(msg.newstat);
                stats.push(msg.newstat)
                for(var i = 0; i<connections.length;i++){
                    listStats(connections[i]);
                }
            }
            if(msg.operation=="delete_stat"){
                const newStats = stats.filter(stat => stat.id != msg.id)
                stats = newStats;
                for(var i = 0; i<connections.length;i++){
                    listStats(connections[i]);
                }
            }
            if(msg.operation=="reload_stats"){
                for(var i = 0; i<connections.length;i++){
                    listStats(connections[i]);
                }
            }
        }
    })
    connection.on("close",function(reasonCode, description){
        connections.splice(connections.indexOf(connection),1);
    });
});