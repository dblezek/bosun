ace.define('ace/mode/bosun', function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var BosunHighlightRules = function() {
    
    var globals = "tsdbHost|logstashElasticHosts|relayListen|smtpHost|emailFrom|unknownTemplate|" +
        "httpListen|timeAndDate|ping|responseLimit|squelch|shortUrlKey|blockedPutIPs|allowedPutIPs";
     
    var inSectionKeywords = "template|macro|crit|depends|warn|warnNotification|critNotification|" +
        "ignoreUnknown|unjoinedOk|log|body|subject|email|post|timeout|next";
        
    var exprFuncs = "alert|q|median|sum|dev|min|max|avg|t|change|band|rename" +
        "lsstat|lscount|lookup|percentile|drople|dropgt|d|ungroup|last|len|nv";
        
    this.$rules = {
        "start" : [
            {
                token: "keyword", 
                regex: "^(" + globals + ")", 
                next: "consumeLine"
            },
            {
                token: "variable.instance", 
                regex: "[$]", 
                next: "variable"
            },
            {
                // Section Declaration
                token: ["keyword", "space", "variable", "space", "paren.lparent"], 
                regex: "^(alert|notification|lookup|macro|template)(\\s+)([-a-zA-Z0-9._]+)(\\s)+([{])",
            },
            {
                // Lookup Entry
                token: ["space", "keyword", "space", "regexp", "space", "paren.lparen"],
                regex: "(\\s*)(entry)(\\s*)(.*)(\\s)([{])",
            },
            {
                // Squelch Entry
                token: ["space", "keyword", "space", "keyword.operator", "regexp"],
                regex: "(\\s*)(squelch)(\\s*)(=)(.*)",
            },
            {
                token: ["space", "keyword", "space", "equals"],
                regex: "(\\s*)(" + inSectionKeywords + ")(\\s*)(=)",
            },
            {
                token: "string",
                regex: '"',
                next: "qqstring"
            },
            {
                token: "string", 
                regex : "[']" + '(?:(?:\\\\.)|(?:[^' + "'" + '\\\\]))*?' + "[']"},  // single line 
            {
                token: "string", 
                regex : '[`](?:[^`]*)[`]'}, // single line
            {
                token: "string", merge : true, 
                regex : '[`](?:[^`]*)$', next : "bqstring"
            },
            {   
                token: "doc.comment", 
                regex : /^\s*#.*/},
            {
                token: "constant.numeric",
                regex: "[+-]?[0-9.]+e?[0-9.]*\\b"},
            {
                token: "keyword.operator", 
                regex: "\\+|\\-|\\*|\\*\\*|\\/|\\/\\/|%|<<|>>|&|!|\\||\\^|~|<|>|<=|=>|==|!=|<>|="},
            {
                token: "paren.lparen",
                regex : "[\\[({]"},
            {
                token: "paren.rparen",
                regex : "[\\])}]"},
            {
                token: ["support.function", "paren.lparen"], 
                regex: "(" + exprFuncs + ")([(])"},
            { 
                caseInsensitive: true
            }
        ],
        "consumeLine": [
            {
                token: "consumeLine",
                regex: ".*$",
                next: "start"
            },
        ],
        "qqstring": [
            {
                token: "variable",
                regex: /\$\{\w+}|\$\w+\b/,
                push: "variable"
            }, {
                token: "string",
                regex: '"',
                next: "pop"
            }, {
                defaultToken: "string"
            }],
        "bqstring": [
            {
                token: "string", 
                regex : '(?:[^`]*)`', 
                next : "start"}, 
            {
                token: "string",
                regex : '.+'
                
            }
        ],
        "variable": [ 
            {
                token: "variable.instance", // variable
                regex: "[a-zA-Z_\\d]+(?:[(][.a-zA-Z_\\d]+[)])?",
                next : "start"
            }, {
                token: "variable.instance", // with braces
                regex: "{?[.a-zA-Z_\\d]+}?",
                next: "start"
            }
        ],
    };
};

oop.inherits(BosunHighlightRules, TextHighlightRules);

exports.BosunHighlightRules = BosunHighlightRules;
});
