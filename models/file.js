'use strict';

// Module dependencies.
const cleverCore = require('clever-core');
const config = cleverCore.loadConfig();
const storage = cleverCore.loadStorage();
const mongoose = require('mongoose');
const Schema  = mongoose.Schema;
const _ = require('lodash');
const Q = require('q');
const async = require('async');

// Mongoose Error Handling
function hasErrors(err) {
  if (err) {
    console.log(err);
    let modelErrors = [];
    switch (err.code) {
      case 11000: {}
      default: {
        if (err.errors) {
          for (var x in err.errors) {
            modelErrors.push({
              param: x,
              msg: err.errors[x].message,
              value: err.errors[x].value
            });
          }
        }
      }
    }
    return modelErrors;
  }

  return null;
}

// Getter
function escapeProperty(value) {
  return _.escape(value);
};

// Schema
const FileSchema = new Schema({
  title: {
    type: String,
    required: true,
    default: 'Untitled'
    get: escapeProperty
  },
  description: {
    type: String,
    required: true,
    default: '',
    get: escapeProperty
  },
  bucket: {
    type: String,
    required: true
  },
  key: {
    type: String,
    required: true
  },
  private: {
    type: Boolean,
    required: true,
    default: false
  }
});

// Virtuals
UserSchema.virtual('url').set(function(url) {
  throw new Error('File::url cannot be set.');
}).get(function() {
  return `${storage.webServerUrl}/${this.bucket}/${this.key}`;
});

// Static Methods
FileSchema.statics = {
  /**
   * CountFiles - return the number of files
   *
   * @return {Object}
   * @api public
   */
  countFiles: function() {
    const File = mongoose.model('File');
    const defer = Q.defer();
    File.count({}, function(err, nFiles) {
      if (err) return defer.reject(err);
      return defer.resolve(nFiles);
    });
    return defer.promise;
  },

  /**
   * GetFiles - return the list of files
   *
   * @param {Integer} skip
   * @param {Integer} limit
   * @return {Object}
   * @api public
   */
  getFiles: function(skip, limit) {
    const File = mongoose.model('File');
    const options = skip && limit ? {skip: skip, limit: limit} : {};
    const defer = Q.defer();
    File.find({}, {}, options, function(err, files) {
      if (err) return defer.reject(err);
      return defer.resolve(files);
    });
    return defer.promise;
  },

  /**
   * GetFileById - return the file matching the id
   *
   * @param {String} id
   * @return {Object}
   * @api public
   */
  getFileById: function(id) {
    if(!id) throw new Error('File.getFileById: id parameter is mandatory');
    const File = mongoose.model('File');
    const defer = Q.defer();
    File.findOne({_id: id}, function(err, file) {
      if (err) return defer.reject(err);
      return defer.resolve(file);
    });
    return defer.promise;
  },

  /**
   * EditFileById - edit the file matching the id
   *
   * @param {String} id
   * @return {Object}
   * @api public
   */
  editFileById: function(id, fileParams) {

    if(!id) throw new Error('File.editFileById: id parameter is mandatory');
    const File = mongoose.model('File');
    const defer = Q.defer();

    function save(file) {

      Object.keys(fileParams).forEach(function (key, index) {
        if(key==='_images') return; // handle this in a dedicated function
        file[key] = fileParams[key];
      });

      file.save(function(err) {
        const errors = hasErrors(err);
        if(errors) return defer.reject(errors);
        defer.resolve(file);
      });
    }

    File.getFileById(id)
      .then(save)
      .catch(defer.reject);

    return defer.promise;
  },

  /**
   * DeleteFileById - delete the file matching the id
   *
   * @param {String} id
   * @return {Object}
   * @api public
   */
  deleteFileById: function(id) {
    if(!id) throw new Error('File.deleteFileById: id parameter is mandatory');
    const File = mongoose.model('File');
    const defer = Q.defer();
    File.remove({_id: id}, function(err, result) {
      if (err) return defer.reject(err);
      return defer.resolve(result);
    });
    return defer.promise;
  },

  createFile: function(fileParams) {
    const File = mongoose.model('File');
    const file = new File(fileParams);

    const defer = Q.defer();
    file.save(function(err) {
      const errors = hasErrors(err);
      if(errors) return defer.reject(errors);
      defer.resolve(file);
    });

    return defer.promise;
  }
}

// Instance Methods
FileSchema.methods = {

  /**
   * GetData - get file data
   *
   * @return {Buffer}
   * @api public
   */
  getData: function() {
    const FileImage = mongoose.model('FileImage');
    const defer = Q.defer();

    // TODO: implementation

    return defer.promise;
  },

  /**
   * Hide security sensitive fields
   *
   * @returns {*|Array|Binary|Object}
   */
  toJSON: function() {
    return this.toObject();;
  }
};

mongoose.model('File', FileSchema);
