const express = require('express');
const bodyParser = require('body-parser');
const request = require("request");
const jsdom = require("jsdom");
const fs = require("fs");
const rbl = require("remove-blank-lines");
const open = require("open");
const pa11y = require('pa11y');
const html = require('pa11y-reporter-html');


const port = process.env.PORT || 3001;

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
	const bodyRequest = req.body;
	const uri = 'http://' + bodyRequest.username + ":" + bodyRequest.password + `@${bodyRequest.hostname}:${bodyRequest.port}` + bodyRequest.path;
	console.log('URI: ', uri);

	request({ uri },
		async function (error, response, body) {
			try {
				if (error) throw new Error("Something went wrong!");
				if (response.statusCode !== 200) throw new Error(response.statusMessage);

				const dom = new JSDOM(body);
				const htmlOutput = rbl(dom.window.document.body.innerHTML);
				const newData = data.replace("{%Replace%}", htmlOutput);
				if (!fs.existsSync(dir)) {
					fs.mkdirSync(dir);
				}
				if (!newData) throw new Error('Data is undefined!');
				const filePath = `${dir}/output.html`;
				fs.writeFileSync(filePath, newData);
				const result = await pa11y(filePath, {
					rules: ['Principle1.Guideline1_3.1_3_1_AAA'],
					standard: 'WCAG2AA',
					log: {
						debug: console.log,
						error: console.error,
						info: console.log
					}
				});
				// Returns a string with the results formatted as HTML
				const htmlResults = await html.results(result);
				fs.writeFileSync('accessibility-report.html', htmlResults);
				open(`http://localhost:${port}/accessibility-report`);
				console.log("Successfully Written to File.");
			}
			catch (e) {
				console.error('Something went wrong', e)
			}
		}
	);
});

app.get('/accessibility-report', function (req, res) {
	res.sendFile(`${__dirname}/accessibility-report.html`);
});

app.listen(port);
open(`http://localhost:${port}`);