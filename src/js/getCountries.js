//country list with ISO code from source https://css-tricks.com/snippets/javascript/array-of-country-names/

//fetch available countries
var requestOptions = {
  method: "GET",
  redirect: "follow",
};

var countriesList = [];

fetch("https://api.covid19api.com/countries", requestOptions)
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    //Sort objects in an array alphabetically on property of country name
    data.sort(function (a, b) {
      return a.Country.localeCompare(b.Country);
    });
    data.forEach((country) => {
      countriesList.push(country);
    });
  })
  .then(() => {
    createUICountryList();
    console.log(countriesList);
  })
  .then(() => {
    getUserCountry();
  });

// get user's country code with geoplugin
// https://www.geoplugin.com/webservices/javascript

let countryCode = geoplugin_countryCode();
let countryName;

function getUserCountry() {
  countriesList.forEach((country) => {
    if (country.ISO2 == countryCode) {
      countryName = country.Slug;
    }
  });
}

// select UI elements
const UI_changeCountryBtn = document.querySelector(".change-country-btn");
const UI_searchCountry = document.querySelector(".search-country");
const UI_countryList = document.querySelector(".country-list");
const UI_input = document.getElementById("country-input");
const UI_close = document.getElementById("close");

//split country array to 3 <ul> lists
function createUICountryList() {
  const totalCountryNum = countriesList.length;
  let ulColumn = 3;
  let i = 0;
  countriesList.forEach((country, index) => {
    if (index % Math.ceil(totalCountryNum / ulColumn) === 0) {
      // create three <ul>
      let column = document.createElement("ul");
      column.id = `column${i}`;
      UI_countryList.appendChild(column);
      i++;
    }
    // create <li> for each country
    let m = i - 1;
    let item = document.createElement("li");
    item.innerText = country.Country;
    item.id = country.Country;
    item.addEventListener("click", function () {
      fetchData(country.Slug);
    });
    document.getElementById(`column${m}`).appendChild(item);
  });
}

// filter country list
UI_input.addEventListener("input", function () {
  countriesList.forEach((country) => {
    if (
      country.Country.toUpperCase().startsWith(UI_input.value.toUpperCase())
    ) {
      document.getElementById(country.Country).classList.remove("hide");
    } else {
      document.getElementById(country.Country).classList.add("hide");
    }
  });
});

// toggle country list
function toggleList() {
  UI_searchCountry.classList.toggle("hide");
  //clear input
  UI_input.value = "";
  //reset filter
  countriesList.forEach((country) => {
    document.getElementById(country.Country).classList.remove("hide");
  });
}

//event listeners
UI_changeCountryBtn.addEventListener("click", toggleList);
UI_close.addEventListener("click", toggleList);
UI_countryList.addEventListener("click", toggleList);
