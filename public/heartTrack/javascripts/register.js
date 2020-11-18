function sendRegisterRequest() {
  let email = $('#email').val();
  let password = $('#password').val();
  let fullName = $('#fullName').val();
  let passwordConfirm = $('#passwordConfirm').val();
  let deviceID = $('#deviceID').val();


  // Check to make sure the passwords match
  // FIXME: Check to ensure strong password 
  let check = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
  
  if (password != passwordConfirm) {
    $('#ServerResponse').html("<span class='red-text text-darken-2'>Passwords do not match.</span>");
    $('#ServerResponse').show();
    return;
  }
  
  if(!password.match(check)){
    console.log("password check");
     $('#ServerResponse').html("<span class='red-text text-darken-2'>Passwords should be between 6 to 20 characters and must contain at least one numeric digit, one uppercase and one lowercase letter .</span>");
    $('#ServerResponse').show();
    return;
  }
  

  //device check 
  
  $.ajax({
    url: '/users/register',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({email:email, fullName:fullName, password:password}),
    dataType: 'json'
  })
    .done(registerSuccess)
    .fail(registerError);

//SOS 
/*
  $.ajax({
    url: '/devices/register',
    type: 'POST',
    contentType:'application/json',
    data: JSON.stringify({email:email, deviceID:deviceID})
  })
   .done(registerSuccess)
   .fail(registerError);
*/
}

function registerSuccess(data, textStatus, jqXHR) {
  if (data.success) {  
    window.location = "index.html";
  }
  else {
    $('#ServerResponse').html("<span class='red-text text-darken-2'>Error: " + data.message + "</span>");
    $('#ServerResponse').show();
  }
}

function registerError(jqXHR, textStatus, errorThrown) {
  if (jqXHR.statusCode == 404) {
    $('#ServerResponse').html("<span class='red-text text-darken-2'>Server could not be reached.</p>");
    $('#ServerResponse').show();
  }
  else {
    $('#ServerResponse').html("<span class='red-text text-darken-2'>Error: " + jqXHR.responseJSON.message + "</span>");
    $('#ServerResponse').show();
  }
}

$(function () {
  $('#signup').click(sendRegisterRequest);
});
