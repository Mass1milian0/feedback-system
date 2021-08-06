const table = document.getElementById("feed");
const statTable = document.getElementById("feed_stats")
var checks = [];
var id;
var socket = null;
let stats = []
var nstats = [];
var pstats = [];
var HOST = location.origin.replace(/^http/, 'ws');

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

function updateCheck(id, update) {
  rest.put("/api/checkboxes/" + id, update, (err, res) => {
    if (err == 200) {
      reloadChecks()
    } else {
      alert(err + " " + res)
    }
  })
}

function reloadStats() {
  socket.send(JSON.stringify({
    operation: "reload_stats"
  }))
}

function updateStat(id, update) {
  rest.put("/api/stats/" + id, update, (err, res) => {
    if (err == 200) {
      reloadStats()
    } else {
      alert(err + " " + res)
    }
  })
}

function insertStat(row, i, id, isPositive) {
  cell = row.insertCell(0)
  nameLabel = document.createElement("p");
  input = document.createElement("input");
  nameLabel.innerText = stats[i].name
  if(stats[i].value != ""){
  input.setAttribute("placeholder", stats[i].value)
  }else input.setAttribute("placeholder", 0)
  cell.classList.add("flexboxRow")
  input.id = id
  input.classList.add("sIn")
  nameLabel.classList.add("nIn")
  input.setAttribute("isPositive", isPositive)
  if(input.getAttribute("isPositive") == "true") nameLabel.classList.add("positiveValue")
  else nameLabel.classList.add("negativeValue")
  input.addEventListener("blur", function () {
    stat = this.parentNode.querySelector(".sIn")
    updatedStat = {
      name: this.parentNode.querySelector(".nIn").innerHTML,
      value: this.value,
      id: stat.id,
      isPositive: stat.getAttribute("isPositive")
    }
    updateStat(stat.id,updatedStat)
  })
  cell.appendChild(nameLabel)
  cell.appendChild(input)
}

function loadStats() {
  for (var i = 0; i < stats.length; i++) {
    if (stats[i].isPositive.toString() == "true") {
      pstats.push(stats[i])
      insertStat(statTable.insertRow(i), i, stats[i].id, "true")
    } else {
      nstats.push(stats[i])
      insertStat(statTable.insertRow(i), i,stats[i].id, "false")
    }
  }
}

function loadCheckboxes() {
  for (i = 0; i < checks.length; i++) {
    row = table.insertRow(i)
    cell = row.insertCell(0)
    nameLabel = document.createElement("p");
    checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = checks[i].checked
    checkbox.id = checks[i].id;
    nameLabel.innerText = checks[i].name
    nameLabel.classList.add("nIn")
    cell.classList.add("flexboxRow")
    checkbox.addEventListener("change", function () {
      var update = {
        name: this.parentNode.querySelector(".nIn").innerHTML,
        checked: this.parentNode.childNodes[1].checked,
        id: this.parentNode.childNodes[1].id
      }
      updateCheck(this.parentNode.childNodes[1].id, update)
    })
    cell.appendChild(nameLabel)
    cell.appendChild(checkbox);
  }
}

rest.get("/api/id",(err,res)=>{
  if (err == 200){
    document.getElementById("agId").innerHTML = "ID Agenzia: " + res.toString()
    return res
  }else{
    console.log(err)
    return
  }
})

function load_socket() {
  socket = new WebSocket(HOST, "main");
  socket = new WebSocket("ws");

  socket.addEventListener("open", function (event) {
    console.log("connected");
  });

  socket.addEventListener("message", function (event) {
    var msg = JSON.parse(event.data);
    if (msg.operation == "listChecks") {
      checks = msg.checks;
      table.innerHTML = "";
      loadCheckboxes()
    }
    if (msg.operation == "listStats") {
      stats = msg.stats;
      statTable.innerHTML = "";
      loadStats();
    }
  });
}