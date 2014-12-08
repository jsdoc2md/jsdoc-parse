var test = require("tape");
var parse = require("../");
var transform = require("../lib/transform");
var human = require("./transforms/human");
var exportedClassIDs = require("./transforms/exportedClassIDs");
var setID = require("./transforms/setID");
var setIsExportedFlag = require("./transforms/setIsExportedFlag");

test("setID", function(t){
    var data = human;
    var expected = setID;
    t.deepEqual(data.map(transform.setID), expected);
    t.end();
});

test("setIsExportedFlag", function(t){
    var data = human;
    var expected = setIsExportedFlag;
    t.deepEqual(data.map(transform.setIsExportedFlag), expected);
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
