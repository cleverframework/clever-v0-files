'use strict';

// Dependencies
let router = require('express').Router();

// Require CleverCore
let CleverCore = require('clever-core');

// Load config
let config = CleverCore.loadConfig();

// Load controller
let imageGalleriesAdminCtrl = require('../controllers/image-galleries-admin');

// Exports
module.exports = function(ImageGalleriesPackage, app, auth, database, storage) {

  // Show registration form
  router.get('/', auth.requiresAdmin, imageGalleriesAdminCtrl.showUsers.bind(null, ImageGalleriesPackage));

  router.get('/create', auth.requiresAdmin, imageGalleriesAdminCtrl.createUser.bind(null, ImageGalleriesPackage));

  router.get('/:id', auth.requiresAdmin, imageGalleriesAdminCtrl.showUser.bind(null, ImageGalleriesPackage));

  router.get('/:id/edit/:opt?', auth.requiresAdmin, imageGalleriesAdminCtrl.editUser.bind(null, ImageGalleriesPackage));

  return new CleverCore.CleverRoute(router, 'admin', false);

};
