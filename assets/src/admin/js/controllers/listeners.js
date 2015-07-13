export default (app) => {

  function sendDataAjax(options) {
    $.ajax({
      url : options.formURL,
      type: options.method, // POST or PUT or PATCH
      data : options.postData,
      success:function(data, textStatus, jqXHR) {
        location.href = `${options.urlCallback}/${data._id}`;
      },
      error: function(jqXHR, textStatus, errorThrown) {
        // Show the errors to the file
        options.$errorMessage.html(`${jqXHR.responseJSON[0].msg}.`);
        options.$error.removeClass('hidden');

        // Enable the submit form button
        options.$btn.removeClass('disabled');
      }
    });
  }

  app.on('appStarted', () => {
    console.log(`${app.config.name} started`);
  });

  app.on('editFile', (form) => {
    
    const $editFileError = $('#editFileError');
    const $editFileBtn = $('#editFileBtn');
    const options = {
      formURL: $(form).attr('action'),
      method: $(form).attr('method'),
      postData: $(form).serialize(),
      urlCallback: '/admin/files',
      $error: $editFileError,
      $errorMessage: $('#editFileError .message'),
      $btn: $editFileBtn
    }

    // Clear the error message div
    $editFileError.addClass('hidden');

    // Send Ajax
    sendDataAjax(options);

    // Disable the submit form button
    $editFileBtn.addClass('disabled');

  });

  app.on('deleteFile', (btn) => {

    if(!confirm('Are you sure to want delete this file?')) return false;

    const $btn = $(btn);

    console.log($btn.data('id'))

    const request = $.ajax({
      url: `/api/files/${$btn.data('id')}`,
      beforeSend: function (request) {
        request.setRequestHeader('csrf-token', window.csrf);
      },
      method: 'DELETE'
    });

    request.done(function(msg) {
      if(window.urlreload === -1) {
        return location.reload();
      }
      location.href = window.urlreload;
    });

    request.fail(function( jqXHR, textStatus ) {
      console.error(`Request failed: ${textStatus}`);
    });

  });

  return app;
}
