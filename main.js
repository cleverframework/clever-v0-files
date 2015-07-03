'use strict';

let cleverCore = require('clever-core');
let Package = cleverCore.Package;

// Defining the Package
var FilesPackage = new Package('users-ssh');

// All CLEVER packages require registration
FilesPackage.register(function(app, auth, database, storage) {

  FilesPackage.routes(app, auth, database, storage);

  return FilesPackage;

});
