var fs = require("fs");
var swig = require('swig');

//require 4 args: input release note file; output release note html file, project key, jira url;
var args = process.argv.slice(2);

if(args.length !==4) {
    console.log('expect 4 args: input release note file; output release note html file, project key, jira url; actual arg size : '+args.length);
    console.log('full args: ',args);
    process.exit(1);
} 

//@param
var inputFile = args[0]; //"./releaseNote.txt";
//@param
var outPutFile = args[1]; //"./releaseNote.html";

/**
 * JIRA vars
 */
//@param
var projectKey = args[2]; //'BVJS';
//@param
var jiraURL = args[3]; //'10.0.1.100:8080';

var projectKeyReg = new RegExp('- \\['+projectKey+'-[0-9]+\\] ');

// only one line returned by the 'releaseNote' environment var from jenkins..
// parse it !
fs.readFile(inputFile, "utf8", function(err, data) {
    if (err)
        throw err;

    var types = data.split('# ');
    var issueTypes = [];
    // first index is always empty due to split regex
    for (var i = 1; i < types.length; i++) {
        var lineSeparatorIndex = types[i].indexOf('- ');
        var type = types[i].substring(0, lineSeparatorIndex);
        var issueType = {
            title : type,
            issues : []
        };
        issueTypes.push(issueType);
        displayIssues(types[i].substring(lineSeparatorIndex), issueType);
    }

    var result = swig.renderFile(__dirname+'/template.html', {
        issueTypes : issueTypes,
        url : jiraURL
    });

    fs.writeFile(outPutFile, result, function(err) {
        if (err)
            throw err;
        console.log('html release note generated');
    });
});

function displayIssues(line, issueType) {

    // split by JIRA issue, but retrieve ID's of issues
    var reg = new RegExp('(' + projectKey + '-[0-9]+)', 'g');
    var issueIDs = line.match(reg);
    var lines = line.split(projectKeyReg).slice(1);

    for (var i = 0; i < issueIDs.length; i++) {
        issueType.issues.push({
            id : issueIDs[i],
            summary : lines[i]
        });
    }
}