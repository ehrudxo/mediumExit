const fs = require('fs')
const request = require('request')
const path = require("path");

/*
 * https://gist.github.com/tkihira/2367067
 * 
 */
const rmdir = function (dir) {
  var list = fs.readdirSync(dir);
  console.log(list);
  for (var i = 0; i < list.length; i++) {
    var filename = path.join(dir, list[i]);
    var stat = fs.statSync(filename);

    if (filename == "." || filename == "..") {
    } else if (stat.isDirectory()) {
      rmdir(filename);
    } else {
      fs.unlinkSync(filename);
    }
  }
  fs.rmdirSync(dir);
};

/*
 * https://stackoverflow.com/questions/12740659/downloading-images-with-node-js 
 */
const download = function (uri, filename, callback) {
  request.head(uri, function (err, res, body) {
    if (err) {
      callback(err, uri, filename);
    }
    else request({uri:uri,timeout:10000})
      .on('error', function(err){
        callback(err,uri,filename);
      })
      .on('close', callback)
      .pipe(fs.createWriteStream(filename));
  });
};

const dirSetting = function (mediumHTMLDir, changedDir) {
  const mdDir = __dirname + "/" + changedDir;
  console.log(mdDir);
  if (!fs.existsSync(__dirname + "/" + mediumHTMLDir)) {
    console.log("medium exported HTMLs directory does not exists!");
    return false;
  }
  if (fs.existsSync(mdDir)) {
    try {
      rmdir(mdDir);
      fs.mkdirSync(mdDir);
      fs.mkdirSync(mdDir + "/images");
      console.log(mdDir, " directory made");
      return true;
    } catch (err) {
      console.log("error occurred when delete and make : ", mdDir, err);
      return false;
    }
  } else {
    fs.mkdirSync(mdDir);
    fs.mkdirSync(mdDir + "/images/");
    console.log(mdDir, " directory made");
    return true;
  }
  return false;
}

module.exports = { download, dirSetting }
