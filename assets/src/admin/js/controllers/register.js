import {FileUploader} from 'file-uploader-sdk';

export default (app) => {

  function callListener(e, eventName) {
    // STOP default action
    e.preventDefault();
    e.stopImmediatePropagation();

    // Emit event
    console.log(`Emit: ${eventName}`);
    app.emit(eventName, this);
  }

  const FileUploaderInstance = new FileUploader('#fileUploaderContainer', '#fileUploaderMediaController',  {
    maxFileSize: -1,
    // croppers: [
    //   {
    //     name: '16:9',
    //     value: 16/9
    //   },
    //   {
    //     name: '4:3',
    //     value: 4/3
    //   },
    //   {
    //     name: '1:1',
    //     value: 1/1
    //   }
    // ],
    acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i // default: no restriction
  });

  // $('#fileupload').fileupload({
  //   url: `/api/files`,
  //   dataType: 'json',
  //   beforeSend(xhr){
  //     xhr.setRequestHeader('csrf-token', window.csrf);
  //   },
  //   complete(e, data) {
  //     location.href = '/admin/files';
  //   },
  //   progressall(e, data) {
  //     const progress = parseInt(data.loaded / data.total * 100, 10);
  //     $('#progress .progress-bar').css('width', progress + '%');
  //   }
  // })
  // .prop('disabled', !$.support.fileInput)
  // .parent().addClass($.support.fileInput ? undefined : 'disabled');

  $('#editFile').submit(e => {
    callListener.call(this, e, 'editFile');
  });

  $('.deleteFile').click(e => {
    callListener.call(this, e, 'deleteFile');
  });

  return app;
}
