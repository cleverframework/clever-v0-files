'use strict';

// Module dependencies.
const config = require('clever-core').loadConfig();
const mongoose = require('mongoose');
const File = mongoose.model('File');
const async = require('async');
const util = require('../util');

exports.showFiles = function(FilePackage, req, res, next) {
  let page = Number.parseInt(req.query.page);
  page = Number.isNaN(page) ? 0 : page;
  const skip = page * 10;

  function renderFileList(files, nFiles) {

    res.send(FilePackage.render('admin/list', {
      packages: FilePackage.getCleverCore().getInstance().exportablePkgList,
      user: req.user,
      files: files,
      nFiles: nFiles,
      activePage: page,
      csrfToken: req.csrfToken()
    }));
  }

  async.parallel([
    function getFiles(cb){
      File.getFiles(skip, 10)
        .then(function(files) {
          cb(null, files);
        })
        .catch(util.passNext.bind(null, cb));
    },
    function countFiles(cb){
      File.countFiles()
        .then(function(nFiles) {
          cb(null, nFiles);
        })
        .catch(util.passNext.bind(null, cb));
    }
  ], function(err, options){
      if(err) return util.passNext.bind(null, next);
      renderFileList.apply(null, options);
  });

};

exports.showFileById = function(FilePackage, req, res, next) {
  function render(fileToShow) {
    res.send(FilePackage.render('admin/files/details', {
      packages: FilePackage.getCleverCore().getInstance().exportablePkgList,
      user: req.user,
      fileToShow: fileToShow,
      csrfToken: req.csrfToken()
    }));
  }

  File.getFileById(req.params.id)
    .then(render)
    .catch(util.passNext.bind(null, next));
};

exports.createFile = function(FilePackage, req, res, next) {
  res.send(FilePackage.render('admin/files/create', {
    packages: FilePackage.getCleverCore().getInstance().exportablePkgList,
    user: req.user,
    csrfToken: req.csrfToken()
  }));
};

exports.editFileById = function(FilePackage, req, res, next) {
  function render(fileToEdit) {
    res.send(FilePackage.render(`admin/files/edit`, {
      packages: FilePackage.getCleverCore().getInstance().exportablePkgList,
      user: req.user,
      fileToEdit: fileToEdit,
      csrfToken: req.csrfToken()
    }));
  }

  File.getFileById(req.params.id)
    .then(render)
    .catch(util.passNext.bind(null, next));
};
