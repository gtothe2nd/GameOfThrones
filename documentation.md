
# Game of Thrones Characters

---

Name: Grant Gillerman

Date: 4/2/2019

Project Topic: Game of Thrones Characters

URL: https://cmsc389k-game-of-thrones.herokuapp.com/

---


### 1. Data Format and Storage

Data point fields:
- `Field 1`:     Name                  `Type: String`
- `Field 2`:     Description           `Type: String`
- `Field 3`:     House                 `Type: String`
- `Field 4`:     Iron Throne Claim     `Type: Boolean`
- `Field 5`"     Last Season in        `Type: Number`
- `Field 5`:     Episode List          `Type: [String]`
- `Field 6`:     Played By             `Type: String`

Schema: 
```javascript
{
   name: String,
   description: String,
   house: String,
   claim: boolean,
   season: Number,
   episodes: [String],
   playedBy: String
}
```

### 2. Add New Data

HTML form route: `/addCharacter`

POST endpoint route: `/api/addCharacter`

Example Node.js POST request to endpoint: 
For the episodes key submit the value as a string with the episode names seperated by a '|' character
If the character has no house then enter None as the value
```javascript
var request = require("request");

var options = { 
    method: 'POST',
    url: 'http://localhost:3000/api/addCharacter',
    headers: { 
        'content-type': 'application/x-www-form-urlencoded' 
    },
    form: { 
       name: "Lyanna Mormont",
       description: "Lady Lyanna Mormont is the young Lady of Bear Island and thus the head of House Mormont of Bear Island ever since the death of her mother, Maege Mormont. She is the niece of Lord Commander Jeor Mormont of the Night's Watch and the first cousin of Ser Jorah Mormont. She pledges House Mormont's forces to House Stark upon meeting Jon Snow, Sansa Stark, and Davos Seaworth, making her house one of the few loyalists to fight for the Starks against House Bolton at the Battle of the Bastards. Afterwards, she is the first to declare Jon Snow the King in the North during a gathering of the Northern lords at Winterfell.",
       house: "Mormont",
       claim: "false",
       season: "7",
       episodes: "Stormborn|Dragonstone|Winds of Winter|Battle of the Bastards|The Broken Man",
       playedBy: "Bella Ramsey"
    } 
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});
```

### 3. View Data

GET endpoint route: `/api/allCharacters`

### 4. Search Data

Search Field: name

GET endpoint route: `/api/name/:name`

Example Node.js GET request to endpoint: 
```javascript
var request = require("request");

var options = { 
    method: 'GET',
    url: 'http://localhost:3000/api/name/Khal Moro',
    headers: { 
        'content-type': 'application/x-www-form-urlencoded' 
    },
    form: { 

    } 
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});
```

HTML Form route: `/name/:name`

JSON output would be 
{
    "name": "Khal Moro",
    "description": "Dothraki Khal of another tribe, wanted to bed Daenerys Targaryen",
    "house": "None",
    "claim": "false",
    "season": "6",
    "episodes": [
        "The Red Woman",
        "Oathbreaker",
        "Book of the Stranger"
    ],
    "playedBy": "Joseph Naufahu"
}

### 5. Edit Data
POST endpoint route: `/api/edit`
Example Node.js POST request to endpoint: 
```javascript
var request = require("request");

var options = { 
    method: 'POST',
    url: 'http://localhost:3000/edit',
    headers: { 
        'content-type': 'application/x-www-form-urlencoded' 
    },
    form: {
         "name": "Khal Moro",
         "description": "Dothraki Khal of another tribe, wanted to bed Daenerys Targaryen",
         "house": "None",
         "claim": "false",
         "season": "6",
         "episodes": [
            "The Red Woman",
            "Oathbreaker",
            "Book of the Stranger",

            "Hello I am the change you made"

         ],
         "playedBy": "Joseph Naufahu"
      }
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});
```
### 6. Delete Data
DELETE endpoint route: `/api/remove`
Example Node.js DELETE request to endpoint: 
```javascript
var request = require("request");

var options = { 
    method: 'DELETE',
    url: 'http://localhost:3000/api/remove',
    headers: { 
        'content-type': 'application/x-www-form-urlencoded' 
    },
    form: {
         "name": "Khal Moro"
      }
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});

### 7. Navigation Pages

Navigation Filters
1. Last Season Appearance for Character ->   `/season/:number`
2. Select a House ->                         `/house/:house`
3. Claim to the Iron Throne ->               `/claim`
4. Alphabetical Characters ->                `/alphabetical`
5. Most Episodes ->                          `/most`
