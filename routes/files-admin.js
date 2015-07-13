'use strict';

// Dependencies
let router = require('express').Router();

// Require CleverCore
let CleverCore = require('clever-core');

// Load config
let config = CleverCore.loadConfig();

// Load controller
let filesAdminCtrl = require('../controllers/files-admin');

// Exports
module.exports = function(FilesPackage, app, auth, database, storage) {

  router.get('/', auth.requiresAdmin, filesAdminCtrl.showFiles.bind(null, FilesPackage));

  router.get('/:id', auth.requiresAdmin, filesAdminCtrl.showFileById.bind(null, FilesPackage));

  router.get('/:id/edit', auth.requiresAdmin, filesAdminCtrl.editFileById.bind(null, FilesPackage));

  return new CleverCore.CleverRoute(router, 'admin', false);

};
