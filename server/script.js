const table = document.getElementById("feed");
const statTableP = document.getElementById("feed_statsP")
const statTableN = document.getElementById("feed_statsN")
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
var socketport = 4444

rest.get("/api/socketport", (err, res) => {
  if (err == 200) {
    console.log(res);
    socketport = res
  } else {
    alert(err + " " + res)
  }
})

load_socket();

function getLastIdChecks() {
  function parseId(input) {
    return parseInt(input.replace(/\D/g, '')) || null
  }
  maxId = parseId(checks[0].id);
  for (var i = 0; i < checks.length; i++) {
    id = parseId(checks[i].id)
    if (id != null) {
      if (!(typeof checks[i+1] == "undefined") && maxId < parseId(checks[i + 1].id)) {
        maxId = parseId(checks[i + 1].id)
      }
    }
  }
  return maxId
}
function getLastIdStats() {
  function parseId(input) {
    return parseInt(input.replace(/\D/g, '')) || null
  }
  maxId = parseId(stats[0].id)
  for (var i = 0; i < stats.length; i++) {
    id = parseId(stats[i].id)
    if (id != null) {
      if (! (typeof stats[i + 1] === "undefined")) {
        console.log(maxId);
        if (maxId < parseId(stats[i + 1].id)) {
          maxId = parseId(stats[i + 1].id)
        }
      }
    }
  }
  return maxId
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
  console.log(id, update);
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
  input.setAttribute("placeholder", stats[i].value)
  cell.classList.add("flexboxRow")
  input.id = id
  input.classList.add("sIn")
  input.setAttribute("isPositive", isPositive)
  deleteBtn.addEventListener('click', function () {
    console.log(this.parentNode.querySelector(".sIn").id);
    deleteStat(this.parentNode.querySelector(".sIn").id)
  })
  input.addEventListener("blur", function () {
    stat = this.parentNode.querySelector(".sIn")
    updatedStat = {
      name: stat.name,
      value: this.value,
      id: stat.id,
      isPositive: stat.isPositive
    }
  })
  nameIn.addEventListener("blur", function () {
    stat = this.parentNode.querySelector(".sIn")
    updatedStat = {
      name: this.value,
      value: stat.value,
      id: stat.id,
      isPositive: stat.isPositive
    }
  })
  cell.appendChild(nameIn)
  cell.appendChild(input)
  cell.appendChild(deleteBtn)
  deleteBtn.appendChild(div)
}

function loadStats() {
  var nstats = [];
  var pstats = [];
  for (var i = 0; i < stats.length; i++) {
    console.log(stats);
    if (stats[i].isPositive) {
      pstats.push(stats[i])
    } else {
      nstats.push(stats[i])
    }
  }
  for (var i = 0; i < pstats.length; i++) {
    insertStat(statTableP.insertRow(i), i, i + "ps", "true")
  }
  for (var i = 0; i < nstats.length; i++) {
    insertStat(statTableP.insertRow(i), i, i + "ns", "false")
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
    cell.classList.add("flexboxRow")
    deleteBtn.addEventListener('click', function () {
      console.log("delete REQ sent");
      deleteCheck(this.parentNode.childNodes[1].id) //FIXME some checks are generated with same id and this deletes everything
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
    checkbox.addEventListener("change", function () {
      var update = {
        name: this.value,
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
        console.log(this.value);
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
  addStat("newStat", (getLastIdStats() + 1) + "ps", 0, "true")
})
document.getElementById("newstatn").addEventListener("click", function () {
  addStat("newStat", (getLastIdStats() + 1) + "ns", 0, "false")
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