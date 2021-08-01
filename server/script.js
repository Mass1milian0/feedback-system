lastRow = 0;
const table = document.getElementById("feed");
checks = [];
var socket = null;

let stats = []


function checkInput(input) {
  if (input.match(/^\d+$/)) {
    return true;
  } else {
    return false;
  }
}

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

function addCheck(nameP){
    socket.send(JSON.stringify({
      operacion: "add_check",
      new_checks: {
          name: nameP,
          checked: false
      }
  }))
  reloadChecks()
}

function load_socket() {
  socket = new WebSocket("ws://localhost:4444","main");
  
  socket.addEventListener("open", function (event) {
    console.log("connected");
  });

  socket.addEventListener("message", function (event) {
      var msg = JSON.parse(event.data);
      console.log(msg)
      if (msg.operacion == "listChecks") {
          console.log("recieved");
          checks = msg.checks;
          loadCheckboxes()
      }
  });
}