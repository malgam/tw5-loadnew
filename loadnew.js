/*\
title: $:/malgam/loadnew.js
type: application/javascript
module-type: command

Command to load new or modified tiddlers from a file

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.info = {
    name: "loadnew",
    synchronous: false
};

var Command = function(params,commander,callback) {
    this.params = params;
    this.commander = commander;
    this.callback = callback;
};

Command.prototype.execute = function() {
    var self = this,
        fs = require("fs"),
        path = require("path");
    if(this.params.length < 1) {
        return "Missing filename";
    }
    var ext = path.extname(self.params[0]);
    fs.readFile(this.params[0],$tw.utils.getTypeEncoding(ext),function(err,data) {
        if (err) {
            self.callback(err);
        } else {
            var fields = {title: self.params[0]},
                type = path.extname(self.params[0]);
            var tiddlers = self.commander.wiki.deserializeTiddlers(type,data,fields);
            if(!tiddlers) {
                self.callback("No tiddlers found in file \"" + self.params[0] + "\"");
            } else {
                for(var t=0; t<tiddlers.length; t++) {
                    var tid = new $tw.Tiddler(tiddlers[t]);
		    var tidDate = tid.hasField("modified") 
	    	    		? $tw.utils.formatDateString(tid.fields.modified,
                                  'YYYY0MM0DD0hh0mm0ss')
                                : "";
                    var existingTid = self.commander.wiki.getTiddler(tid.fields.title);
                    var existingTidDate = existingTid && existingTid.hasField("modified") 
                                        ? $tw.utils.formatDateString(existingTid.fields.modified,
                                          'YYYY0MM0DD0hh0mm0ss')
                                        : "";
                    if(!existingTid || tidDate > existingTidDate) {
                        $tw.wiki.addTiddler(tid);
                    }
                }
                self.callback(null);	
            }
        }
    });
    return null;
};

exports.Command = Command;

})();

