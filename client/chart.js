var socket = null;
var stats = null
var canvas = document.getElementById("barChart");
var ctx = canvas.getContext("2d");

load_socket()

function populateData(xArr, yArr) {
  let arr = []
  for (let i in xArr) {
    arr.push({
      "x": xArr[i],
      "y": yArr[i],
    });
  }
  return arr;
}

function getNamesP() {
  var nStatsP = []
  for (var i = 0; i < stats.length; i++) {
    if (stats[i].isPositive.toString() == "true") {
      nStatsP.push(stats[i].name)
    }
  }
  return nStatsP;
}

function getNamesN() {
  var nStatsN = []
  for (var i = 0; i < stats.length; i++) {
    if (stats[i].isPositive.toString() == "false") {
      nStatsN.push(stats[i].name)
    }
  }
  return nStatsN;
}


function getPositiveStats() {
  var statsP = []
  for (var i = 0; i < stats.length; i++) {
    if (stats[i].isPositive.toString() == "true") {
      statsP.push(stats[i].value)
    }
  }
  return statsP;
}

function getNegativeStats() {
  var statsN = []
  for (var i = 0; i < stats.length; i++) {
    if (stats[i].isPositive.toString() == "false") {
      statsN.push(stats[i].value)
    }
  }
  return statsN;
}

function loadChart() {
  rest.get("/api/max", (err1, max) => {
    if (err1 == 200) {
      var data = {
        datasets: [
          {
            label: 'Positive Stats',
            data: populateData(getNamesP(), getPositiveStats()),
            backgroundColor: [
              'rgba(138,252,54,1)'
            ],
            borderColor: [
              'rgb(138,252,54)'
            ],
            borderWidth: 1
          },
          {
            label: 'Negative Stats',
            data: populateData(getNamesN(), getNegativeStats()),
            backgroundColor: [
              'rgba(222,0,0,1)'
            ],
            borderColor: [
              'rgb(222,0,0)'
            ],
            borderWidth: 1
          }]
      };
    }


    const config = {
      type: 'bar',
      data: data,
      options: {
        scales: {
          y: {
            display: true,
            max: parseInt(max),
            beginAtZero: true   // minimum value will be 0.
          }
        }
      }
    };


    var chart = new Chart(
      canvas,
      config
    )
  })
}
function load_socket() {
  socket = new WebSocket(HOST, "main");

  socket.addEventListener("open", function (event) {
    console.log("connected");
  });

  socket.addEventListener("message", function (event) {
    var msg = JSON.parse(event.data);
    console.log(msg)
    if (msg.operation == "listStats") {
      console.log("recieved");
      stats = msg.stats;
      loadChart()
    }
  });
}