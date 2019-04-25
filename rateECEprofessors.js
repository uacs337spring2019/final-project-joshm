/*Name: Joshua Massee
Course: CSC 337
Date: 4/24/2019
Description:  Makes 2 fetch requests to retrieve information necessary for web page
construction (list of teachers and teacher profiles.  Allows users to make post
 requests to add reviews to teacher profiles.  Hides and displays page 
 elements for better user interactivty. Forms lists of unique classes taught
 by a teacher and allows users to narrow the body of total reviews to one choice,
 switch that choice, and return to the overall list of reviews.
*/
 (function() {
	"use strict";

	window.onload = function() {
		//teacher list forms immediately at page load
		getTeacherList();
		//button event handlers
		document.getElementById("submitTeacher").onclick = fetchTeacher;
		document.getElementById("newRating").onclick = newRating;
		document.getElementById("submitRating").onclick = submitRating;
		document.getElementById("selectClass").onclick = narrowReviews;
	};

	function getTeacherList() {
		//let url = "http://localhost:3000?mode=teacherList";
		let url = "http://jmrateprofessors4.herokuapp.com?mode=teacherList";
			fetch(url)
			.then(checkStatus)
			.then(function(responseText) {
				let json = JSON.parse(responseText);
				//loops creating an option in select for every teacher based on their names in json
				for (let i = 0; i < json["professors"].length; i++) {
					let teacher = document.createElement("option");
					let names = json["professors"][i].split(", ");
					let last = names[0];
					let first = names[1];
					teacher.innerHTML = first + " " + last;
					document.getElementById("selectTeacher").appendChild(teacher);
				}
			})

			
			.catch(function(error) {
				alert("error");
			});

		

	}

	function fetchTeacher() {
		//make sure default option not selected
		if (document.getElementById("selectTeacher").value == "Pick a Teacher") {
			document.getElementById("chooseRight").style.display = "block";

		}
		else {
			document.getElementById("chooseRight").style.display = "none";
			document.getElementById("teacher").style.display = "block";
			document.getElementById("reviewForm").style.display = "none";
			
			let name = document.getElementById("selectTeacher").value;
			document.getElementById("name").innerHTML = name;

			//remove the reviews from a potentially previously selected professor
			let reviews = document.querySelectorAll("#reviews .review");
			for (let i = 0; i < reviews.length; i++) {
				document.getElementById("reviews").removeChild(reviews[i]);
			}

			//clear classList from a potentially previously selected professor
			let classNames = document.querySelectorAll("#classes option");
			for (let i = 1; i < classNames.length; i++) {
				document.getElementById("classes").removeChild(classNames[i]);
			}

			//producing paramaters of url from selected teacher's name
			let names = name.split(" ");
			let first = names[0];
			let last = names[1];

			//let url = "http://localhost:3000?mode=teacher&first=" + 
			//first + "&last=" + last;
			var url = "http://jmrateprofessors4.herokuapp.com?
			mode=teacher&first=" + first + "&last=" + last;
			fetch(url)
			.then(checkStatus)
			.then(function(responseText) {
				let json = JSON.parse(responseText);

				document.getElementById("portrait").src = json["image"];

				let classList = [];
				classList[0] = json["reviews"][0].class;
				let qualitySum = 0;
				let difficultySum = 0;
				let ySum = 0;
				let nSum = 0;

				//supply every review with new integer component to help sort by date
				for (let i = 0; i < json["reviews"].length; i++) {
					let dateSource = json["reviews"][i].date.split("/");
					let yearComp = "" + dateSource[2] + dateSource[0] + dateSource[1];
					json["reviews"][i]["yearComp"] = parseInt(yearComp);
				}

				//sort json data by date descending using the previously crafted integer
				let k;
				for (let i = 1; i < json["reviews"].length; i++) {
					k = i;
					while ((k > 0) && (json["reviews"][k]["yearComp"] >
										json["reviews"][k - 1]["yearComp"]))  {
						let temp = json["reviews"][k];
						json["reviews"][k] = json["reviews"][k - 1];
						json["reviews"][k - 1] = temp;
						--k;
					}

				}


				//main loop for constructing the review elements and supplying 
				//them with the data from the json object
				for (let i = 0; i < json["reviews"].length; i++) {
					
					//finds the unique classes the teacher has been reviewed for
					let match = false;
					for (let j = 0; j < classList.length; j++) {
						if (json["reviews"][i].class == classList[j]) {
							match = true;
							break;
						}
					}
					//no match found means class will add to list
					if (match == false) {
						classList.push(json["reviews"][i].class);
					}


					//construct the review element of page and insert values from 
					//json object appropriately
					let p;
					let review = document.createElement("div");
					review.className = "review";

					let left = document.createElement("div");
					left.className = "left";
					p = document.createElement("p");
					p.innerHTML = "Date: " + json["reviews"][i].date;
					left.appendChild(p);
					p = document.createElement("p");
					p.innerHTML = "Overall Quality: " + json["reviews"][i].quality;
					left.appendChild(p);
					p = document.createElement("p");
					p.innerHTML = "Overall Difficulty: " + json["reviews"][i].difficulty;
					left.appendChild(p);
					review.appendChild(left);

					let middle = document.createElement("div");
					middle.className = "middle";
					p = document.createElement("p");
					p.innerHTML = "Class: " + json["reviews"][i].class;
					middle.appendChild(p);
					p = document.createElement("p");
					p.innerHTML = "Would Take Again: " + json["reviews"][i].takeAgain;
					middle.appendChild(p);
					p = document.createElement("p");
					p.innerHTML = "Textbook Required: " + json["reviews"][i].textbook;
					middle.appendChild(p);
					p = document.createElement("p");
					p.innerHTML = "Grade Received: " + json["reviews"][i].gradeReceived;
					middle.appendChild(p);
					review.appendChild(middle);


					let right = document.createElement("div");
					right.className = "right";
					p = document.createElement("p");
					p.innerHTML = "Comment: " + json["reviews"][i].comment;
					right.appendChild(p);
					review.appendChild(right);

					document.getElementById("reviews").appendChild(review);

					//quantities tracked (summed) as we move through json objects
					// for later overview averages
					qualitySum += parseInt(json["reviews"][i].quality);
					difficultySum += parseInt(json["reviews"][i].difficulty);
					if (json["reviews"][i].takeAgain == "Yes") {
						ySum += 1;
					}
					else if (json["reviews"][i].takeAgain == "No") {
						nSum += 1;
					}
				}

				//sort classlist numerically before adding them to page
				for (let i = 1; i < classList.length; i++) {
					k = i;
					while ((k > 0) && (classList[k] < classList[k - 1]))  {
						let temp = classList[k];
						classList[k] = classList[k - 1];
						classList[k - 1] = temp;
						--k;
					}

				}

				//this option bizarrely would not work if placed directly in HTML
				let allClasses = document.createElement("option");
				allClasses.innerHTML = "All Classes";
				document.getElementById("classes").appendChild(allClasses);

				//adds unique classes to drop down menu
				for (let i = 0; i < classList.length; i++) {
					let classN = document.createElement("option");
					classN.innerHTML = classList[i];
					document.getElementById("classes").appendChild(classN);
				}

				let quality = qualitySum / json["reviews"].length;
				let difficulty = difficultySum / json["reviews"].length;
				
				//if no reviews indicate would take again, insert N/A
				if ((ySum == 0) && (nSum == 0)) {
					document.getElementById("againPercent").innerHTML = "N/A";
				}
				//reviews that do not indicate if would take again are excluded
				else {
					let percent = ySum / (ySum + nSum) * 100;
					document.getElementById("againPercent").innerHTML = percent.toFixed(1) + "%";
				}

				//adds averages to precision of 1 decimal place to page
				document.getElementById("qualityNum").innerHTML = quality.toFixed(1) + "";
				document.getElementById("difficultyNum").innerHTML = difficulty.toFixed(1) + "";
			})

			
			.catch(function(error) {
				alert("error");
			});

		}
	}

	//reformat page so review form is visible
	function newRating() {
		document.getElementById("teacher").style.display = "none";
		document.getElementById("reviewForm").style.display = "block";
	}

	function submitRating() {
		
		let message = {};
		//message for posting will simply be an object taking its inputs from review form inputs
		message["name"] = document.getElementById("selectTeacher").value;

		//message for post created while at same time while values stored
		//to make sure all inputs match regular expressions
		message["date"] = document.getElementById("date").value;
		let str = message["date"] + "";
		let date = str.match(/^([0-9]{2}\/[0-9]{2}\/[0-9]{4})$/g);
		message["quality"] = document.getElementById("quality").value;
		str = message["quality"] + "";
		let quality = str.match(/^[0-5]\.[0-9]$/g);
		message["difficulty"] = document.getElementById("difficulty").value;
		str = message["difficulty"] + "";
		let difficulty = str.match(/^[0-5]\.[0-9]$/g);
		message["class"] = document.getElementById("class").value;
		str = message["class"] + "";
		let classN = str.match(/^[A-Z]{3,4}[0-9]{3}$/g);
		message["textbook"] = document.getElementById("textbook").value;
		str = message["textbook"] + "";
		let textbook = str.match(/^(Yes)$|^(No)$/g);
		message["takeAgain"] = document.getElementById("takeAgain").value;
		str = message["takeAgain"] + "";
		let takeAgain = str.match(/^(Yes)$|^(No)$|^(N\/A)$/g);
		message["gradeReceived"] = document.getElementById("gradeReceived").value;
		str = message["gradeReceived"] + "";
		let gradeReceived = str.match(/^[A-E][+-]?$/g);
		
		message["comment"] = document.getElementById("comment").value;

		//as long as no value received null, the inputs were all valid
		if ((date!=null) && (quality!=null) && (difficulty!=null) &&
		 (classN!=null) && (textbook!=null) && (takeAgain!=null) &&
		  (gradeReceived!=null)) {
			//hide error message after successful submission
			document.getElementById("errorMessage").style.display = "none";

			const fetchOptions = {
				method : 'POST',
				headers : {
					'Accept': 'application/json',
					'Content-Type' : 'application/json'},
				body : JSON.stringify(message)};

			//let url = "http://localhost:3000";
			let url = "http://jmrateprofessors4.herokuapp.com";

			//post made with object containing user inputs
			fetch(url, fetchOptions)
				.then(checkStatus)
				.then(function(responseText) {
					//teacher fetched again and new review viewable
					fetchTeacher();
				})

			.catch(function(error) {
				alert(error);
			});
		}
		//valid input causes error message to display
		else {
			document.getElementById("errorMessage").style.display = "block";
		}
	}

	function narrowReviews() {
		let selection = document.getElementById("classes").value;

		//nothing will happen if default select message is left selected
		if (selection != "Select a Class") {
			let reviews = document.querySelectorAll("#reviews .review");
			//reset all reviews to visible in case a class has already been selected
			for (let i = 0; i < reviews.length; i++) {
				reviews[i].style.display = "";
			}

			//will go through and hide those that don't match unless the selection is all classes,
			//which causes the previous loop to stand with all reviews visible
			if (selection != "All Classes") {
				for (let i = 0; i < reviews.length; i++) {
					let segments = reviews[i].childNodes;
					let paragraphs = segments[1].childNodes;
					let string = paragraphs[0].innerHTML;
					let name = string.slice(7, string.length);
					if (name != selection) {
						reviews[i].style.display = "none";
					}
				}
			}	
		}
		
	}


	////////////////////////////////////////////////////////////////////////////////////
	function checkStatus(response) {  
		if (response.status>= 200 && response.status< 300) {
			return response.text();
		} 

		else {
			return Promise.reject(new Error("Error Message")); 
		}
	}
    /////////////////////////////////////////////////////////////////////////////////////
}) ();
