export default (app) => {

  function callListener(e, eventName) {
    // STOP default action
    e.preventDefault();
    e.stopImmediatePropagation();

    // Emit event
    console.log(`Emit: ${eventName}`);
    app.emit(eventName, this);
  }

  $('#fileupload').fileupload({
    url: `/api/files`,
    dataType: 'json',
    beforeSend(xhr){
      xhr.setRequestHeader('csrf-token', window.csrf);
    },
    done(e, data) {
      location.href = '/admin/files'
    },
    progressall(e, data) {
      const progress = parseInt(data.loaded / data.total * 100, 10);
      $('#progress .progress-bar').css('width', progress + '%');
    }
  })
  .prop('disabled', !$.support.fileInput)
  .parent().addClass($.support.fileInput ? undefined : 'disabled');

  $('#editFile').submit(e => {
    callListener.call(this, e, 'editFile');
  });

  $('.deleteFile').click(e => {
    callListener.call(this, e, 'deleteFile');
  });

  return app;
}
