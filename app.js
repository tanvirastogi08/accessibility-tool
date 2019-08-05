const express = require('express');
const bodyParser = require('body-parser');
const request = require("request");
const jsdom = require("jsdom");
const fs = require("fs");
const rbl = require("remove-blank-lines");
const open = require("open");
const pa11y = require('pa11y');
const html = require('pa11y-reporter-html');


const port = process.env.PORT || 3000;

const app = express();

const dir = "./temp";

const { JSDOM } = jsdom;

// creating a dummy html base structure
let data = fs.readFileSync("./index.html", "utf-8");

const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.set('view engine', 'ejs');

app.use('/assets', express.static(__dirname + '/public'));
app.use('/', function (req, res, next) {
	next();
});

app.get('/', function (req, res) {
	res.render('home');
});

app.post('/thankyou', urlencodedParser, function (req, res) {
	res.render('thankyou');
	let uri = req.body.url.split("//")[1].split("4502");
	uri = "http://" + req.body.username + ":" + req.body.password + "@localhost:4502" + uri[1];
	console.log('URI: ', uri);
	// TODO: change the way we write this request
	request(
		{
			uri
		},
		async function (error, response, body) {
			try {
				if (error) throw new Error("Something went wrong!");
				if (response.statusCode !== 200) throw new Error(response.statusMessage);
				const dom = new JSDOM(body);
				const htmlOutput = rbl(dom.window.document.body.innerHTML);
				data = data.replace("{%Replace%}", htmlOutput);
				if (!fs.existsSync(dir)) {
					fs.mkdirSync(dir);
				}
				if (!data) throw new Error('Data is undefined!');
				const filePath = `${dir}/output.html`;
				fs.writeFileSync(filePath, data);
				const result = await pa11y(filePath);
				// Returns a string with the results formatted as HTML
				const htmlResults = await html.results(result);
				fs.writeFileSync('accessibility-report.html', htmlResults);
				console.log("Successfully Written to File.");
			}
			catch (e) {
				console.error('Something went wrong', e)
			}
		}
	);
});

app.listen(port);
open(`http://localhost:${port}`);