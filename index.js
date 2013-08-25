
var adhoc = require('chai-adhoc'),
    format = adhoc.format;

var highlightStyle = '\x1B[1m';
var restoreStyle = '\x1B[22m';

var stylePat = /\x1B\[/;
// The preceeding space makes sure we don't take, eg, a "don't", as a match.
var startingPat = / [[{'"\/]/g;
// Used by `findClosingBracket()`.
var allPat = /[[{'"\/\\}\]]/g;
// Used by `findMatchingQuote()`.
var quotePat = /['"\/\\]/g;
// "not" is not a literal, but it's important nevertheless, so we include it.
var literalPat = /((^| )(\d[\d.]*|true|false|null|undefined|not))(?=([ ,.;:?!]|$))/g;

// Supports any type of bracket.
function findClosingBracket(msg, opening, closing, start) {
    // Search for `closing` in `msg` starting at `start`.
    // But must skip strings, and nested bracket pairs of the same type.
    var count = 1,
        // Can be false, '"', or "'".
        inString = false,
        // Index of the previous backslash.
        backslash = -100,
        match;

    allPat.lastIndex = start;
    match = allPat.exec(msg);
    while (match) {
        if (match[0] === "'" || match[0] === '"' || match[0] === '/') {
            if (backslash !== match.index - 1) {
                // This quote isn't escaped.
                if (inString) {
                    if (inString === match[0]) {
                        inString = false;
                    }
                } else {
                    inString = match[0];
                }
            }
        } else if (match[0] === opening) {
            if (!inString) {
                count++;
            }
        } else if (match[0] === closing) {
            if (!inString) {
                count--;
                if (count === 0) {
                    // We have found the match.
                    return match.index;
                }
            }
        } else if (match[0] === '\\') {
            // This backslash is only an escape if it's not being escaped.
            if (backslash !== match.index - 1) {
                backslash = match.index;
            }
        }
        match = allPat.exec(msg);
    }

    return -1;
}

// Supports single quotes, double quotes, and forward slashs (used to "quote" RegExps).
function findMatchingQuote(msg, quote, start) {
    // Search for `quote` in `msg` starting at `start`.
    // But must skip escaped instances of the quote.
    var backslash = -100,  // Index of the previous backslash.
        match;

    quotePat.lastIndex = start;
    match = quotePat.exec(msg);
    while (match) {
        if (match[0] === quote && backslash !== match.index - 1) {
            // We have found the match.
            return match.index;
        } else if (match[0] === '\\') {
            // This backslash is only an escape if it's not being escaped.
            if (backslash !== match.index - 1) {
                backslash = match.index;
            }
        }
        match = quotePat.exec(msg);
    }

    return -1;
}


function procMsg(msg) {
    if (stylePat.test(msg)) {
        // It already contains color codes, don't process it.
        return msg;
    } else {
        var occurences = [],
            match, starting, closing;

        startingPat.lastIndex = 0;
        match = startingPat.exec(msg);
        while (match) {
            if (match[0] === ' {') {
                closing = findClosingBracket(msg, '{', '}', startingPat.lastIndex);
            } else if (match[0] === ' [') {
                closing = findClosingBracket(msg, '[', ']', startingPat.lastIndex);
            } else {
                closing = findMatchingQuote(msg, match[0][1], startingPat.lastIndex);
            }

            if (closing >= 0) {
                occurences.push([match.index, closing + 1]);
                startingPat.lastIndex = closing + 1;
            } else {
                // No closing pattern found, discard this opening pattern.
                startingPat.lastIndex = match.index + match[0].length;
            }
            match = startingPat.exec(msg);
        }

        // Insert styles for both matched parts and literals in unmatched parts.
        var end = msg.length;
        for (var i = occurences.length - 1; i >= 0 ; i--) {
            starting = occurences[i][0];
            closing = occurences[i][1];
            msg = msg.substring(0, starting) + highlightStyle
                + msg.substring(starting, closing) + restoreStyle
                + msg.substring(closing, end).replace(literalPat, highlightStyle + '$&' + restoreStyle)
                + msg.substring(end);
            end = starting;
        }
        msg = msg.substring(0, end).replace(literalPat, highlightStyle + '$&' + restoreStyle)
            + msg.substring(end);

        return msg;
    }
}

function wrapper(error, ctx) {
    if (error) {
        error.message = procMsg(error.message);
    }
}

function highlight(chai, utils) {
    var Assertion = chai.Assertion;

    chai.use(adhoc);

    // We need to overwrite all assertion properties and methods in the Assertion
    // object. But we shouldn't overwrite chainable methods, chainable getters,
    // flag setters, and some internal members.
    // Luckily, Chai Adhoc supports exactly this.
    var obj = new Assertion(1),
        /* jshint -W103 */
        props = Object.getOwnPropertyNames(obj.__proto__);

    for (var i = 0; i < props.length; i++) {
        var prop = props[i];

        try {
            // Try to wrap this member, it will fail if this member shouldn't
            // be overwritten.
            adhoc.wrapAssertion(prop, wrapper);
        } catch (e) {}
    }

    return true;
}

highlight.setStyles = function(highlight, restore, pattern) {
    if (highlight) {
        highlightStyle = highlight;
    }
    if (restore) {
        restoreStyle = restore;
    }
    if (pattern) {
        stylePat = pattern;
    }
};

module.exports = highlight;
