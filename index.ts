import got from "got";
import parser from "fast-xml-parser";

var options = {
    ignoreAttributes : false,
    ignoreNameSpace : true
}

function main(){
    var entries = getEntries();

}

async function getEntries() {
  const buffer = await got("https://reddit.com/r/animereactionimages.rss", {
    responseType: "buffer",
    resolveBodyOnly: true,
    timeout: 5000,
    retry: 5,
  });
  var feed = parser.parse(buffer.toString(), options);
  for (const item of feed.feed.entry) {
    console.log({ title: item.title, url: item.link, thumb: item.thumbnail });
  }
  return feed.feed.entry
};

function findNew(entries){
  for(const item of entries){
    //docker images here to cache last x entries so we can only send new stuff/
    //dont forget to handle deleted stuff
  }
}

function postNewEntry(title, postLink, imageUrl){
  var request = new XMLHttpRequest();
  request.open('POST', postLink, true);
  request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  request.send(title);
}
