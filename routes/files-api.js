'use strict';

// Dependencies
let router = require('express').Router();

// Require CleverCore
let CleverCore = require('clever-core');

// Load config
let config = CleverCore.loadConfig();

// Load controller
let imageGalleriesApiCtrl = require('../controllers/image-galleries-api');

// Exports
module.exports = function(ImageGalleriesPackage, app, auth, database, storage) {

  /**
   * Gallery
   */

  // Get galleries
  router.get('/', imageGalleriesApiCtrl.getGalleries);

  // Get gallery by id
  router.get('/:id', imageGalleriesApiCtrl.getGalleryById);

  // Get gallery by slug
  router.get('/:slug', imageGalleriesApiCtrl.getGalleryBySlug);

  // Create new gallery
  router.post('/', auth.requiresAdmin, imageGalleriesApiCtrl.createGallery);

  // Edit gallery
  router.put('/:id', auth.requiresAdmin, imageGalleriesApiCtrl.editGalleryById);

  // Delete gallery
  router.delete('/:id', auth.requiresAdmin, imageGalleriesApiCtrl.deleteGalleryById);

  // Get gallery images by galleryId
  router.get('/:galleryId/images', imageGalleriesApiCtrl.getGalleryImagesByGalleryId);

  // Get gallery images by gallerySlug
  router.get('/:gallerySlug/images', imageGalleriesApiCtrl.getGalleryImagesByGallerySlug);

  // Add images to gallery
  router.post('/:galleryId/images', auth.requiresAdmin, imageGalleriesApiCtrl.addGalleryImages));

  // Delete images to gallery
  router.post('/:galleryId/images', auth.requiresAdmin, imageGalleriesApiCtrl.deleteGalleryImages));


  /**
   * Image
   */

  // Get galleries (/images?tags[]=clever&tags[]=awesome)
  router.get('/images', imageGalleriesApiCtrl.getImages);

  // Get gallery by id
  router.get('/images/:id', imageGalleriesApiCtrl.getImageById);

  // Edit gallery image
  router.put('/images/:id', auth.requiresAdmin, imageGalleriesApiCtrl.editGalleryImageById.bind(null, storage));

  // Delete gallery image
  router.delete('/images/:id', auth.requiresAdmin, imageGalleriesApiCtrl.deleteGalleryImageById.bind(null, storage));


  return new CleverCore.CleverRoute(router, 'api', false);

};
