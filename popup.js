/*CHROME VERSION
Changes between this and Firefox version
browser namespace changed to chrome ex. chrome.storage.local...
chrome.storage.local requires a function and .then doesn't work.
the applications key in the manifest file was removed
*/

//USER SETTINGS-----------------------------------------------------------------------------

// settings variables
var checkEl = document.getElementById("settings");
var thisEl = checkEl.getElementsByTagName("input");

var stats = {};
var opps = {};

const {hostNavigationStats} = stats;
const {opposingHostnames} = opps;

const MAX_ITEMS = 5;

mediaList();

function checkStoredSettings(storedSettings) {
  if (!storedSettings.userSettings) {
    userSettings = {
      check: 1,
      slide: 50
      }
    chrome.storage.local.set({userSettings});
  } else {
    userSettings = storedSettings.userSettings;
    }
  
  thisEl[0].checked = userSettings.check;
  thisEl[1].value = userSettings.slide;
}

var gettingStoredSettings = "";
chrome.storage.local.get(function(results){
  gettingStoredSettings = results;
  checkStoredSettings(gettingStoredSettings);
});


//this is redundant - on click could call storage() directly
//on off toggle
thisEl[0].onclick = function(){
  storage();
}
//slider bar
thisEl[1].oninput = function(){
  storage();
}

function storage(){
  userSettings = {
      check: thisEl[0].checked,
      slide: thisEl[1].value
    }

  // store the objects
  chrome.storage.local.set({userSettings});
  }


//GET WEBSITE STATS--------------------------------------------------------------------------

// Get the saved stats and render the data in the popup window.
var gettingStoredStats = "";
chrome.storage.local.get("hostNavigationStats", function(results){
  gettingStoredStats = results;
  navStats(gettingStoredStats);
}); 

var getOpposingStats = "";
chrome.storage.local.get("opposingNavigationStats", function(results){
  getOpposingStats = results;
  oppStats(getOpposingStats);
}); 

  //listIt(hostNavigationStats, opposingHostnames);

//GRAPH---------------------------------------------------------------------------------------------

function graphIt(faveSites){
  //canvas
  var canvas = document.getElementById("myCanvas");
  var ctx = canvas.getContext("2d");

  //var canvasImage = new Image;
  //canvasImage.src = "images/ConfirmationBias_mediavectorgraph.jpg";

  //ctx.drawImage(canvasImage, 0, 0);

    //white
  ctx.fillStyle = "#ffffff";

  var mediaSources = mediaList();

  //draw all points
  for (i = 0; i< mediaSources.length; i++){
    var X2 = mediaSources[i][1];
    var Y2 = mediaSources[i][2];

    ctx.beginPath();
    ctx.arc((((X2+1)*170)+30),(((1-Y2)*340)+30),2,0,2*Math.PI);
    ctx.fill();
  }

  //draw favorites
  //green
  ctx.fillStyle = "#00ff00";

  //loop through all 5 favorites
  for (c = 0; c< faveSites.length; c++){

    var checkSite = faveSites[c];
    //console.log(checkSite);
    var checkString = checkSite.toString();
    

    //get X and Y of message
    for (i = 0; i< mediaSources.length; i++){
      let mediaString = mediaSources[i][0].toString();

      if (checkString.includes(mediaString) == true){
        //console.log("True!");
        X1 = mediaSources[i][1];
        Y1 = mediaSources[i][2];

        var size = 7 - c;
        ctx.beginPath();
        ctx.arc((((X1+1)*170)+30),(((1-Y1)*340)+30),size,0,2*Math.PI);
        ctx.fill();

        break;
      };
    };
  };
  // draw opposition sites
  //yellow
  ctx.fillStyle = "#ffff00";
}

function navStats(nav){
  if (!nav.hostNavigationStats){
    stats = {}
    //console.log("new nav");
  }
  stats = nav.hostNavigationStats;

  const sortedHostnames = Object.keys(stats).sort((a, b) => {
    return stats[a] <= stats[b];
  });

  listNav(sortedHostnames, stats);

  graphIt(sortedHostnames);
}

function oppStats(opp){
  if (!opp.opposingNavigationStats){
      opps = {}
      //console.log("new opps");
    }
  opps = opp.opposingNavigationStats;

  const sortedOpps = Object.keys(opps).sort((a, b) => {
    return opps[a] <= opps[b];
  });

  listOpp(sortedOpps);

}

function listNav(hostNavigationStats, stats){
 //fave sites
  let listEl = document.getElementById("fave");
  listEl.removeChild(listEl.firstChild);

  //console.log(hostNavigationStats.length);
    
    for (let i=0; i < hostNavigationStats.length; i++) {//
      if (i >= MAX_ITEMS) {
        break;
      }

    const listItem = document.createElement("li");
    const hostname = hostNavigationStats[i];

    listItem.textContent = `${hostname}: ${stats[hostname]} visit(s)`;
    listEl.appendChild(listItem);
    }
}

function listOpp(opposingHostnames){
// hated sites
  let HlistEl = document.getElementById("hated");
    HlistEl.removeChild(HlistEl.firstChild);

    for (let i=0; i < opposingHostnames.length; i++) {
      if (i >= MAX_ITEMS) {
        break;
      }

    var a = document.createElement("a");
    const HlistItem = document.createElement("li");
    const hostname = opposingHostnames[i];
    const prepend = "https://www.";
    var linkHost = prepend.concat(hostname);
    a.textContent = `${hostname}`;
    a.setAttribute('href', linkHost);
    HlistItem.appendChild(a);
    HlistEl.appendChild(HlistItem);
    }
}

function onError(error) {
  console.log(`Error: ${error}`);
}
