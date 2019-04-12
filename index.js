var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var exphbs = require('express-handlebars');
var charDataUtil = require("./char-data-util");
var app = express();
var _ = require("underscore");

var fs = require('fs');

var _DATA = charDataUtil.loadData().characters;

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use('/public', express.static('public'));

/* Add whatever endpoints you need! Remember that your API endpoints must
 * have '/api' prepended to them. Please remember that you need at least 5
 * endpoints for the API, and 5 others.
 */

/* 
 * Format of a character
 * {
 * 	"name": 		String
 * 	"description": 	String
 * 	"house": 		String
 * 	"claim":		Boolean
 * 	"season":		Number
 * 	"episodes":		[ String ]
 * 	"playedBy":		String
 * }
 */

app.listen(process.env.PORT || 3000, function() {
	console.log('Listening on port 3000!');
});

app.get('/',function(req,res){
	
  res.render('home',{characters: _DATA.sort((a,b) => sortCharacter(a,b)) } );
})

app.get("/name/:name", function(req, res){
	let _name = req.params.name;

	_name = capitalizeName(_name)
	let result = _.findWhere(_DATA, { name: _name })
	let ret
	if (!result){
		ret = {
			error: false,
			output: "The character has not been added to the data"
		}
	} else {
		ret = {
			error: false,
			name: result.name,
			description: result.description,
			house: result.house,
			claim: result.claim,
			playedBy: result.playedBy,
			episodes: result.episodes,
			season: result.season
		}		
	}
	res.render("character", ret)
})

/*
 * list of all characters that have a claim to the iron throne
 * Sorted alphabetically A-Z By character name
 * Claim key in the object determines if character has a claim to the throne 
 * 
 * Ex. Lyanna Mormont would not appear but Viserys Targaryen would be in the list
 */
app.get("/claim", function(req, res){
	// filter for only a list of valid claims to the throne
	let ret = []
	let claimList = _DATA.filter((element) => {
		if(element["claim"]){
			return true
		} else {
			return false
		} 
	})

	if(claimList.length > 0){
		// sorts list if it is not empty
		claimList.sort((a,b) => sortCharacter(a,b))

		// list of only names
		let index = 1
		for(let element of claimList){
			ret.push({id: index, name: element["name"]})
			index++
		}
	}

		// sends the list to the view
		res.render("list",{title: "Characters with a claim to the Iron Throne. There Can Be Only One", chars: ret, error: false})
})

// returns list of characters with more than 20 episode appearances
app.get("/most", function(req, res){

	let ret = _DATA.filter((elem) => {
		if(elem.episodes.length > 19){
			return true
		} else {
			return false
		}
	})
	res.render("list",{title: "Characters with more than 20 episode appearances", chars: ret, error: false})

})

/*
 * returns a list of all characters in characters.json
 * List is returned in ascending alphabetical order
 * ordered based on the names of the characters
 */
app.get("/alphabetical", function(req, res){

	let lst = []

	// list of only names in characters.json
	// and sorts them alphabetically
	for(let index of _DATA){
		lst.push(index)
	}
	lst.sort((a, b) => sortCharacter(a, b))

	let ret = []
	let i = 1
	for(let element of lst){
		ret.push({id: i, name: element["name"]})
		i++
	}

	res.render("list", {title: "Alphabetical Game of Thrones Characters", chars: ret, error: false})
})

/*
 * Sends to a sub page to enter which season is being refered to
 * Once season is submitted the page will dynamically return the result of the search
 * Returns "No characters from that season have been entered" or "Invalid season"
 */
app.get("/season", function(req, res){
	let season_title = "Enter a season number to see which characters last appeared there"
	res.render("search", {title: season_title, type: "season"})
})

app.get("/house", function(req, res){
	let house_title = "Enter the name of the house you want to see or enter \"None\""
	res.render("search", {title: house_title, type: "house"})
})

app.get("/results/:type/:value", function(req, res){
	
	let _type = req.params.type
	let _value = req.params.value

	let ret = readInput(_type, _value)

	// capitalize title
	ret.title = ret.title.charAt(0).toUpperCase() + ret.title.slice(1);

	// prompt of if there is nothing in the response and not an error
	if(ret.output.length == 0){
		ret.output = ["No characters have currently been added for " + _type + " " + _value]
		ret.error = true
	} else {
		ret.output.sort((a,b) => sortCharacter(a,b))
	}
	res.render("list", {title: ret.title, chars: ret.output, error: ret.error})
})

// redirects to view to add values for the character
app.get("/addCharacter", function(req, res){
	res.render("add_character")
})

// sent from a post request to make a new character
app.post("/api/addCharacter", function(req, res){
	// getting feilds sent in 
	let _name = req.body.name
	let _description = req.body.description
	let _house = req.body.house
	let _claim = req.body.claim  == "true" ? true: false
	let _season = parseInt(req.body.season, 10)
	let _episodes = req.body.episodes.split("|")
	let _playedBy = req.body.playedBy

// {"description":"hi","house":"Stark","claim":true,"season":7,"episodes":["hi"]}

	let result = _.findWhere(_DATA, {name: _name})

	if(result){
		res.send("The character has already been added")
	} else if(_season > 0 && _season < 8) {
		let obj = [{
			
			"name": _name,
			"description": _description,
			"house": _house,
			"claim": _claim,
			"season": _season,
			"episodes": _episodes,
			"playedBy": _playedBy
		}]
		_DATA = _.union(_DATA, obj)
	
		let ret = {
			characters: _DATA
		}
		console.log(_DATA)
		fs.writeFileSync("characters.json", (JSON.stringify(ret, null, 4)))
		res.send(_name + " has been added")
	} else {
		res.send("The season is invalid, the character was not added. Enter a season from 1-7")
	}
})

// returns all data as a json
app.get("/api/allCharacters", function(req, res) {
    res.json(_DATA);
});

// returns a json view of a paticular character
app.get("/api/name/:name", function(req, res) {
	
	let _name = req.params.name;

	_name = capitalizeName(_name)
    let result = _.findWhere(_DATA, { name: _name })
    if (!result){
		res.json({});
	} else {
		res.json(result);
	}	
})

// edits and existing character entry
app.post("/api/edit", function(req, res) {
	
	let _name = req.body.name
	let _description = req.body.description
	let _house = req.body.house
	let _claim = req.body.claim
	let _season = req.body.season
	let _episodes = req.body.episodes.split("|")
	let _playedBy = req.body.playedBy

	_name = capitalizeName(_name)
	let result = _.findWhere(_DATA, {name: _name})

	// checking if character already existed
	if(!result){
		res.send("The character to be edited does not exist")
	} else if(_season > 0 && _season < 8) {

		// modify value in JSON
		result.name = _name
		result.description = _description
		result.episodes = _episodes
		result.house = _house
		result.season = _season
		result.claim = _claim
		result.playedBy = _playedBy
		

		let ret = {
			characters: _DATA
		}
		fs.writeFileSync("characters.json", (JSON.stringify(ret, null, 4)))
		res.send(_name + " has been edited")
	} else {
		res.send("The season is invalid, the character was not edited. Enter a season from 1-7")
	}
})

// removes a character from the json file
app.delete("/api/remove", function(req, res){
	let _name = req.body.name

	_name = capitalizeName(_name)
	let result = _.findWhere(_DATA, {name: _name})
	// checking if character exists
	if(result){
		// removes target character
		_DATA = _.without(_DATA, result)
		let ret = {
			characters: _DATA
		}
		
		fs.writeFileSync("characters.json", (JSON.stringify(ret, null, 4)))
		res.send(_name + " has been deleted")
	} else {
		res.send("The character to be deleted does not exist")
	}
})

// sorts characters by name A-Z
function sortCharacter(a, b){
	let aName = a["name"].toUpperCase()
	let bName = b["name"].toUpperCase()
	return aName.localeCompare(bName)
}

// Regardless of how user enter the data it can be understood khal moro = KHaL MorO
function capitalizeName(name){

	let ret = ""
	let lst = name.split(" ")
	for(let element of lst){
		let value = element.charAt(0).toUpperCase() + element.substring(1).toLowerCase()
		ret += value + " "
	}
	 ret = ret.trim();
	return ret
}

// generates the response for the input from search.handlebars
// outputs the object that will be sent with the render
function readInput(type, value){
	// grabbing data from the input field
	
	let result = {
		title: type + " " + value + " Characters",
		output: [],
		error: false
	}

	// checks how it should be filtered

	// filtering based on season so only numbers from 1-7 could have valid input
	if(type == "season"){
		
		// value other than a number was entered
		if(isNaN(value)){

			// returns an object showing an error occured
			response = ["Invalid Entry, Enter a valid season number from 1-8"]
			result.title = "Error"
			result.output = response
			result.error = true
			return result

		// invalid season entered
		}else if(value > 8 || value < 1){
			result.title = "Error"
			response = ["Invalid Entry, Enter a valid season number from 1-8"]
			result.output = response
			result.error = true
			return result
		
		// season 8 entered, exists but hasn't happended yet
		} else if (value == 8){
			result.title = "Error Season Not Aired"
			response = ["Almost here but not yet."]
			result.output = response
			result.error = true
			return result
		
		// valid season entered
		} else {
			// gets all data that is valid
			let filtered = _DATA.filter((elem) => {
				
				if(elem["season"] == parseInt(value, 10)){
					return true
				} else {
					return false
				}
			})

			// adds valid data to results
			result.output = filtered
			return result
		}

	// if the type was for house
	} else if (type == "house"){
		
		let filtered = _DATA.filter((elem) => {
				
			if(elem["house"] == value){
				return true
			} else {
				return false
			}
		})

		// If the house entered does not exist
		if(filtered.length == 0){
			result.error = true
			result.title = "Error No Characters With That House Name"
			result.output = ["There is no one with that house name."]
			return result
		} else {
			if(value == "None"){
				result.title = "Characters with No House"
			}
			result.output = filtered
			return result
		}
	}
}

app.get("/test", function(req, res){
	var fs = require('fs');
	_DATA = JSON.parse(fs.readFileSync('characters.json'))["characters"]

	res.send(Array.isArray(_DATA))
})