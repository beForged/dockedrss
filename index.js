require('dotenv').config()
const got = require("got");
const parser = require("fast-xml-parser");

var options = {
    ignoreAttributes : false,
    ignoreNameSpace : true
}

var time 
const ONE_MINUTE = 1000 * 60
const postLink

function main(){
  time = Date.now()
  setInterval(mainLoop, ONE_MINUTE)
}

function mainLoop(){
    var posts = updateLoop();
    //goes backwards for time keeping reasons
    for(p in posts.reverse()){
      postNewEntry(p, process.env.WEBHOOK_LINK)
      time = Date.parse(p.entry.published)
    }
}

function updateLoop(){
  var entries = getEntries();
  var posts = []
  for (entry in entries) {
    if(Date.parse(entry.published) > time){
      console.log(buildWebhookPost(entry))
      posts.push(buildWebhookPost(entry))
    }
  }
  return posts
}

async function getEntries() {
  const buffer = await got(process.env.FETCH_LINK, {
    responseType: "buffer",
    resolveBodyOnly: true,
    timeout: 5000,
    retry: 5,
  });
  var feed = parser.parse(buffer.toString(), options);
  //for (const item of feed.feed.entry) {
    //console.log({ title: item.title, url: item.link, thumb: item.thumbnail });
  //}
  return feed.feed.entry
};

function buildWebhookPost(entry){
  var ret = {}
  var embeds = {}
  embeds.title = entry.title
  embeds.url = entry.link
  embeds.image = {
    url: entry.item.thumbnail
  }
  embeds.author = {
    name: entry.author.name,
    url: entry.author.uri
  }
  ret.embeds = embeds
  return JSON.stringify(ret)
}

function postNewEntry(content, postLink){
  var request = new XMLHttpRequest();
  request.open('POST', postLink, true);
  request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  request.send(content);
}
