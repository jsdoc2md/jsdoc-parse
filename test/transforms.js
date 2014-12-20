"use strict";
var test = require("tape");
var parse = require("../");
var transform = require("../lib/transform");
var human = require("./transforms/human");
var util = require("util");

var fixture = {
	updateIDReferences: require("./transforms/fixture/updateIDReferences"),
	setID: require("./transforms/fixture/setID"),
	setIsExportedFlag: require("./transforms/fixture/setIsExportedFlag"),
	createConstructor: require("./transforms/fixture/createConstructor"),
	removeQuotes: require("./transforms/fixture/removeQuotes"),
	buildTodoList: require("./transforms/fixture/buildTodoList"),
	setCodename: require("./transforms/fixture/setCodename")
};
var expected = {
	updateIDReferences: require("./transforms/expected/updateIDReferences"),
	setID: require("./transforms/expected/setID"),
	setIsExportedFlag: require("./transforms/expected/setIsExportedFlag"),
	createConstructor: require("./transforms/expected/createConstructor"),
	removeQuotes: require("./transforms/expected/removeQuotes"),
	buildTodoList: require("./transforms/expected/buildTodoList"),
	setCodename: require("./transforms/expected/setCodename")
};

test("setID", function(t){
    t.deepEqual(fixture.setID.map(transform.setID), expected.setID);
    t.end();
});

test("setIsExportedFlag", function(t){
    t.deepEqual(transform.setIsExportedFlag(fixture.setIsExportedFlag), expected.setIsExportedFlag);
    t.end();
});

test("setCodename", function(t){
    t.deepEqual(transform.setCodename(fixture.setCodename), expected.setCodename);
    t.end();
});

test("create constructor", function(t){
    t.deepEqual(transform.createConstructor(fixture.createConstructor), expected.createConstructor);
    t.end();
});

test("setMemberOf", function(t){
    t.deepEqual(transform.setID(fixture.setID), expected.setID);
    t.end();
});

test("removeQuotes", function(t){
    t.deepEqual(transform.removeQuotes(fixture.removeQuotes), expected.removeQuotes);
    t.end();
});

test("clean properties - need a fixture");

test("buildTodoList", function(t){
    t.deepEqual(fixture.buildTodoList.map(transform.buildTodoList), expected.buildTodoList);
    t.end();
});

test("updateIDReferences", function(t){
    var result = fixture.updateIDReferences.map(function(identifier){
        return transform.updateIDReferences(identifier, "module:cjs/human--Human");
    });
    t.deepEqual(result, expected.updateIDReferences);
    t.end();
});
