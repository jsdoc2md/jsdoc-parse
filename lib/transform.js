"use strict";
var o = require("object-tools");
var a = require("array-tools");

exports.setIsExportedFlag = setIsExportedFlag;
exports.setIDs = setIDs;
exports.exportedClassIDs = exportedClassIDs;

function update(array, query, newValues){
    for (var i = 0; i < array.length; i++){
        if (o.exists(array[i], query)){
            var values = typeof newValues === "function" ? newValues(array[i]) : newValues;
            for (var prop in values){
                if (values[prop] !== undefined) array[i][prop] = values[prop];
            }
        }
    }
}

function exportedClassIDs(data){
    update(data, { isExported: true }, function(exportedClass){
        var metaName = exportedClass.meta && exportedClass.meta.code && exportedClass.meta.code.name;
        var oldClassID = exportedClass.longname;
        var newClassID = oldClassID + "--" + metaName;        

        update(data, { "!longname": oldClassID }, function(identifier){
            return {
                id: identifier.longname.replace(oldClassID, newClassID),
                memberof: identifier.memberof && identifier.memberof.replace(oldClassID, newClassID),
                returns: identifier.returns && identifier.returns.map(function(ret){
                    if (ret.type.names){
                        ret.type.names = ret.type.names.map(function(name){
                            return name.replace(oldClassID, newClassID);
                        });
                    }
                    return ret;
                }),
                type: identifier.type && identifier.type.names  && {
                    names: identifier.type.names.map(function(name){
                        return name.replace(oldClassID, newClassID);
                    })
                } 
            };
        });

        return { id: newClassID, name: metaName, isExported: true };
    });
    
    return data;
}

function setIsExportedFlag(data){
    update(data, { kind: /class|function/, name: /module:/ }, { isExported: true });
    return data;
}

function setIDs(data){
    update(data, null, function(identifier){
        return { id: identifier.longname };
    });
    return data;
}
