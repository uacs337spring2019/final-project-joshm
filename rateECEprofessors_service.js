/*Name: Joshua Massee
Course: CSC 337
Date: 4/24/2019
Description:  Fetch uses parameters mode, first and last.  Mode distinguishes
between returning a JSON object carrying the list of teachers or a specific
teacher's profile data.  First and last direct access to the requested
teacher for their profile information.  Post formats the 8 pieces of data 
from the user's review form to a string and appends it to the .txt
file containing all of their reviews.
*/

const express = require("express");
const app = express();
const fs = require("fs");

app.use(express.static('public'));

app.get('/', function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	
	let mode = req.query.mode;
	let json = {};
	let reviews = [];

	//json object will simply be a list of the file names
	if (mode == "teacherList") {
		let files = fs.readdirSync("Professors");
		json["professors"] = files;
	}

	//json object will have a list of all teachers, each formed as an 
	//object with 8 pieces of information to form each review
	else if (mode == "teacher") {
		let file = fs.readFileSync("./Professors/" + req.query.last +", " + 
									req.query.first + "/reviews.txt", 'utf8');
		let reviewText = file.split("\n");
		for (let i = 0; i < reviewText.length; i++) {
			//will form an array of strings previously separated by :: in .txt file
			let data = reviewText[i].split("::");
			let object = {};
			object["date"] = data[0];
			object["quality"] = data[1];
			object["difficulty"] = data[2];
			object["class"] = data[3];
			object["textbook"] = data[4];
			object["takeAgain"] = data[5];
			object["gradeReceived"] = data[6];
			object["comment"] = data[7];
			reviews[i] = object;
		}
		
		json["reviews"] = reviews;
		//image url placed in json object's other element
		json["image"] = "./Professors/" + req.query.last + ", " + req.query.first + 
		                "/" + req.query.last + "," + req.query.first + ".jpg";

	}


	res.send(JSON.stringify(json));
	});

const  bodyParser= require('body-parser');
const jsonParser= bodyParser.json();

//prevent cors on the post request
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", 
		       "Origin, X-Requested-With, Content-Type, Accept");
	next();
});


app.post('/', jsonParser, function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	let name = req.body.name.split(" ");
	let first = name[0];
	let last = name[1];

	//directed to file based on pattern of filenames which is based on professor names
	let fileName = "./Professors/" + last + ", " + first + "/reviews.txt";
	//string formed by separating by semicolons
	let fileContent = "\n" + req.body.date + "::" + req.body.quality + "::" + req.body.difficulty +
		       "::" + req.body.class + "::" + req.body.textbook + "::" + req.body.takeAgain + 
		       "::" + req.body.gradeReceived + "::" + req.body.comment;

	fs.appendFile(fileName, fileContent, function(err) {
		if(err) {
			console.log(err);
			res.status(400);
		}
		res.status(200);

		let json = {};
		json["successStatus"] = "success";
		res.send(JSON.stringify(json));
	});

});

//app.listen(3000);
app.listen(process.env.PORT);