'use strict';

// Module dependencies
const mongoose = require('mongoose');
const File = mongoose.model('File');
const async = require('async');
const config = require('clever-core').loadConfig();
const UploadHandler = require('../upload-handler');
const util = require('../util');

// Find all files
exports.getFiles = function(req, res, next) {
  File.getFiles(req.query.start, req.query.limit)
    .then(util.sendObjectAsHttpResponse.bind(null, res, 200))
    .catch(util.passNext.bind(null, next));
};

// Find file by id
exports.getFileById = function(req, res, next) {
  File.getFileById(req.params.id)
    .then(util.sendObjectAsHttpResponse.bind(null, res, 200))
    .catch(util.passNext.bind(null, next));
};

// Create file
exports.createFile = function(req, res, next) {
  const handler = new UploadHandler();
  handler.post(req, res, next);
};

// Edit files
exports.editFilesMetadata = function(req, res, next) {

  req.assert('files', 'Files is mandatory').notEmpty();
  req.assert('metadata_name', 'MetadataName is mandatory').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).json(errors);
  }

  File.editFilesMetadata(req.body.files, req.body.metadata_name)
    .then(util.sendObjectAsHttpResponse.bind(null, res, 202))
    .catch(util.sendErrorAsHttpResponse.bind(null, res, 400));
};

// Edit file by id
exports.editFileById = function(req, res, next) {

  // Optionals
  req.assert('key', 'Key cannot be empty').notEmpty();
  req.assert('value', 'Value cannot be empty').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).json(errors);
  }

  File.editFileById(req.params.id, req.body)
    .then(util.sendObjectAsHttpResponse.bind(null, res, 202))
    .catch(util.sendErrorAsHttpResponse.bind(null, res, 400));
};

// Delete file by id
exports.deleteFileById = function(req, res, next) {
  File.deleteFileById(req.params.id)
    .then(util.sendObjectAsHttpResponse.bind(null, res, 202))
    .catch(util.passNext.bind(null, next));
};
