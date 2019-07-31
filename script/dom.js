var request = require("request");
var jsdom = require("jsdom");
var fs = require("fs");
var rbl = require("remove-blank-lines");
var dir = "./output";

const { JSDOM } = jsdom;

// creating a dummy html base structure
var data = fs.readFileSync("./index.html", "utf-8");

// saving credentials of the localhost for temp purpose
const username = "admin";
const password = "admin";
let url = process.argv[2].split("//")[1].split("4502");

url = "http://" + username + ":" + password + "@localhost:4502" + url[1];

request(
  {
    uri: url
  },
  function(error, response, body) {
    const dom = new JSDOM(body);
    var htmlOutput = rbl(dom.window.document.body.innerHTML);
    data = data.replace("{{{Replace}}}", htmlOutput);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    fs.writeFile(`${dir}/output`, data, err => {
      if (err) console.log(err);
      console.log("Successfully Written to File.");
    });

    if (error) throw new Error("Something went wrong!");
  }
);
