lastRow = -1;
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

function reloadChecks(){
  socket.send(JSON.stringify({
    operation: "reload_check"
  }))
}

function deleteCheck(id) {
  socket.send(JSON.stringify({
      operation: "delete_check",
      id: id
  }));
}

function addCheck(nameP,id){
  socket.send(JSON.stringify({
    operation: "add_check",
    new_checks: {
        name: nameP,
        checked: false,
        id:id
    }
}))
}

function updateCheck(id,update){
  console.log(id,update);
  rest.put("/api/checkboxes/" + id,update, (err,res)=>{
    if (err == 200){
      reloadChecks()
    }else {
      alert(err + " " + res)
    }
  })
}

function loadCheckboxes(){
  for(i = 0;i<checks.length;i++){
    row = table.insertRow(i)
    cell = row.insertCell(0)
    input = document.createElement("input");
    div = document.createElement('div');
    deleteBtn = document.createElement('button');
    checkbox = document.createElement('input');
    div.classList.add("btnCentering");
    deleteBtn.classList.add("btn");
    div.innerHTML="Delete"
    deleteBtn.type = 'button';
    checkbox.type = 'checkbox';
    checkbox.checked = checks[i].checked
    checkbox.id  = i + "c"
    input.setAttribute("placeholder",checks[i].name)
    cell.classList.add("flexboxRow")
    deleteBtn.addEventListener('click',function(){
      console.log("delete REQ sent");
      deleteCheck(this.parentNode.childNodes[1].id)
    })
    input.addEventListener("blur",function(){
      console.log(this.parentNode);
      var update = {
        name: this.value,
        checked: this.parentNode.childNodes[1].checked,
        id: this.parentNode.childNodes[1].id
      }
      updateCheck(this.parentNode.childNodes[1].id,update)
    })
    cell.appendChild(input)
    cell.appendChild(checkbox);
    cell.appendChild(deleteBtn)
    deleteBtn.appendChild(div)
    if(i+1 == checks.length){
      lastRow = i;
    }
  }
}

document.getElementById("newcheck").addEventListener('click',()=>{
  addCheck("test",(lastRow + 1) + "c")
})

socketport = 4444

rest.get("/api/socketport",(err,res)=>{
  if(err == 200){
    socketport = res
  }else{
    alert(err + " " + res)
  }
})

function load_socket() {
  socket = new WebSocket("ws://localhost:"+socketport,"main");
  
  socket.addEventListener("open", function (event) {
    console.log("connected");
  });

  socket.addEventListener("message", function (event) {
      var msg = JSON.parse(event.data);
      console.log(msg)
      if (msg.operation == "listChecks") {
          console.log(msg);
          checks = msg.checks;
          table.innerHTML = "";
          loadCheckboxes()
      }
  });
}