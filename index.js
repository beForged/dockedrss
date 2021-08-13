require('dotenv').config()
const got = require("got");
const parser = require("fast-xml-parser");
const express = require("express")
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;


var options = {
    ignoreAttributes : false,
    attributeNamePrefix : "_",
    ignoreNameSpace : true
}

const PORT = process.env.PORT || 3000;
const app = express()
app.listen(PORT, () => {
    console.log(`app is running on port ${ PORT }`);
});

var time 
const ONE_MINUTE = 1000 * 60

//run the thing
main()

function main(){
  console.log("running main")
  time = Date.now()
  //inital
  //getAllEntries()
  setInterval(getAllEntries, ONE_MINUTE)
}

async function getAllEntries() {
  console.log("fetching rss feed")
  try {
    const buffer = await got(process.env.FETCH_LINK, {
      responseType: "buffer",
      resolveBodyOnly: true,
      timeout: 5000,
      retry: 5,
    });
    console.log("response recieved")

    var feed = parser.parse(buffer.toString(), options);
    console.log("parsed feed")
  } catch (error) {
    console.log(error)
  }

  for (const item of feed.feed.entry) {
    //console.log({ title: item.title, url: item.link, thumb: item.thumbnail , pub: item.published});
    //console.log({name: item.author.name})
  }

  var posts = []
  for (const entry of feed.feed.entry) {
    if (Date.parse(entry.published) > (time)) { 
      //console.log({title: entry.title})
      //console.log(buildWebhookPost({entry}))
      posts.push({entry})
    }
  }

  //goes backwards for time keeping reasons
  for (p in posts.reverse()) {
    var ret = buildWebhookPost(posts[p])
    postNewEntry(ret, process.env.WEBHOOK_LINK)
    //console.log("updated time: " + posts[p].entry.published)
    time = Date.parse(posts[p].entry.published)
  }
};

function buildWebhookPost(entry) {
  var ret = {}
  var embeds = {}
  embeds.title = entry.entry.title
  embeds.url = entry.entry.link._href
  const url = entry.entry.thumbnail._url
  embeds.image = {
    url: url.replace(/amp;/g, '')
  }
  embeds.author = {
    name: entry.entry.author.name,
    url: entry.entry.author.uri
  }
  ret.embeds = []
  ret.embeds.push(embeds)
  //console.log(JSON.stringify(ret))
  return JSON.stringify(ret)
}

function postNewEntry(content, postLink) {
  var request = new XMLHttpRequest();
  request.open('POST', postLink, true);
  request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  request.send(content);
}
