var app = rpc("localhost", "wb_server");
lastRow = 0;
var id = app.procedure("getId")()
const table = document.getElementById("feed");
checks = [];
var socket = null;

socketport = 4444

rest.get("/api/socketport",(err,res)=>{
  if(err == 200){
    socketport = res
  }else{
    alert(err + " " + res)
  }
})

document.getElementById("agId").innerHTML="ID Agenzia: " + id

load_socket();

function loadCheckboxes(){
  for(i = 0;i<checks.length;i++){
    row = table.insertRow(i)
    cell = row.insertCell(0)
    checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = checks[i].checked
    checkbox.id  = checks[i].name
    checkbox.setAttribute("disabled", true);
    cell.innerHTML = checks[i].name
    cell.appendChild(checkbox);
    if(i+1 == checks.length){
      lastRow = i;
    }
  }
}

function reloadChecks(){
  table.innerHTML = "";
  loadCheckboxes();
}
function load_socket() {
  socket = new WebSocket("ws://localhost:" + socketport,"main");
  
  socket.addEventListener("open", function (event) {
    console.log("connected");
  });

  socket.addEventListener("message", function (event) {
      var msg = JSON.parse(event.data);
      console.log(msg)
      if (msg.operation == "listChecks") {
          console.log("recieved");
          checks = msg.checks;
          table.innerHTML="";
          loadCheckboxes()
      }
  });
}