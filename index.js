const got = require("got");
const parser = require("fast-xml-parser");

var options = {
    ignoreAttributes : false,
    ignoreNameSpace : true
}

function main(){
    var entries = getEntries();
    for(entry in entries){
      console.log(buildWebhookPost(entry))
    }
}

async function getEntries() {
  const buffer = await got("https://reddit.com/r/animereactionimages/new.rss", {
    responseType: "buffer",
    resolveBodyOnly: true,
    timeout: 5000,
    retry: 5,
  });
  var feed = parser.parse(buffer.toString(), options);
  for (const item of feed.feed.entry) {
    //console.log({ title: item.title, url: item.link, thumb: item.thumbnail });
  }
  return feed.feed.entry
};

function findNew(entries){
  for(const item of entries){
    //docker images here to cache last x entries so we can only send new stuff/
    //dont forget to handle deleted stuff
  }
}

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

function postNewEntry(title, postLink, imageUrl){
  var request = new XMLHttpRequest();
  request.open('POST', postLink, true);
  request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  request.send(title);
}
