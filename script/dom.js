var request = require("request");
var jsdom = require("jsdom");
const { JSDOM } = jsdom;

request(
  {
    uri: "https://www.kia.com/fr/"
  },
  function(error, response, body) {
    const dom = new JSDOM(body);
    console.log(dom.window.document.querySelector(".gnb").outerHTML);
  }
);
