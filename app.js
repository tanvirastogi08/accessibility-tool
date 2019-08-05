const express = require('express');
const npm = require('npm');
const bodyParser = require('body-parser');
const request = require("request");
const jsdom = require("jsdom");
const fs = require("fs");
const rbl = require("remove-blank-lines");
const open = require("open");
const pa11y = require('pa11y');
const puppeteer = require('puppeteer');

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
	let url = req.body.url.split("//")[1].split("4502");
	url = "http://" + req.body.username + ":" + req.body.password + "@localhost:4502" + url[1];
	request(
		{
			uri: url
		},
		function (error, response, body) {
			const dom = new JSDOM(body);
			const htmlOutput = rbl(dom.window.document.body.innerHTML);
			data = data.replace("{%Replace%}", htmlOutput);
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir);
			}
			fs.writeFile(`${dir}/output.html`, data, err => {
				if (err) console.log(err);
				npm.load({}, function (er) {
					if (er) { return; }
					// npm.commands.run(['postbuild']);
					runExample();
				});
				console.log("Successfully Written to File.");
			});

			if (error) throw new Error("Something went wrong!");
			else {
				return 0;
			}
		}
	);
});

app.listen(port);
open('http://localhost:' + port);

// Async function required for us to use await
async function runExample() {
	let browser;
	let pages;
	try {

		// Launch our own browser
		browser = await puppeteer.launch();

		// Create a page for the test runs
		// (Pages cannot be used in multiple runs)
		pages = [
			await browser.newPage(),
		];

		// Test http://example.com/ with our shared browser
		const result1 = await pa11y('./temp/output', {
			browser: browser,
			page: pages[0]
		});

		// Output the raw result objects
		console.log('result1', result1);

		// Close the browser instance and pages now we're done with it
		for (const page of pages) {
			await page.close();
		}
		await browser.close();

	} catch (error) {

		// Output an error if it occurred
		console.error(error.message);

		// Close the browser instance and pages if theys exist
		if (pages) {
			for (const page of pages) {
				await page.close();
			}
		}
		if (browser) {
			await browser.close();
		}

	}
}