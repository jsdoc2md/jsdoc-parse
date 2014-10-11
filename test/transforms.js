var test = require("tape");
var parse = require("../");
var transform = require("../lib/transform");

test("exported class IDs", function(t){
    var data = [
        {
            "kind": "module",
            "longname": "module:human"
        },
        {
            "name": "module:human",
            "kind": "class",
            "meta": {
                "code": {
                    "name": "Human"
                }
            },
            "longname": "module:human"
        },
        {
            "name": "Organ",
            "kind": "class",
            "longname": "module:human~Organ",
            "memberof": "module:human"
        },
        {
            "name": "Cell",
            "kind": "class",
            "longname": "module:human~Organ~Cell",
            "memberof": "module:human~Organ"
        },
        {
            "kind": "member",
            "longname": "module:human~Organ#redCell",
            "memberof": "module:human~Organ",
            "type": {
                "names": [
                    "module:human~Organ~Cell"
                ]
            }
        },
        {
            "kind": "member",
            "longname": "module:human#liver",
            "memberof": "module:human",
            "type": {
                "names": [
                    "module:human~Organ"
                ]
            }
        },
        {
            "kind": "function",
            "longname": "module:human#getOrgan",
            "memberof": "module:human",
            "returns": [
              {
                "type": {
                  "names": [
                    "module:human~Organ"
                  ]
                }
              }
            ]
        }
    ];

    var expected = [
      {
        "kind": "module",
        "longname": "module:human",
        "id": "module:human"
      },
      {
        "name": "Human",
        "kind": "class",
        "meta": {
          "code": {
            "name": "Human"
          }
        },
        "longname": "module:human",
        "id": "module:human--Human",
        "isExported": true
      },
      {
        "name": "Organ",
        "kind": "class",
        "longname": "module:human~Organ",
        "memberof": "module:human--Human",
        "id": "module:human--Human~Organ"
      },
      {
        "name": "Cell",
        "kind": "class",
        "longname": "module:human~Organ~Cell",
        "memberof": "module:human--Human~Organ",
        "id": "module:human--Human~Organ~Cell"
      },
      {
        "kind": "member",
        "longname": "module:human~Organ#redCell",
        "memberof": "module:human--Human~Organ",
        "type": {
          "names": [
            "module:human--Human~Organ~Cell"
          ]
        },
        "id": "module:human--Human~Organ#redCell"
      },
      {
        "kind": "member",
        "longname": "module:human#liver",
        "memberof": "module:human--Human",
        "type": {
          "names": [
            "module:human--Human~Organ"
          ]
        },
        "id": "module:human--Human#liver"
      },
      {
        "kind": "function",
        "longname": "module:human#getOrgan",
        "memberof": "module:human--Human",
        "returns": [
          {
            "type": {
              "names": [
                "module:human--Human~Organ"
              ]
            }
          }
        ],
        "id": "module:human--Human#getOrgan"
      }
    ];
    
    data = transform.setIDs(data);
    data = transform.setIsExportedFlag(data);
    data = transform.exportedClassIDs(data)
    t.deepEqual(data, expected);    
    t.end();
    // console.log(JSON.stringify(data, null, "  "))
});
