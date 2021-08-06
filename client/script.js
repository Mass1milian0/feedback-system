lastRow = 0;
const table = document.getElementById("feed");
checks = [];
var socket = null;
var HOST = location.origin.replace(/^http/, 'ws');
var id;

rest.get("/api/id",(err,res)=>{
  if (err == 200){
    document.getElementById("agId").innerHTML="ID Agenzia: " + res
  }else{
    console.log(err)
    return
  }
})



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
  socket = new WebSocket(HOST,"main");
  
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
