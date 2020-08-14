//select UI elements

const UI_totalCases = document.querySelector(".total-cases .value");
const UI_recovered = document.querySelector(".recovered .value");
const UI_deaths = document.querySelector(".deaths .value");

const UI_newCases = document.querySelector(".total-cases .new-value");
const UI_newRecovered = document.querySelector(".recovered .new-value");
const UI_newDeaths = document.querySelector(".deaths .new-value");

const UI_countryName = document.querySelector(".country-name");
const UI_lineChart = document.getElementById("line-chart").getContext("2d");

//set data variables
let appData = [],
  casesList = [],
  recoveredList = [],
  deathsList = [],
  dates = [],
  formatedDates = [];

// fetch data by country name
//https://documenter.getpostman.com/view/10808728/SzS8rjbc?version=latest

fetchData("usa");
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
        console.log(data);
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

// fetch state table data

let statesData = [];
function fetchStateData() {
  fetch("https://covidtracking.com/api/states", requestOptions)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      data.forEach((state) => {
        statesData.push(state);
      });
    })
    .then(() => {
      //sort states by positive cases
      statesData.sort((a, b) => b.positive - a.positive);
    })
    .then(() => {
      drawUSTable("USdata");
    })
    .then(() => drawUSAMap())
    .then(() => Plotly.newPlot("stateMap", data, layout, config))
    .catch((err) => {
      console.log(err);
    });
}
fetchStateData();
//draw table
var tr, td, tbody, stateName;
function drawUSTable(bodyName) {
  tbody = document.getElementById(bodyName);
  statesData.forEach((state) => {
    //create row
    tr = tbody.insertRow(tbody.rows.length);
    //state name
    td = tr.insertCell(tr.cells.length);
    td.setAttribute("align", "center");
    statesList.forEach((stateItem) => {
      if (stateItem.abbreviation == state.state) {
        stateName = stateItem.name;
      }
    });
    td.innerHTML = stateName;
    //cases
    td = tr.insertCell(tr.cells.length);
    td.setAttribute("align", "center");
    td.innerHTML = state.positive.toLocaleString();
    //death
    td = tr.insertCell(tr.cells.length);
    td.setAttribute("align", "center");
    td.innerHTML = state.death.toLocaleString();
    //death %
    td = tr.insertCell(tr.cells.length);
    td.setAttribute("align", "center");
    td.innerHTML = Number.isNaN(state.death / state.positive)
      ? 0
      : `${((state.death / state.positive) * 100).toFixed(2)}%`;
    //recovered
    td = tr.insertCell(tr.cells.length);
    td.setAttribute("align", "center");
    td.innerHTML =
      state.recovered === null ? "NA" : state.recovered.toLocaleString();
    //tested
    td = tr.insertCell(tr.cells.length);
    td.setAttribute("align", "center");
    td.innerHTML = state.totalTestResults.toLocaleString();
    //test %
    td = tr.insertCell(tr.cells.length);
    td.setAttribute("align", "center");
    td.innerHTML = `${((state.positive / state.totalTestResults) * 100).toFixed(
      2
    )}%`;
  });
}

//////draw state map////
const stateList = [];
const caseList = [];
function drawUSAMap() {
  statesData.forEach((state) => {
    stateList.push(state.state);
    caseList.push(state.positive);
  });
}

var data = [
  {
    type: "choroplethmapbox",
    name: "US states",
    geojson:
      "https://raw.githubusercontent.com/python-visualization/folium/master/examples/data/us-states.json",
    locations: stateList,
    z: caseList,
    colorbar: {
      x: 1,
      y: 0,
      yanchor: "bottom",
      title: { text: "Cases", side: "top" },
    },
  },
];

var layout = {
  mapbox: { style: "streets", center: { lon: -95, lat: 38 }, zoom: 3.2 },
  margin: { t: 0, b: 0 },
  padding: { t: 0, b: 0 },
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
};

var config = {
  mapboxAccessToken:
    "pk.eyJ1Ijoicmhvc3dlbjgyNyIsImEiOiJja2N5MWg4dmIwNW4wMnFxeW1oa3Z1dThtIn0.3jyEzF0c8dNRtAj3rXBUuQ",
  responsive: true,
  displayModeBar: false,
  displayLogo: false,
  showLink: false,
  scrollZoom: false,
};

//////draw world map////

var countryList = [],
  CountryCaseList = [];

fetch("https://api.covid19api.com/summary", requestOptions)
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    console.log(data.Countries);
    data.Countries.forEach((country) => {
      countryList.push(country.Country);
      CountryCaseList.push(country.TotalConfirmed);
    });
  })
  .then(() =>
    Plotly.d3.csv(
      "https://raw.githubusercontent.com/plotly/datasets/master/2010_alcohol_consumption_by_country.csv",
      function () {
        var data = [
          {
            type: "choropleth",
            locationmode: "country names",
            locations: countryList,
            z: CountryCaseList,
            autocolorscale: true,
            colorbar: {
              x: 0.98,
              y: 0,
              yanchor: "bottom",
              title: { text: "Cases", side: "top" },
            },
          },
        ];

        var layout = {
          title: "Confirmed Cases Worldwise",
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          margin: { t: 0, b: 0 },
          padding: { t: 0, b: 0 },
        };

        var config = {
          responsive: true,
          displayModeBar: false,
          displayLogo: false,
          showLink: false,
        };
        Plotly.newPlot("WorldMap", data, layout, config);
      }
    )
  );
