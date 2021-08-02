var rpc = require("./rpc.js");
var datos = require("./datos");

var checkboxes = datos.checkboxes;

var statsPositive = datos.statsPositive;

var statsNegative = datos.statsNegative;

var agID = datos.agID;

var express = require("express"); 
var app = express(); 

app.use(express.json());
app.use("/client",express.static("./client"));
app.use("/server",express.static("./server"));

app.get("/api/id",(req,res)=>{
    try{
        res.status(200).send(agID)
        return;
    }
    catch (err){
        alert(err);
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
app.get("/api/statsPositive",function(req,res){
    try{
        res.status(200).json(statsPositive);
        return;
    }catch(err){
        alert(err);
        res.status(400);
        return;
    }

});
app.get("/api/statsNegative",function(req,res){
    try{
        res.status(200).json(statsNegative);
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
});

app.put("/api/id",(req,res) =>{
    var newID = req.body
    agID = req.body
    res.status(200).send(agID)
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
app.put("/api/statsPositive/:name",function(req,res){
    var stat = req.params.name;
    for(var i = 0;i<statsPositive.length;i++){
        if(stat==statsPositive[i].name){
            statsPositive[i]=req.body;
            res.status(200).send(statsPositive[i]);
            return;
        }
    }
    res.status(404);

});
app.put("/api/statsNegative/:name",function(req,res){
    var stat = req.params.name;
    for(var i = 0;i<statsNegative.length;i++){
        if(stat==statsNegative[i].name){
            statsNegative[i]=req.body;
            res.status(200).send(statsNegative[i]);
            return;
        }
    }
    res.status(404);

});

//client getters

function ListCheckboxes(){
    var checks1 = [];
    for(var i = 0;i<checkboxes.length;i++){
        checks1.push(checkboxes[i]);
    }
    return checks1;

}
function listPStats(){
    var pStats = [];
    for(var i = 0;i<statsPositive.length;i++){
        pStats.push(statsPositive[i]);
    }
    return pStats;

}
function listNStats(){
    var nStats = [];
    for(var i = 0;i<statsNegative.length;i++){
        nStats.push(statsNegative[i]);
    }
    return nStats;

}

function getId(){
    return agID;
}

var listenerPort = process.env.LISTENERPORT || 8080
app.listen(listenerPort, function () {});

var checks = datos.checkboxes
function listChecks(connection){
    connection.sendUTF(JSON.stringify({
        operation: "listChecks",
        checks: checks
    }))
}

var servidor = rpc.server();
var app = servidor.createApp("wb_server"); 

app.register(ListCheckboxes);
app.register(listPStats);
app.register(listNStats);
app.register(getId);

var http = require("http");
var httpServer = http.createServer(); 


var WebSocketServer = require("websocket").server;
var wsServer = new WebSocketServer({
    httpServer: httpServer
});


var port = process.env.PORT || 4444;
httpServer.listen(port, function(){
    
});

var connections = [];

wsServer.on("request", function(request){
    var connection = request.accept("main", request.origin);
    connections.push(connection);
    listChecks(connection);
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
                console.log("got del Req",msg)
                const newChecks = checks.filter(check => check.id != msg.id)
                checks = newChecks;
                for(var i = 0; i<connections.length;i++){
                    listChecks(connections[i]);
                }
            }
            if(msg.operation="reload_check"){
                for(var i = 0; i<connections.length;i++){
                    listChecks(connections[i]);
                }
            }
        }
    })
    connection.on("close",function(reasonCode, description){
        connections.splice(connections.indexOf(connection),1);
    });
});