const express = require('express');
const bodyParser = require('body-parser');
const request = require("request");
const jsdom = require("jsdom");
const fs = require("fs");
const rbl = require("remove-blank-lines");
const open = require("open");
const pa11y = require('pa11y');
const html = require('pa11y-reporter-html');
const http = require('http');


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

app.post('/thankyou', urlencodedParser, async function (req, res) {
	res.render('thankyou');
	// const bodyRequest = req.body;

	// // TODO: iterate over multiple paths, and create HTML appending the name of the component and after this succesfull file written generate the pa11y.
	// const uri = 'http://' + bodyRequest.username + ":" + bodyRequest.password + `@${bodyRequest.hostname}:${bodyRequest.port}` + bodyRequest.path;

	var urls = [
		'http://admin:admin@localhost:4502/content/kwcms/kme/eu/en/service/accessories/accessories-for-your-kia/jcr:content/contents_1/euttn2a1.html',
		'http://admin:admin@localhost:4502/content/kwcms/kme-dealers/se-dealers/sv-dealer-master-single/homepage/jcr:content/par/eutdealermain.html',
		'http://admin:admin@localhost:4502/content/kwcms/kme/eu/en/new-cars/picanto/specifications/jcr:content/pip/eutpipspecifications.html',
		'http://admin:admin@localhost:4502/content/kwcms/kme-dealers/ie-dealers/en-dealer-master-group/homepage/jcr:content/par/eutdealermain_c7d2.html',
		'http://admin:admin@localhost:4502/content/kwcms/kme-dealers/sk-dealers/sk-dealer-master-group/homepage/jcr:content/par/eutdealermain.html',
		'http://admin:admin@localhost:4502/content/kwcms/kme-dealers/se-dealers/sv-dealer-master-single/homepage/jcr:content/par/eutdealermain.html',
		'http://admin:admin@localhost:4502/content/kwcms/kme/eu/en/new-cars/picanto/specifications/jcr:content/pip/eutpipspecifications.html',
	];

	Promise.all(urls.map((url) => getUrlResponse(url)))
		.then(function (results) {
			return results.map((result, index) => {
				try {
					if (result.statusCode !== 200) throw new Error(result.statusMessage);
					const dom = new JSDOM(result.body);
					const htmlOutput = rbl(dom.window.document.body.innerHTML);
					let newData = data.replace("{%Replace%}", htmlOutput);
					if (!fs.existsSync(dir)) {
						fs.mkdirSync(dir);
					}
					if (!newData) throw new Error('Data is undefined!');
					const filePath = `${dir}/output${index}.html`;
					fs.writeFileSync(filePath, newData);
					return filePath;
				}
				catch (e) {
					console.error('Something went wrong', e)
				}
			});
		})
		.then(function (result1) {
			getPa11yResult(result1);
		});

	async function getPa11yResult(files) {
		try {
			const pa11yOptions = {
				rules: ['Principle1.Guideline1_3.1_3_1_AAA'],
				standard: 'WCAG2AA',
				log: {
					debug: console.log,
					error: console.error,
					info: console.log
				}
			};

			const pa11yResult = await Promise.all(
				files.map(file => pa11y(file, pa11yOptions))
			);
			console.log('pa11yResult: ', pa11yResult);
			if (pa11yResult) {
				const htmlResults = await Promise.all(
					pa11yResult.map(result =>
						html.results(result)
					)
				);
				await fs.writeFileSync(`accessibility-report.html`,
					htmlResults.join(' '));
				open(`http://localhost:${port}/accessibility-report`);
			}

		}
		catch (e) {
			console.error('Something went wrong badly', e)
		}

	}

	function getUrlResponse(url) {
		return new Promise((resolve, reject) => {
			request(url, function (error, res) {
				if (error) reject(error);
				resolve(res);
			});
		})
	}
});

app.get('/accessibility-report', function (req, res) {
	res.sendFile(`${__dirname}/accessibility-report.html`);
	// res.download(`${__dirname}/accessibility-report.html`);
});

app.listen(port);
open(`http://localhost:${port}`);