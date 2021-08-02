lastRow = -1;
lastRowStatsP = -1;
lastRowStatsN = -1;
const table = document.getElementById("feed");
const statTableP = document.getElementById("feed_statsP")
const statTableP = document.getElementById("feed_statsN")
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

function reloadChecks() {
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

function addCheck(nameP, id) {
  socket.send(JSON.stringify({
    operation: "add_check",
    new_checks: {
      name: nameP,
      checked: false,
      id: id
    }
  }))
}

function addPStat(name,id,value){
  socket.send(JSON.stringify({
    operation: "add_statP",
    newstat: {
      name: name,
      id: id,
      value: value,
      isPositive: true
    }
  }))
}

function updateCheck(id, update) {
  console.log(id, update);
  rest.put("/api/checkboxes/" + id, update, (err, res) => {
    if (err == 200) {
      reloadChecks()
    } else {
      alert(err + " " + res)
    }
  })
}

function insertStat(row,i,id){
  cell = row.insertCell(0)
  input = document.createElement("input");
  div = document.createElement('div');
  deleteBtn = document.createElement('button');
  div.classList.add("btnCentering");
  deleteBtn.classList.add("btn");
  div.innerHTML = "Delete"
  deleteBtn.type = 'button';
  input.setAttribute("placeholder", stats[i].name)
  cell.classList.add("flexboxRow")
  input.id = id
  deleteBtn.addEventListener('click', function () {
    console.log("delete REQ sent");
    //TODO - deleteStat()
  })
  input.addEventListener("blur", function () {
    //TODO - update stats
  })
  cell.appendChild(input)
  cell.appendChild(deleteBtn)
  deleteBtn.appendChild(div)
}

function loadStats(){
  var nstats = [];
  var pstats = [];
  for (var i = 0; i < stats.length; i++){
    if(stats[i].isPositive){
      pstats.push(stats[i])
    }else{
      nstats.push(stats[i])
    }
  }
}

function loadCheckboxes() {
  for (i = 0; i < checks.length; i++) {
    row = table.insertRow(i)
    cell = row.insertCell(0)
    input = document.createElement("input");
    div = document.createElement('div');
    deleteBtn = document.createElement('button');
    checkbox = document.createElement('input');
    div.classList.add("btnCentering");
    deleteBtn.classList.add("btn");
    div.innerHTML = "Delete";
    deleteBtn.type = 'button';
    checkbox.type = 'checkbox';
    checkbox.checked = checks[i].checked
    checkbox.id = i + "c"
    input.setAttribute("placeholder", checks[i].name)
    cell.classList.add("flexboxRow")
    deleteBtn.addEventListener('click', function () {
      console.log("delete REQ sent");
      deleteCheck(this.parentNode.childNodes[1].id)
    })
    input.addEventListener("blur", function () {
      console.log(this.parentNode);
      var update = {
        name: this.value,
        checked: this.parentNode.childNodes[1].checked,
        id: this.parentNode.childNodes[1].id
      }
      updateCheck(this.parentNode.childNodes[1].id, update)
    })
    //TODO - add update on check
    cell.appendChild(input)
    cell.appendChild(checkbox);
    cell.appendChild(deleteBtn)
    deleteBtn.appendChild(div)
    if (i + 1 == checks.length) {
      lastRow = i;
    }
  }
}

document.getElementById("newcheck").addEventListener('click', () => {
  addCheck("new check", (lastRow + 1) + "c")
})

document.getElementById("requiredMax").addEventListener('focus', function () {
  this.setAttribute("isFocused", 'true')
})
document.getElementById("requiredMax").addEventListener('blur', function () {
  this.setAttribute("isFocused", 'false')
  if (this.value != "") {
    if (checkInput(this.value)) {
      rest.put("/api/max", this.value, (err, res) => {
        if (err == 200) {
          this.classList.add("valueAccepted");
          this.classList.remove("valueInvalid");
        } else {
          alert(err + " " + res)
        }
      })
    }else{
      this.classList.remove("valueAccepted");
      this.classList.add("valueInvalid");
      this.title = "INVALID INPUT, ONLY NUMBERS ALLOWED"
    }
  }else{
    this.classList.remove("valueAccepted");
    this.classList.remove("valueInvalid");
  }
})
document.getElementById("requiredMax").addEventListener('keyup', function (key) {
  if (key == 'enter' && this.isFocused) {
    if (this.value != "") {
      if (checkInput(this.value)) {
        rest.put("/api/max", this.value, (err, res) => {
          if (err == 200) {
            this.classList.add("valueAccepted");
            this.classList.remove("valueInvalid");
          } else {
            alert(err + " " + res)
          }
        })
      }else{
        this.classList.remove("valueAccepted");
        this.classList.add("valueInvalid");
        this.title = "INVALID INPUT, ONLY NUMBERS ALLOWED"
      }
    }else{
      this.classList.remove("valueAccepted");
      this.classList.remove("valueInvalid");
    }
  }
})



socketport = 4444

rest.get("/api/socketport", (err, res) => {
  if (err == 200) {
    socketport = res
  } else {
    alert(err + " " + res)
  }
})

function load_socket() {
  socket = new WebSocket("ws://localhost:" + socketport, "main");

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
    if(msg.operation == "listStats"){
      //TODO - get both postive and negative stats
    }
  });
}