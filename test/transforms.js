var test = require("tape");
var parse = require("../");
var transform = require("../lib/transform");
var human = require("./transforms/human");

var fixture = {
	exportedClassIDs: require("./transforms/fixture/exportedClassIDs"),
	setID: require("./transforms/fixture/setID"),
	setIsExportedFlag: require("./transforms/fixture/setIsExportedFlag"),
	setCodename: require("./transforms/fixture/setCodename")
};
var expected = {
	exportedClassIDs: require("./transforms/expected/exportedClassIDs"),
	setID: require("./transforms/expected/setID"),
	setIsExportedFlag: require("./transforms/expected/setIsExportedFlag"),
	setCodename: require("./transforms/expected/setCodename")
};

test("setID", function(t){
    t.deepEqual(transform.setID(fixture.setID), expected.setID);
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

test.skip("exported class IDs", function(t){
    var data = human;
    var expected = exportedClassIDs;

    data = data.map(transform.setID)
        .map(transform.setIsExportedFlag);

    transform.setData(data).exportedClassIDs();
    t.deepEqual(transform.getData(), expected);
    t.end();
    // console.log(JSON.stringify(data, null, "  "))
});
