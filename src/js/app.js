//select UI elements

const UI_totalCases = document.querySelector(".total-cases .value");
const UI_recovered = document.querySelector(".recovered .value");
const UI_deaths = document.querySelector(".deaths .value");

const UI_newCases = document.querySelector(".total-cases .new-value");
const UI_newRecovered = document.querySelector(".recovered .new-value");
const UI_newDeaths = document.querySelector(".deaths .new-value");

const UI_countryName = document.querySelector(".country-name");
const UI_lineChart = document.getElementById("line-chart").getContext("2d");

// get user's country code with geoplugin
// https://www.geoplugin.com/webservices/javascript

let countryCode = geoplugin_countryCode();
let countryName;

countryList.forEach((country) => {
  if (country.code == countryCode) {
    countryName = country.name;
  }
});

//set data variables
let appData = [],
  casesList = [],
  recoveredList = [],
  deathsList = [],
  dates = [],
  formatedDates = [];

// set API key and secret
var APIHost = config.API_HOST;
var APIKey = config.API_KEY;

// fetch data by country name
// https://rapidapi.com/astsiatsko/api/covid19-monitor-pro?endpoint=apiendpoint_39899edb-4119-4f87-867f-64e0a5a0acb0

var requestOptions = {
  method: "GET",
  redirect: "follow",
};
function fetchData(country) {
  // clean previous data saved on the lists
  UI_countryName.innerHTML = "Loading...";
  (casesList = []),
    (recoveredList = []),
    (deathsList = []),
    (dates = []),
    (formatedDates = []),
    //fetch data
    fetch(`https://api.covid19api.com/total/country/${country}`, requestOptions)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        data.forEach((date) => {
          appData.push(date);
          formatedDates.push(formatDate(date.Date));
          casesList.push(parseInt(date.Confirmed));
          recoveredList.push(parseInt(date.Recovered));
          deathsList.push(parseInt(date.Deaths));
        });
      })
      .then(() => {
        repaintUI();
      })
      .catch((err) => {
        console.log(err);
      });
}

fetchData(countryName);

//repaint UI everytime when new API request is made

function repaintUI() {
  updateUI();
  drawChart();
}

function updateUI() {
  let latestDay = appData[appData.length - 1];
  let secondToLastDay = appData[appData.length - 2];
  UI_countryName.innerHTML = latestDay.Country;

  UI_totalCases.innerHTML = latestDay.Confirmed.toLocaleString() || 0;
  UI_deaths.innerHTML = latestDay.Deaths.toLocaleString() || 0;
  UI_recovered.innerHTML = latestDay.Recovered.toLocaleString() || 0;

  UI_newCases.innerHTML = (
    parseInt(latestDay.Confirmed) - parseInt(secondToLastDay.Confirmed)
  ).toLocaleString();
  UI_newDeaths.innerHTML = (
    parseInt(latestDay.Deaths) - parseInt(secondToLastDay.Deaths)
  ).toLocaleString();
  UI_newRecovered.innerHTML = (
    parseInt(latestDay.Recovered) - parseInt(secondToLastDay.Recovered)
  ).toLocaleString();
}

let linearChart;
//Chart.defaults.scale.gridLines.drawOnChartArea  = false;
function drawChart() {
  //remove previous chart
  if (linearChart) {
    linearChart.destroy();
  }
  // draw new chart
  linearChart = new Chart(UI_lineChart, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Total Cases",
          data: casesList,
          backgroundColor: "red",
          borderColor: "red",
          borderWidth: 1,
          fill: false,
        },
        {
          label: "Recovered",
          data: recoveredList,
          backgroundColor: "green",
          borderColor: "green",
          borderWidth: 1,
          fill: false,
        },
        {
          label: "Death",
          data: deathsList,
          backgroundColor: "black",
          borderColor: "black",
          borderWidth: 1,
          fill: false,
        },
      ],
      labels: formatedDates,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      title: {
        display: true,
        text: `Last updated: ${appData[appData.length - 1].Date.slice(0, 10)}`,
        fontSize: 13,
      },
      scales: {
        xAxes: [
          {
            gridLines: {
              display: false,
            },
          },
        ],
        yAxes: [
          {
            gridLines: {
              display: true,
            },
          },
        ],
      },
    },
  });
}

//format date lables on x axis
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDate(dateString) {
  let date = new Date(dateString);
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

////////////////confirmed cases world map //////

const mapboxToken =
  "pk.eyJ1Ijoicmhvc3dlbjgyNyIsImEiOiJja2N5MWg4dmIwNW4wMnFxeW1oa3Z1dThtIn0.3jyEzF0c8dNRtAj3rXBUuQ";

function markerColor(count) {
  if (count <= 5000) {
    return "marker1";
  }
  if (count >= 5000 && count <= 50000) {
    return "marker2";
  }
  if (count >= 50000 && count >= 500000) {
    return "marker3";
  } else {
    return "marker4";
  }
}
mapboxgl.accessToken = mapboxToken;
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v10",
  zoom: 1.5,
  center: [-30, 30],
});

fetch("https://covid19-data.p.rapidapi.com/all", {
  method: "GET",
  headers: {
    "x-rapidapi-host": "covid19-data.p.rapidapi.com",
    "x-rapidapi-key": "a23d8a691bmsh760305aadca0fdcp134494jsnfa5f067a8454",
  },
})
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    data.forEach((country) => {
      // create a DOM element for the marker
      var el = document.createElement("div");
      el.className = `marker + ${markerColor(country.confirmed)}`;

      // add marker to map
      new mapboxgl.Marker(el)
        .setLngLat([country.longitude, country.latitude])
        .addTo(map);
    });
  })

  .catch((err) => {
    console.log(err);
  });

// fetch state data
let statesData = [];
function fetchStateData() {
  fetch("https://covidtracking.com/api/states", requestOptions)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
      data.forEach((state) => {
        statesData.push(state);
      });
    })
    .then(() => {
      //sort states by positive cases
      statesData.sort((a, b) => b.positive - a.positive);
    })
    .then(() => {
      drawUSTable();
    });
}

//draw table
function drawUSTable() {
  var tr, td;
  var tbody = document.getElementById("USdata");
  statesData.forEach((state) => {
    tr = tbody.insertRow(tbody.rows.length);
    td = tr.insertCell(tr.cells.length);
    td.setAttribute("align", "center");
    td.innerHTML = state.state;
    td = tr.insertCell(tr.cells.length);
    td.setAttribute("align", "center");
    td.innerHTML = state.positive.toLocaleString();
    td = tr.insertCell(tr.cells.length);
    td.setAttribute("align", "center");
    td.innerHTML = state.death.toLocaleString();
    td = tr.insertCell(tr.cells.length);
    td.setAttribute("align", "center");
    td.innerHTML = Number.isNaN(state.death / state.positive)
      ? 0
      : `${((state.death / state.positive) * 100).toFixed(2)}%`;
    td = tr.insertCell(tr.cells.length);
    td.setAttribute("align", "center");
    td.innerHTML =
      state.recovered === null ? "NA" : state.recovered.toLocaleString();
    td = tr.insertCell(tr.cells.length);
    td.setAttribute("align", "center");
    td.innerHTML = state.totalTestResults.toLocaleString();
    td = tr.insertCell(tr.cells.length);
    td.setAttribute("align", "center");
    td.innerHTML = `${((state.positive / state.totalTestResults) * 100).toFixed(
      2
    )}%`;
  });
}

fetchStateData();
