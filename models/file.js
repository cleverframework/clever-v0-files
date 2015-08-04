'use strict';

// Module dependencies
const cleverCore = require('clever-core');
const config = cleverCore.loadConfig();
const storage = cleverCore.loadStorage();
const mongoose = require('mongoose');
const Schema  = mongoose.Schema;
const _ = require('lodash');
const Q = require('q');
const async = require('async');
const moment = require('moment');

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
    default: 'Untitled',
    get: escapeProperty
  },
  description: {
    type: String,
    default: '',
    get: escapeProperty
  },
  key: {
    type: String,
    required: true
  },
  private: {
    type: Boolean,
    required: true,
    default: true
  },
  mimetype: {
    type: String,
    required: true
  },
  encoding: {
    type: String
  },
  size: {
    type: Number,
    required: true,
    default: 0
  },
  metadata: {
    type: Object,
    default: {}
  },
  created: {
    type: Date,
    default: Date.now
  },
  modified: {
    type: Date,
    default: null
  }
});

// Virtuals
FileSchema.virtual('url').set(function(url) {
  throw new Error('File::url cannot be set.');
}).get(function() {
  return `${storage.webServerUrl}/${storage.volumeName}/${this.key}`;
});

FileSchema.virtual('created_ago').set(function(url) {
  throw new Error('Page::created_ago cannot be set.');
}).get(function() {
  if(this.created === null) return null;
  return moment(this.created).fromNow();
});

FileSchema.virtual('modified_ago').set(function(url) {
  throw new Error('Page::modified_ago cannot be set.');
}).get(function() {
    if(!this.modified || this.modified === null) return null;
  return moment(this.modified).fromNow();
});

FileSchema.virtual('created_format').set(function(url) {
  throw new Error('Page::created_format cannot be set.');
}).get(function() {
  if(this.created === null) return null;
  return moment(this.created).format('MM/DD/YYYY hh:mm:ss');
});

FileSchema.virtual('modified_format').set(function(url) {
  throw new Error('Page::modified_format cannot be set.');
}).get(function() {
  if(!this.modified || this.modified === null) return null;
  return moment(this.modified).format('MM/DD/YYYY hh:mm:ss');
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
    const options = skip && limit ? {skip: skip, limit: limit} : {skip: 0, limit: 10};
    const defer = Q.defer();
    File.find({}, {}, options, function(err, files) {
      if (err) return defer.reject(err);
      return defer.resolve(files);
    }).sort({ _id: -1 });
    return defer.promise;
  },

  /**
   * GetImageList - return the list of images (png | jpg | jpeg | gif)
   *
   * @return {Object}
   * @api public
   */
  getImageList: function() {
    const File = mongoose.model('File');
    const defer = Q.defer();
    File.find({ mimetype : { $in : [ 'image/jpg', 'image/jpeg', 'image/png', 'image/gif' ] }}, {}, {}, function(err, images) {
      if (err) return defer.reject(err);
      async.map(images, function(image, cb) {
        const listElement = {};
        listElement._id = image._id;
        listElement.title = image.title;
        listElement.url = image.url;
        cb(null, listElement);
      }, function(errors, imageList) {
        if(errors) return defer.reject(errors);
        defer.resolve(imageList);
      });

    }).sort({ title: -1 });
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
   * editFilesMetadata
   *
   * @param {Array} files
   * @return {Object}
   * @api public
   */
  editFilesMetadata: function(files, metadataName) {
    if(!files) throw new Error('File.editFilesMetadata: files parameter is mandatory');
    if(!files) throw new Error('File.editFilesMetadata: metadataName parameter is mandatory');
    const File = mongoose.model('File');
    const defer = Q.defer();

    const filesPerId = {};

    const fileKeys = Object.keys(files);

    for(let i in fileKeys) {
      if(!files[fileKeys[i]]._id) {
        defer.reject(new Error(`File.editFilesMetadata: files[${fileKeys[i]}]._id data is missing _id value`));
        return defer.promise;
      }

      const id = files[fileKeys[i]]._id;
      delete files[fileKeys[i]]._id;

      if(!filesPerId[id]) filesPerId[id] = {};
      filesPerId[id][fileKeys[i]] = files[fileKeys[i]];
    }

    function getAndSave(fileId, cb) {

      function save(file) {
        if(!file.metadata) file.metadata = {};
        file.metadata[metadataName] = filesPerId[fileId];

        file.save(function(err) {
          const errors = hasErrors(err);
          if(errors) return cb(errors);
          cb(null, file);
        });
      }

      File.getFileById(fileId)
        .then(save)
        .catch(cb);
    }

    async.map(Object.keys(filesPerId), getAndSave, function(err, results) {
      if(err) return defer.reject(err);
      defer.resolve(results);
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

      // Reset
      file.private = false;

      file.modified = Date.now();

      Object.keys(fileParams).forEach(function (key, index) {
        if(key==='private' && fileParams[key] === '1') return file.private = true;
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

    File.getFileById(id)
      .then(function(file) {
        storage.deleteFile(file.key)
          .then(function() {
            File.remove({_id: file._id}, function(err, result) {
              if (err) return defer.reject(err);
              return defer.resolve(result);
            });
          })
          .catch(defer.reject);
      })
      .catch(defer.reject);

    return defer.promise;
  },

  createFile: function(fileParams, fileData) {
    const File = mongoose.model('File');
    const defer = Q.defer();

    storage.createFile(fileParams.key, fileData)
      .then(function() {
        const file = new File(fileParams);
        file.save(function(err) {
          const errors = hasErrors(err);
          if(errors) return defer.reject(errors);
          defer.resolve(file);
        });
      })
      .catch(defer.reject)

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
    // const FileImage = mongoose.model('FileImage');
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
    const obj = this.toObject();
    obj.url = this.url;
    return obj;
  }
};

mongoose.model('File', FileSchema);
