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

function displayCurrentTime(time){
  if(time == 100){
    return "1:00am";
  }
  else if(time == 200){
    return "2:00am";
  }
  else if(time == 300){
    return "3:00am";
  }
  else if(time == 400){
    return "4:00am";
  }
  else if(time == 500){
    return "5:00am";
  }
  else if(time == 600){
    return "6:00am";
  }
  else if(time == 700){
    return "7:00am";
  }
  else if(time == 800){
    return "8:00am";
  }
  else if(time == 900){
    return "9:00am";
  }
  else if(time == 1000){
    return "10:00am";
  }
  else if(time == 1100){
    return "11:00am";
  }
  else if(time == 1200){
    return "12:00pm";
  }
  else if(time == 1300){
    return "1:00pm";
  }
  else if(time == 1400){
    return "2:00pm";
  }
  else if(time == 1500){
    return "3:00pm";
  }
  else if(time == 1600){
    return "4:00pm";
  }
  else if(time == 1700){
    return "5:00pm";
  }
  else if(time == 1800){
    return "6:00pm";
  }
  else if(time == 1900){
    return "7:00pm";
  }
  else if(time == 2000){
    return "8:00pm";
  }
  else if(time == 2100){
    return "9:00pm";
  }
  else if(time == 2200){
    return "10:00pm";
  }
  else if(time == 2300){
    return "11:00pm";
  }
  else if(time == 2400){
    return "12:00pm";
  }
  
}

function accountInfoSuccess(data, textStatus, jqXHR) {
  $('#email').html(data.email);
  $('#fullName').html(data.fullName);
  var lastAccessTemp = new Date(data.lastAccess);
  $('#lastAccess').html(lastAccessTemp.toLocaleString('en-US', {timeZone: 'America/Denver', hour12: false}));
  $('#main').show();


  $(".crStartTime td").html(displayCurrentTime(data.startTime));
  $(".crStopTime td").html(displayCurrentTime(data.stopTime));
  $(".crReminderTime td").html(data.reminderTime);
   


  // Add the devices to the list before the list item for the add device button (link)
  for (let device of data.devices) {
    $("#addDeviceForm").before("<li class='collection-item'>ID: " +
      device.deviceId + ", APIKEY: " + device.apikey + 
      " <button id='delete-" + device.deviceId + "' class='waves-effect waves-light btn'>Delete</button> " +
      " </li>");
    $("#delete-"+device.deviceId).click(function(event) {
      //deleteDevice
      deleteDevice(event, device.deviceId);
    });
  }
  
  //display week summary view 
  //showing a chart with users average, minmum, max heart rate for the past 7 days
  /*Loop through all data from the past 7 days then find the Average, Min, Max heart rate and display in a chart */
  let average = 0;
  let sum = 0;
  let total= 0; 
  let min = 0; 
  let max = 0;  
  
  //theoretically finds the time from 7 days ago
  let time7daysAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));

  for (let heartData of data.userHeartdata) {
    let tempDate = new Date(heartData.timeCollected);
    console.log(tempDate + " || " + time7daysAgo);
    if(tempDate > time7daysAgo){
      if(total == 0){
        max = heartData.heartRateAvg;
        min = heartData.heartRateAvg;
      }
      
      sum = sum + heartData.heartRateAvg;
      total ++;
      if(heartData.heartRateAvg > max){
        max = heartData.heartRateAvg;
      }
      if(heartData.heartRateAvg < min){
        min = heartData.heartRateAvg;
      }
    }
  } 
  if(min == 0 && max == 0){
    $(".avgHrtRate td").html("No data has been recorded");
    $(".minHrtRate td").html("No data has been recorded");
    $(".maxHrtRate td").html("No data has been recorded");

  }
  else{
    average = sum / total;
    $(".avgHrtRate td").html(average + "bpm");
    $(".minHrtRate td").html(min + "bpm");
    $(".maxHrtRate td").html(max + "bpm");
  }
 
}


function deleteDevice(event, deviceId){
  $.ajax({
        url: '/devices/delete',
        type: 'POST',
        headers: { 'x-auth': window.localStorage.getItem("authToken") },
        data: { 'deviceId': deviceId }, 
        responseType: 'json',
        success: function (data, textStatus, jqXHR) {
            console.log("Deleted.");
            window.location = "account.html";
        },
        error: function(jqXHR, textStatus, errorThrown) {
            var response = JSON.parse(jqXHR.responseText);
            $("#error").html("Error: " + response.message);
            $("#error").show();
        }
    }); 
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
          " <button id='delete-" + $("#deviceId").val() + "' class='waves-effect waves-light btn'>Delete</button> " +
         "</li>");
       
       $("#delete-"+$("#deviceId").val()).click(function(event) {
      //deleteDevice
        deleteDevice(event, device.deviceId);
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

function showUpdateInfoForm(){
  $("#updateName").val("");
  $("#updateInfoControl").hide();
  $("#updateInfoForm").slideDown();
}

function showUpdateTimeForm(){
  $("#selectTimeForm").slideDown();
  $("#updateTime").hide();
}

// Hides the add device form and shows the add device button (link)
function hideAddDeviceForm() {
  $("#addDeviceControl").show();   // Hide the add device link
  $("#addDeviceForm").slideUp();   // Show the add device form
  $("#error").hide();
}

//hides the update information form
function hideUpdateForm(){
  $("#updateInfoControl").show();
  $("#updateInfoForm").slideUp();
  $("#updateError").hide();
}

function hideUpdateTimeForm(){
  $("#selectTimeForm").slideUp();
  $("#updateTime").show();
}

function updateAccountInfo(){
  console.log("update account");

  let newPassword = $('#newPassword').val();
  let updateName = $('#updateName').val();
  let newPasswordConfirm = $('#newPasswordConfirm').val();
  let error = false;

  let check = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
  if(!(newPassword == "")){
    if(newPassword != newPasswordConfirm) {
      //display error response
      $("#updateError").html("Error: Passwords don't match");
      $("#updateError").show();
      return;
    }
   if(!newPassword.match(check)){
      console.log("password check");
      $("#updateError").html("Error: Password not strong engough");
      $("#updateError").show();
      //desplay error response
      return;
    }
  }
  console.log(updateName + newPassword);
  if(updateName != "" || newPassword != ""){
    $.ajax({
    url: '/users/updateAccount',
    method: 'PUT',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },  
    data: {updateName:updateName, newPassword:newPassword},
    dataType: 'json'
    })
    .done(displayNewName(updateName)); 
    hideUpdateForm();
  }
  else{
    $("#updateError").html("Error: No Information Entered to Update");
    $("#updateError").show();
  }
}

function displayNewName(updateName){
   if(updateName != ""){
      $("#fullName").html(updateName);
    }
}

function updateTimeRecording(){
  let startTime = $("#startTime").val();
  let stopTime = $("#stopTime").val();
  let incrementer = $("#incrementer").val();
  $.ajax({
    url: '/users/changeTime',
    method: 'PUT',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    data: {startTime: startTime, stopTime: stopTime, incrementer: incrementer},
    dataType: 'json'
  });

  hideUpdateTimeForm();
  $(".crStartTime td").html(displayCurrentTime(startTime));
  $(".crStopTime td").html(displayCurrentTime(stopTime));
  $(".crReminderTime td").html(incrementer);

}

$(function() {
  if (!window.localStorage.getItem("authToken")) {
    window.location.replace("index.html");
  }
  else {
    sendAccountRequest();
  }

  // Register Device event listeners
  $("#addDevice").click(showAddDeviceForm);
  $("#registerDevice").click(registerDevice);  
  $("#cancel").click(hideAddDeviceForm);  

  //update information
  $("#updateInfo").click(showUpdateInfoForm);
  $("#update").click(updateAccountInfo);
  $("#cancelUpdate").click(hideUpdateForm);
  $("#getDailyBPM").click(function() {
    window.location.replace("BPM.html");
  });
  $("#getDailyS02").click(function() {
    window.location.replace("S02.html");
  });
  //update time recordings
  //$("#startTime").change(updateTimeRecording);
  //$("#stopTime").change(updateTimeRecording);
  //$("#incrementer").change(updateTimeRecording);
  $("#submit").click(updateTimeRecording);
  $("#updateTime").click(showUpdateTimeForm);
  $("#cancelTime").click( hideUpdateTimeForm);
  
});

