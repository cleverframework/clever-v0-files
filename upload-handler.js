'use strict';

// Module dependencies
const streamBuffers = require('stream-buffers');
const cleverCore = require('clever-core');
const config = cleverCore.loadConfig();
const mongoose = require('mongoose');
const File  = mongoose.model('File');
const Q = require('q');
const Busboy = require('busboy');
const shortid = require('shortid');

// UploadHandler
class UploadHandler {
  constructor() {

  }

  _handleFile(fieldname, file, filename, encoding, mimetype) {
    const defer = Q.defer();
    let fileSize = 0;

    const writableStreamBuffer = new streamBuffers.WritableStreamBuffer({
      initialSize: (100 * 1024),      // start as 100 kilobytes.
      incrementAmount: (10 * 1024)    // grow by 10 kilobytes each time buffer overflows.
    });

    file.on('data', function(data) {
      // console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
      fileSize += data.length;
      writableStreamBuffer.write(data);
    });

    file.on('end', function() {
      defer.resolve({
        buffer: writableStreamBuffer.getContents(),
        bufferSize: fileSize
      });
    });

    file.on('error', function(err) {
      console.log('File [' + fieldname + '] Error');
      console.log('*** ' + err + ' ***');
      defer.reject(err);
    })

    return defer.promise;
  }

  post(req, res, next) {

    const self = this;
    const busboy = new Busboy({ headers: req.headers });
    const buffers = [];
    const promiseWaiters = [];

    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      // console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
      const defer = Q.defer();
      self._handleFile(fieldname, file, filename, encoding, mimetype)
        .then(function(fileUploaded) {
          buffers.push(fileUploaded.buffer);

          const fileParams = {
            title: `${shortid.generate()}_${filename}`,
            key: `${shortid.generate()}_${filename}`,
            ecnoding: encoding,
            mimetype: mimetype,
            private: false, // TODO: protect files into CleverCore/Storage class
            size: fileUploaded.bufferSize
          };

          File.createFile(fileParams, fileUploaded.buffer)
            .then(function(createdFile) {
              defer.resolve(createdFile);
            })
            .catch(function(err) {
              defer.reject(err);
            });
        })
        .catch(defer.reject);
      promiseWaiters.push(defer.promise);
    });

    // busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
    //   console.log('Field [' + fieldname + ']: value: ' + inspect(val));
    // });

    busboy.on('finish', function() {
      // console.log('Done parsing form!');
      Q.all(promiseWaiters).then(function(createdFile) {
        res.json(createdFile);
      }, next)
    });

    req.pipe(busboy);

    // // Set no cache
    // res.setHeader('Pragma', 'no-cache');
    // res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    // res.setHeader('Content-Disposition', 'inline; filename="files.json"');
    //
    // const handler = this;
    // const form = new formidable.IncomingForm();
    //
    // let tmpFiles = [],;
    // let files = [];
    // let map = {};
    // let counter = 1;
    // let redirect;
    //
    // function finish() {
    //   counter -= 1;
    //   if (!counter) {
    //     files.forEach(function(fileInfo) {
    //       fileInfo.initUrls(handler.req);
    //     });
    //     handler.callback({
    //       files: files
    //     }, redirect);
    //   }
    // }
    //
    // form.uploadDir = options.tmpDir;
    // form.on('fileBegin', function(name, file) {
    //   tmpFiles.push(file.path);
    //   var fileInfo = new FileInfo(file);
    //   fileInfo.safeName();
    //   map[path.basename(file.path)] = fileInfo;
    //   files.push(fileInfo);
    // }).on('field', function(name, value) {
    //   if (name === 'redirect') {
    //     redirect = value;
    //   }
    // }).on('file', function(name, file) {
    //   var fileInfo = map[path.basename(file.path)];
    //   fileInfo.size = file.size;
    //   if (!fileInfo.validate()) {
    //     fs.unlink(file.path);
    //     return;
    //   }
    //   fs.renameSync(file.path, options.uploadDir + '/' + fileInfo.name);
    //   if (options.imageTypes.test(fileInfo.name)) {
    //     Object.keys(options.imageVersions).forEach(function(version) {
    //       counter += 1;
    //       var opts = options.imageVersions[version];
    //       imageMagick.resize({
    //         width: opts.width,
    //         height: opts.height,
    //         srcPath: options.uploadDir + '/' + fileInfo.name,
    //         dstPath: options.uploadDir + '/' + version + '/' +
    //           fileInfo.name
    //       }, finish);
    //     });
    //   }
    // }).on('aborted', function() {
    //   tmpFiles.forEach(function(file) {
    //     fs.unlink(file);
    //   });
    // }).on('error', function(e) {
    //   console.log(e);
    // }).on('progress', function(bytesReceived) {
    //   if (bytesReceived > options.maxPostSize) {
    //     handler.req.connection.destroy();
    //   }
    // }).on('end', finish).parse(handler.req);

  }

}

module.exports = UploadHandler;
