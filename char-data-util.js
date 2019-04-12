var fs = require('fs');

function restoreOriginalData() {
    fs.writeFileSync('characters.json', fs.readFileSync('character_original.json'));
}

function loadData() {
    return JSON.parse(fs.readFileSync('characters.json'));
}

function saveData(data) {
	// poke.json stores the pokemon array under key "pokemon", 
	// so we are recreating the same structure with this object
	var obj = {
		characters: data
	};

	fs.writeFileSync('characters.json', JSON.stringify(obj));
}

module.exports = {
    restoreOriginalData: restoreOriginalData,
    loadData: loadData,
    saveData: saveData,
}
