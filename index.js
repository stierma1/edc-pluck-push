"use strict"

var Worker = require("basic-distributed-computation").Worker;
var jsonPath = require("jsonPath");
var pluckMatch = /_pluck\/\{([a-z\.A-Z0-9\/\:\-\@\[\]\?\(\)\*\,\&\|\ \=\"\n\t\r\\\$\>\<\'\!\~\#\%\^\+\_]+)\}/;
var pushMatch = /_push\/{(\$(\.[a-zA-Z0-9\:\-\_\#\@\$]+)+)+\}/;
var grabFirstMatch = /_grab_first\/{true}/

class PluckPush extends Worker {
  constructor(parent){
    super("pluck-push", parent);
  }

  work(req, inputKey, outputKey){
    var inputVal = req.body;
    if(inputKey){
      inputVal = req.body[inputKey];
    }
    var pluck = pluckMatch.exec(req.paths[req.currentIdx]);
    if(pluck){
      var val = jsonPath.query(inputVal, pluck[1]);
    } else {
      val = inputVal;
    }

    var grabFirst = grabFirstMatch.exec(req.paths[req.currentIdx]);
    if(grapFirst){
      val = val[0];
    }

    var push = pushMatch.exec(req.paths[req.currentIdx]);
    if(push){
      var spl = push[1].split(".");
      var current = req.body;
      for(var i = 1; i < spl.length-1; i++){
        if(!current[spl[i]]){
          current[spl[i]] = {};
        }
        current = current[spl[i]];
      }
      current[spl[i]] = val;
    }

    req.next();
  }
}

module.exports = PluckPush;
