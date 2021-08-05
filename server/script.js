const table = document.getElementById("feed");
const statTableP = document.getElementById("feed_statsP")
const statTableN = document.getElementById("feed_statsN")
var checks = [];
var id;
var socket = null;
let stats = []
var nstats = [];
var pstats = [];

function checkInput(input) {
  if (input.match(/^\d+$/)) {
    return true;
  } else {
    return false;
  }
}
var socketport = 4444

rest.get("/api/socketport", (err, res) => {
  if (err == 200) {
    socketport = res
  } else {
    alert(err + " " + res)
  }
})

load_socket();

function getLastIdChecks() {
  if (checks.length == 0) return 0;
  function parseId(input) {
    return parseInt(input.replace(/\D/g, ''))
  }
  maxId = parseId(checks[0].id);
  for (var i = 0; i < checks.length; i++) {
    id = parseId(checks[i].id)
    if (id != null) {
      if (!(typeof checks[i+1] == "undefined")) {
        if(maxId < parseId(checks[i + 1].id)) {
          maxId = parseId(checks[i + 1].id)
        }
      }
    }
  }
  return maxId
}
function getLastIdStats(p) {
  if (stats.length == 0) return 0;
  var localStats = [];
  if(p) {
    if (pstats.length == 0) return 0;
    localStats = pstats
  }
  else{
    if (nstats.length == 0) return 0;
    localStats = nstats
  } 
  function parseId(input) {
    return parseInt(input.replace(/\D/g, ''))
  }
  maxId = parseId(localStats[0].id)
  for (var i = 0; i < localStats.length; i++) {
    id = parseId(localStats[i].id)
    if (id != null) {
      if (! (typeof localStats[i + 1] === "undefined")) {
        if (maxId < parseId(localStats[i + 1].id)) {
          maxId = parseId(localStats[i + 1].id)
        }
      }
    }
  }
  return maxId
}

function getId(){
  rest.get("/api/id",(err,res)=>{
    if (err == 200){
      id = res
      return res
    }else{
      console.log(err)
      return
    }
  })
}

function updateId(update){
  rest.put("/api/id",update,function(err){
    if (err != 200){
      console.log(err);
      return
    }
  })
}

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

function addStat(name, id, value, isPositive) {
  socket.send(JSON.stringify({
    operation: "add_stat",
    newstat: {
      name: name,
      id: id,
      value: value,
      isPositive: isPositive
    }
  }))
  reloadStats()
}

function deleteStat(id) {
  socket.send(JSON.stringify({
    operation: "delete_stat",
    id: id
  }));
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
  nameIn = document.createElement("input");
  input = document.createElement("input");
  div = document.createElement('div');
  deleteBtn = document.createElement('button');
  div.classList.add("btnCentering");
  deleteBtn.classList.add("btn");
  div.innerHTML = "Delete"
  deleteBtn.type = 'button';
  nameIn.setAttribute("placeholder", stats[i].name)
  if(stats[i].value != ""){
  input.setAttribute("placeholder", stats[i].value)
  }else input.setAttribute("placeholder", 0)
  cell.classList.add("flexboxRow")
  input.id = id
  input.classList.add("sIn")
  nameIn.classList.add("nIn")
  input.setAttribute("isPositive", isPositive)
  if(input.getAttribute("isPositive") == "true") nameIn.classList.add("positiveValue")
  else nameIn.classList.add("negativeValue")
  deleteBtn.addEventListener('click', function () {
    deleteStat(this.parentNode.querySelector(".sIn").id)
  })
  input.addEventListener("blur", function () {
    stat = this.parentNode.querySelector(".sIn")
    updatedStat = {
      name: this.parentNode.querySelector(".nIn").placeholder,
      value: this.value,
      id: stat.id,
      isPositive: stat.getAttribute("isPositive")
    }
    updateStat(stat.id,updatedStat)
  })
  nameIn.addEventListener("blur", function () {
    stat = this.parentNode.querySelector(".sIn")
    updatedStat = {
      name: this.value,
      value: stat.placeholder,
      id: stat.id,
      isPositive: stat.getAttribute("isPositive")
    }
    updateStat(stat.id,updatedStat)
  })
  cell.appendChild(nameIn)
  cell.appendChild(input)
  cell.appendChild(deleteBtn)
  deleteBtn.appendChild(div)
}

function loadStats() {
  for (var i = 0; i < stats.length; i++) {
    if (stats[i].isPositive.toString() == "true") {
      pstats.push(stats[i])
      insertStat(statTableP.insertRow(i), i, stats[i].id, "true")
    } else {
      nstats.push(stats[i])
      insertStat(statTableP.insertRow(i), i,stats[i].id, "false")
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
    checkbox.id = checks[i].id;
    input.setAttribute("placeholder", checks[i].name)
    input.classList.add("nIn")
    cell.classList.add("flexboxRow")
    deleteBtn.addEventListener('click', function () {
      deleteCheck(this.parentNode.childNodes[1].id)
    })
    input.addEventListener("blur", function () {
      var update = {
        name: this.value,
        checked: this.parentNode.childNodes[1].checked,
        id: this.parentNode.childNodes[1].id
      }
      updateCheck(this.parentNode.childNodes[1].id, update)
    })
    checkbox.addEventListener("change", function () {
      var update = {
        name: this.parentNode.querySelector(".nIn").placeholder,
        checked: this.parentNode.childNodes[1].checked,
        id: this.parentNode.childNodes[1].id
      }
      updateCheck(this.parentNode.childNodes[1].id, update)
    })
    cell.appendChild(input)
    cell.appendChild(checkbox);
    cell.appendChild(deleteBtn)
    deleteBtn.appendChild(div)
  }
}

document.getElementById("newcheck").addEventListener('click', () => {
  addCheck("new check", (getLastIdChecks() + 1) + "c")
})

document.getElementById("requiredMax").addEventListener('focus', function () {
  this.setAttribute("isFocused", 'true')
})
document.getElementById("requiredMax").addEventListener('blur', function () {
  this.setAttribute("isFocused", 'false')
})
document.getElementById("requiredMax").addEventListener('keyup', function (key) {
  if (key.key == 'Enter' && this.getAttribute("isFocused")) {
    if (this.value != "") {
      if (checkInput(this.value)) {
        rest.put("/api/max", { max: this.value }, (err, res) => {
          if (err == 200) {
            this.classList.add("valueAccepted");
            this.classList.remove("valueInvalid");
          } else {
            alert(err + " " + res)
          }
        })
      } else {
        this.classList.remove("valueAccepted");
        this.classList.add("valueInvalid");
        this.title = "INVALID INPUT, ONLY NUMBERS ALLOWED"
      }
    } else {
      this.classList.remove("valueAccepted");
      this.classList.remove("valueInvalid");
    }
  }
})

document.getElementById("newstatp").addEventListener("click", function () {
  addStat("newStat", (getLastIdStats(true) + 1) + "ps", 0, "true")
})
document.getElementById("newstatn").addEventListener("click", function () {
  addStat("newStat", (getLastIdStats(false) + 1) + "ns", 0, "false")
})
document.getElementById("agID").placeholder = getId()
document.getElementById("agID").addEventListener("blur",function(){
  updateId({id: this.value.toString()})
  this.placeholder = getId()
})
function load_socket() {
  socket = new WebSocket("ws://localhost:" + socketport, "main");

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
      statTableP.innerHTML = "";
      statTableN.innerHTML = "";
      loadStats();
    }
  });
}