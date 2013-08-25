
/* global describe, it, before */
/* jshint -W030 */
var chai = require('chai'),
    expect = chai.expect,
    highlight = require('../');

chai.use(highlight);

describe('Chai', function() {
    it('should work correctly after using highlight', function() {
        expect(expect(1).hasOwnProperty('__flags')).to.be.true;
    });
});

describe('After using custom styles, error messages', function() {
    describe('not already containing styling', function() {
        before(function() {
            highlight.setStyles('<b>', '</b>', /<b>/);
        });
        it('should be styled properly', function() {
            expect(function() {
                expect({x: 3, y: 'abc', z: [1, 2, 3]}).to.have.property('non-existent');
            }).to.throw(/expected<b> { x: 3, y: 'abc', z: \[ 1, 2, 3 \] }<\/b> to have a property<b> 'non-existent'<\/b>/);
        });
    });
    describe('already containing styling', function() {
        it('should not be styled', function() {
            expect(function() {
                expect({x: 3, y: '<b>', z: [1, 2, 3]}).to.have.property('non-existent');
            }).to.throw(/expected { x: 3, y: '<b>', z: \[ 1, 2, 3 \] } to have a property 'non-existent'/);
        });
    });
});

describe('Error Messages', function() {
    describe('not already containing styling', function() {
        before(function() {
            highlight.setStyles('\x1B[1m', '\x1B[22m', /\x1B\[/);
        });
        it('should be styled properly', function() {
            expect(function() {
                expect('oh my god').to.equal({msg: 'oh my god'});
            }).to.throw(/expected\x1B\[1m 'oh my god'\x1B\[22m to equal\x1B\[1m { msg: 'oh my god' }\x1B\[22m/);
            expect(function() {
                expect({msg: 'wtf'}).to.contain.key('wtf');
            }).to.throw(/expected\x1B\[1m { msg: \'wtf\' }\x1B\[22m to contain key\x1B\[1m \'wtf\'\x1B\[22m/);
            expect(function() {
                expect(4).to.be.within(6, 9);
            }).to.throw(/expected\x1B\[1m 4\x1B\[22m to be within\x1B\[1m 6..9\x1B\[22m/);
            expect(function() {
                expect(['ab', 'bc', 6, [1, 4]]).to.contain.members(['ab', 'cd']);
            }).to.throw(/expected\x1B\[1m \[ 'ab', 'bc', 6, \[ 1, 4 \] \]\x1B\[22m to be a superset of\x1B\[1m \[ 'ab', 'cd' \]\x1B\[22m/);
            expect(function() {
                expect({x: [1, 2], y: 6, c: 'string'}).to.be.false;
            }).to.throw(/expected\x1B\[1m { x: \[ 1, 2 \], y: 6, c: 'string' }\x1B\[22m to be\x1B\[1m false\x1B\[22m/);
            expect(function() {
                expect(expect(1)).to.not.respondTo('respondTo');
            }).to.throw(/expected\x1B\[1m { Object \(__flags\) }\x1B\[22m to\x1B\[1m not\x1B\[22m respond to\x1B\[1m \'respondTo\'\x1B\[22m/);
            expect(function() {
                expect([{arr: [3, 5, 6]}, [5, 9]]).to.have.lengthOf(3.5);
            }).to.throw(/expected\x1B\[1m \[ { arr: \[ 3, 5, 6 \] }, \[ 5, 9 \] \]\x1B\[22m to have a length of\x1B\[1m 3.5\x1B\[22m but got\x1B\[1m 2\x1B\[22m/);
            expect(function() {
                expect({x: [{y: 5}], y: {z: {a: 3}}}).to.match(/{"ab'} in ['"] \/ \\\\\\/);
            }).to.throw(/expected\x1B\[1m { x: \[ { y: 5 } \], y: { z: { a: 3 } } }\x1B\[22m to match\x1B\[1m \/{"ab'} in \['"\] \\\/ \\\\\\\\\\\\\/\x1B\[22m/);
            expect(function() {
                expect(function() {
                    expect(new Error()).to.be.an.instanceof(TypeError);
                }).to.throw(/{"ab'} in ['"] \/ \\\\\\/);
            }).to.throw(/expected\x1B\[1m \[Function\]\x1B\[22m to throw error matching\x1B\[1m \/{"ab'} in \['"\] \\\/ \\\\\\\\\\\\\/\x1B\[22m but got\x1B\[1m 'expected\\u001b\[1m \[Error\]\\u001b\[22m to be an instance of TypeError'\x1B\[22m/);
        });
    });
});
