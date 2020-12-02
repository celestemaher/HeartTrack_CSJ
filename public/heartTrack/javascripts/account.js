function sendAccountRequest() {
  $.ajax({
    url: '/users/account',
    method: 'GET',
    headers: { 'x-auth' : window.localStorage.getItem("authToken") },
    dataType: 'json'
  })
    .done(accountInfoSuccess)
    .fail(accountInfoError);
}

function accountInfoSuccess(data, textStatus, jqXHR) {
  $('#email').html(data.email);
  $('#fullName').html(data.fullName);
  $('#lastAccess').html(data.lastAccess);
  $('#main').show();

  // Add the devices to the list before the list item for the add device button (link)
  for (let device of data.devices) {
    $("#addDeviceForm").before("<li class='collection-item'>ID: " +
      device.deviceId + ", APIKEY: " + device.apikey + 
      " <button id='ping-" + device.deviceId + "' class='waves-effect waves-light btn'>Ping</button> " +
      " </li>");
    $("#ping-"+device.deviceId).click(function(event) {
      pingDevice(event, device.deviceId);
    });
  }

  for (let heartData of data.userHeartdata) {
    $("#addHeartData").before("<li class='collection-item'>Average Heart Rate: " + heartData.heartRateAvg + 
	"bpm Oxygen Levels: "+ heartData.oxygenLevels +"% </li>");
  }


}
function accountInfoError(jqXHR, textStatus, errorThrown) {
  // If authentication error, delete the authToken 
  // redirect user to sign-in page (which is index.html)
  if (jqXHR.status == 401) {
    window.localStorage.removeItem("authToken");
    window.location = "index.html";
  } 
  else {
    $("#error").html("Error: " + jqXHR.status);
    $("#error").show();
  }
}

// Registers the specified device with the server.
function registerDevice() {
  $.ajax({
    url: '/devices/register',
    method: 'POST',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },  
    contentType: 'application/json',
    data: JSON.stringify({ deviceId: $("#deviceId").val() }), 
    dataType: 'json'
   })
     .done(function (data, textStatus, jqXHR) {
       // Add new device to the device list
       $("#addDeviceForm").before("<li class='collection-item'>ID: " +
       $("#deviceId").val() + ", APIKEY: " + data["apikey"] + 
         " <button id='ping-" + $("#deviceId").val() + "' class='waves-effect waves-light btn ping'>Ping</button> " +
         "</li>");
       $("#ping-"+$("#deviceId").val()).click(function(event) {
         pingDevice(event, device.deviceId);
       });
       hideAddDeviceForm();
     })
     .fail(function(jqXHR, textStatus, errorThrown) {
       let response = JSON.parse(jqXHR.responseText);
       $("#error").html("Error: " + response.message);
       $("#error").show();
     }); 
}

function pingDevice(event, deviceId) {
   $.ajax({
        url: '/devices/ping',
        type: 'POST',
        headers: { 'x-auth': window.localStorage.getItem("authToken") },   
        data: { 'deviceId': deviceId }, 
        responseType: 'json',
        success: function (data, textStatus, jqXHR) {
            console.log("Pinged.");
        },
        error: function(jqXHR, textStatus, errorThrown) {
            var response = JSON.parse(jqXHR.responseText);
            $("#error").html("Error: " + response.message);
            $("#error").show();
        }
    }); 
}

// Show add device form and hide the add device button (really a link)
function showAddDeviceForm() {
  $("#deviceId").val("");          // Clear the input for the device ID
  $("#addDeviceControl").hide();   // Hide the add device link
  $("#addDeviceForm").slideDown(); // Show the add device form
}

// Hides the add device form and shows the add device button (link)
function hideAddDeviceForm() {
  $("#addDeviceControl").show();   // Hide the add device link
  $("#addDeviceForm").slideUp();   // Show the add device form
  $("#error").hide();
}

$(function() {
  if (!window.localStorage.getItem("authToken")) {
    window.location.replace("index.html");
  }
  else {
    sendAccountRequest();
  }

  // Register event listeners
  $("#addDevice").click(showAddDeviceForm);
  $("#registerDevice").click(registerDevice);  
  $("#cancel").click(hideAddDeviceForm);  
});