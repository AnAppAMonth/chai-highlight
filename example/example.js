
// Run this example using Mocha!

/* global describe, it, before */
/* jshint -W030 */
var chai = require('chai'),
    expect = chai.expect,
    common = require('chai-common'),
    highlight = require('../');

chai.use(common);

describe('The values', function() {
    it('should not be highlighted', function() {
        expect('The quick brown fox jumps over the lazy dog').to.not.containAtIndex('fox jumps over', 16);
    });
});
describe('The values', function() {
    before(function() {
        chai.use(highlight);
    });
    it('should be highlighted', function() {
        expect('The quick brown fox jumps over the lazy dog').to.not.containAtIndex('fox jumps over', 16);
    });
});
