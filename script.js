var currentRequest = false; // false so a XMLHttpRequest object will be created onload
var divLaunches = document.querySelector("div#launches ul");

// attempts to instantiate new XMLHttpRequest object
function getRequestObject() {
  try {
    var httpRequest = new XMLHttpRequest();
  }
  catch (requestError) {
    divLaunches.textContent = "Your browser does not support this content.";
    return false;
  }
  return httpRequest;
}

// get launches; default is next 5 regardless of name
function getLaunches(name=false) {
  if (!name) {
    currentRequest.abort();
    currentRequest.open("get","https://launchlibrary.net/1.4/launch?" + "next=5");
    currentRequest.send(null);
  }
  else {
    currentRequest.abort();
    currentRequest.open("get","https://launchlibrary.net/1.4/launch?" + "next=5" + "&name=" + name);
    currentRequest.send(null);
  }
  currentRequest.onreadystatechange = fillLaunches;
}

// parses the launch list, formats them, and figures out which countdown to use
function fillLaunches() {
  if (currentRequest.readyState === 4 && currentRequest.status === 200) {
    var launchesList = JSON.parse(currentRequest.responseText).launches;
    clearLaunches();
    for (let launch of launchesList) {
      formatLaunches(launch);
    }
    document.getElementById("next-date").textContent = launchesList[0].net;

    for (let i=0; i < launchesList.length; i++) {
      launchDate = new Date(launchesList[i].net);
      var x = updateCountdown(launchDate);
      if (x != false) {
        var countdown = setInterval( function() { updateCountdown(launchDate); }, 1000);
        break; // I don't like this either but everything else I'm trying breaks it
      }
    }
  }
}

// adds a paragraph and two span elements for a launch
function formatLaunches(launch) {
  var para = document.createElement("li");
  divLaunches.appendChild(para);
  var spanTime = document.createElement("span");
  var spanLaunch = document.createElement("span");
  spanTime.textContent = launch.net + ": ";
  spanTime.className = "time";
  spanLaunch.textContent = launch.name;
  spanLaunch.className = "launchName";
  para.appendChild(spanTime);
  para.appendChild(spanLaunch);
}

// clears the list of launches displayed by removing those elements
function clearLaunches() {
  var list = document.querySelectorAll("div#launches li");
  for (let item of list) {
    divLaunches.removeChild(item);
  }
}

// updates countdown based on launchdate parameter
// this can be written more cleanly
function updateCountdown(launchDate) {
  var currentDate = new Date();
  var cntdwn = document.getElementById("countdown");
  cntdwn.textContent = "";

  var dateFrom = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), currentDate.getHours(), currentDate.getMinutes(), currentDate.getSeconds()); // ex: 2018 7 1 2 23 50

  var dateTo = Date.UTC(launchDate.getFullYear(), launchDate.getMonth(), launchDate.getDate(), launchDate.getHours(), launchDate.getMinutes(), launchDate.getSeconds());

  if (dateTo - dateFrom < 0) {
    return false; // if launch has already happened return false
  }

  // variables for days, hours, minutes, and seconds left
  var daysUntil = Math.floor((dateTo - dateFrom) / 86400000),
      fractionalDay = (dateTo - dateFrom) % 86400000,
      hoursUntil = Math.floor(fractionalDay / 3600000),
      fractionalHour = fractionalDay % 3600000,
      minutesUntil = Math.floor(fractionalHour / 60000),
      fractionalMinute = fractionalHour % 60000,
      secondsUntil = Math.floor(fractionalMinute / 1000);

  // formatting
  if (daysUntil == 1) {
    cntdwn.textContent += daysUntil + " day";
  }
  else if (daysUntil !== 0){
    cntdwn.textContent += daysUntil + " days";
  }

  if (hoursUntil == 1) {
    cntdwn.textContent += ", " + hoursUntil + " hour";
  }
  else if (hoursUntil !== 0) {
    cntdwn.textContent += ", " + hoursUntil + " hours";
  }

  if (minutesUntil == 1) {
    cntdwn.textContent += ", " + minutesUntil + " minute";
  }
  else if (minutesUntil !== 0) {
    cntdwn.textContent += ", " + minutesUntil + " minutes";
  }

  if (secondsUntil == 1) {
    cntdwn.textContent += ", " + secondsUntil + " second";
  }
  else if (secondsUntil !== 0) {
    cntdwn.textContent += ", " + secondsUntil + " seconds";
  }
}

// if no request object, creates one
if (!currentRequest) {
  currentRequest = getRequestObject();
}

// starts with next 5 launches by default
getLaunches();
