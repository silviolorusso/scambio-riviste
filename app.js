var opml    = require('opml-generator'),
    fs      = require('fs'),
    request = require('request');


// Today
var today = new Date()
var dd = String(today.getDate()).padStart(2, '0')
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear()
today = mm + '/' + dd + '/' + yyyy

// Header of OPML 
var header = {
    "title": "scambio-riviste",
    "dateCreated": today,
    "ownerName": "slwr"
}

// OPML array to fill
var outlines = []

// Defining the request URL
var options = {
    url: 'https://spreadsheets.google.com/feeds/cells/1t9fQnc1zFv4sWYMz9PovpLWkKSEd76kqkcpY5J0MFZI/1/public/values?alt=json'
}

// Using the request package to pull the information using the options object defined above
request(options, callback)

// Callback function logging the request body in the console if it was successful
function callback(error, response, body){

    if (!error && response.statusCode == 200) {

        async function makeOPML() {

            function makeRssList() {

                sheetJson = JSON.parse(body)['feed']['entry']

                sheetJson.forEach(el => {
                    var cellLetterNumber =  el['title']['$t']
                    if (cellLetterNumber.includes('D') && cellLetterNumber !== 'D1') {
                        var cellNumber = cellLetterNumber.replace( /^\D+/g, '');

                        siteTitle = sheetJson.find(el2 => el2.title.$t === 'A' + cellNumber)['content']['$t']
                        siteUrl = sheetJson.find(el2 => el2.title.$t === 'B' + cellNumber)['content']['$t']

                        var rssItem = {
                            text: "txt",
                            title: siteTitle,
                            type: "rss",
                            "xmlUrl": el['content']['$t'],
                            "htmlUrl": siteUrl
                        }

                        console.log(rssItem)
                        return(outlines.push(rssItem));
                    }
                });

            }

            await makeRssList();

            feed = opml(header, outlines);

            fs.writeFile('scambio-riviste.opml', feed, function (err) {
                if (err) return console.log(err);
                console.log('\n Feed di Scambio Riviste generato');
            });

        }

        makeOPML();
    
    } else {
        console.log(error)
    }
}

