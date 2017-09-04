require('dotenv').config()

const Europa = require('node-europa');
const moment = require('moment');
const cheerio = require('cheerio');
const { download, dirSetting } = require('./FileDAO');
const fs = require('fs');

const mediumFilesFolder = process.env.MEDIUM_EXPORTED_FOLDER;
const changedDir = process.env.MD_FOLDER

const getHeader = function (title, dateString) {
  const setperateLine = '---\n';
  let header = setperateLine;
  header = header + 'title: ' + title + "\n";
  header = header + 'date: ' + dateString + "\n";
  header = header + 'tags: github, github-trend, tech-trend \n';
  header = header + setperateLine;
  return header;
}

function file_controller(path, changedDir, fileName) {
  const data = fs.readFileSync(__dirname + "/" + path + "/" + fileName, 'utf8');
  const europa = new Europa();
  const $ = cheerio.load(data);

  //title
  let titleString = $('h1').text();
  titleFileName = titleString;
  titleFileName = titleFileName.replace("/", "-");
  titleString = '\"' + titleString + '\"';
  
  //image FileName chages 
  const files = $('img').map((i, e) => {
    url = $(e).attr("src");
    const filename = url.substring(url.lastIndexOf("/"));
    $(e).attr("src", "/images" + filename);
    return url;
  }).get();

  let mdData = europa.convert($.html());
  let position = [];
  let findStr = '\n';
  let pos = mdData.indexOf(findStr, 5);
  mdData = mdData.substring(pos, mdData.length - 1)
  const editTimeString = moment($('time').attr('datetime')).format('YYYY-MM-DD HH:mm:ss');
  const header = getHeader(titleString, editTimeString);
  const mdFinal = header + mdData;
  const newFileName = '[' + editTimeString + ']' + titleFileName + '.md';

  //write
  fs.writeFileSync(__dirname + "/" + changedDir + "/" + newFileName, mdFinal);
  console.log("title:", titleString);
  console.log("date:", editTimeString);
  return files;
}


const downloadImagefiles = function (images) {
  console.log("download start");
  const errorFiles=[];
  for (let i = 0; i < images.length; i++) {
    let image = images[i];
    let filename = changedDir + "/images/" + image.substring(image.lastIndexOf("/") + 1);
    console.log(i,images.length);
    download(image, filename, function (err, uri, filename) {
      if (err) {
        console.log("error",uri);
      }
    })
  }
}

const convert = function (mediumFilesFolder, changedDir) {
  let images = [];
  fs.readdir(mediumFilesFolder, (err, files) => {
    let len = files.length, i = 0;
    if (dirSetting(mediumFilesFolder, changedDir)) {
      files.forEach(file => {
        if (file.lastIndexOf(".html") > 0) {
          let extractedImgUrls = file_controller(mediumFilesFolder, changedDir, file);
          images = images.concat(extractedImgUrls);
          i++;
        } else {
          i++;
        }
        if (i == len) {
          downloadImagefiles(images);
        }
      });
    }

  })
}

convert(mediumFilesFolder, changedDir);