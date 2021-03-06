'use strict';

// Dependencies
let router = require('express').Router();

// Require CleverCore
let CleverCore = require('clever-core');

// Load config
let config = CleverCore.loadConfig();

// Load controller
let filesApiCtrl = require('../controllers/files-api');

// Exports
module.exports = function(FilesPackage, app, auth, database, storage) {

  // Get files (?tags[]=clever&tags[]=awesome)
  router.get('/', filesApiCtrl.getFiles);

  // Create new file
  router.post('/', filesApiCtrl.createFile);

  // Get file by id
  router.get('/:id', filesApiCtrl.getFileById);

  // Edit files metadata
  router.put('/metadata', auth.requiresAdmin, filesApiCtrl.editFilesMetadata);

  // Edit file by id
  router.put('/:id', auth.requiresAdmin, filesApiCtrl.editFileById);

  // Delete file
  router.delete('/:id', auth.requiresAdmin, filesApiCtrl.deleteFileById);

  return new CleverCore.CleverRoute(router, 'api', false);

};
