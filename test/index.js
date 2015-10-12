'use strict';

describe('what?', function () {
    var async = require('async');
    var util = require('lodash');
    var should = require('should');
    var LEGO = require('../index');
    var legoIt = LEGO.legoIt;
    var $ = LEGO.$;

    function asyncCallback(params, callback) {
        async.nextTick(function() {
            callback(null, params);
        });
    }

    var legoX, legoY, legoZ, legoF, legoE;

    before(function() {
        var functions = {
            a: function(params, callback) {
                asyncCallback('a', callback);
            },
            b: function(params, callback) {
                asyncCallback('b', callback);
            },
            c: function(params, callback) {
                asyncCallback('c', callback);
            },
            isUndefined: function(params, callback) {
                asyncCallback(undefined, callback);
            },
            isNull: function(params, callback) {
                asyncCallback(null, callback);
            },
            isTrue: function(params, callback) {
                asyncCallback(true, callback);
            },
            isFalse: function(params, callback) {
                asyncCallback(false, callback);
            },
            isArray: function(params, callback) {
                asyncCallback([1, 2, 3], callback);
            },
            isObject: function(params, callback) {
                asyncCallback({a: 1, b: 2}, callback);
            },
            isZero: function(params, callback) {
                asyncCallback(0, callback);
            },
            findError: function(params, callback) {
                callback(new Error('asd'));
            },
        };

        legoX = legoIt(functions);

        legoY = legoIt({
            target: 'hahaha',
        }, functions);

        legoZ = legoIt({
            target: 'hahaha',
            fields: {
                a: $.REQUIRED,
            },
        }, functions);

        legoF = legoIt({
            filter: function(value) {
                return value === null;
            },
        }, functions);

        legoE = legoIt({
            logger: function(){},
        }, functions);
    });

    it('should get only "a" and "c" properties and nothing else.', function(callback) {
        legoX({
            $target: {},
            $: {
                a: $.REQUIRED,
                c: $.REQUIRED,
            },
        }, function(err, result) {
            should.not.exist(err);
            util.keys(result).should.deepEqual(['a', 'c']);
            result.a.should.equal('a');
            result.c.should.equal('c');
            callback();
        });
    });

    it('legoX requires others fields, and undefined should be cleaned', function(callback) {
        legoX({
            $target: {},
            $: {
                a: $.REQUIRED,
                isUndefined: $.REQUIRED,
                isNull: $.REQUIRED,
                isTrue: $.REQUIRED,
                isFalse: $.REQUIRED,
                isArray: $.REQUIRED,
                isObject: $.REQUIRED,
                isZero: $.REQUIRED,
            },
        }, function(err, result) {
            should.not.exist(err);
            util.keys(result).should.deepEqual([
                'a', 'isNull', 'isTrue', 'isFalse', 'isArray', 'isObject', 'isZero',
            ]);
            result.a.should.equal('a');
            (result.isUndefined === undefined).should.be.true();
            should(result.isNull).equal(null);
            result.isTrue.should.equal(true);
            result.isFalse.should.equal(false);
            result.isArray.should.deepEqual([1, 2, 3]);
            result.isObject.should.deepEqual({a:1, b:2});
            result.isZero.should.equal(0);
            callback();
        });
    });

    it('legoF requires others fields, and undefined should be existed when using another filter.', function(callback) {
        legoF({
            $target: {},
            $: {
                a: $.REQUIRED,
                isUndefined: $.REQUIRED,
                isNull: $.REQUIRED,
                isTrue: $.REQUIRED,
                isFalse: $.REQUIRED,
                isArray: $.REQUIRED,
                isObject: $.REQUIRED,
                isZero: $.REQUIRED,
            },
        }, function(err, result) {
            should.not.exist(err);
            util.keys(result).should.deepEqual([
                'a', 'isUndefined', 'isTrue', 'isFalse', 'isArray', 'isObject', 'isZero',
            ]);
            result.a.should.equal('a');
            should(result.isUndefined).equal(undefined);
            (result.isNull === undefined).should.be.true();
            result.isTrue.should.equal(true);
            result.isFalse.should.equal(false);
            result.isArray.should.deepEqual([1, 2, 3]);
            result.isObject.should.deepEqual({a:1, b:2});
            result.isZero.should.equal(0);
            callback();
        });
    });

    it('tests legoY with options.target="hahaha" and a,b required', function(callback) {
        legoY({
            hahaha: {},
            $: {
                a: $.REQUIRED,
                b: $.REQUIRED,
            },
        }, function(err, result) {
            should.not.exist(err);
            util.keys(result).should.deepEqual(['a', 'b']);
            result.a.should.equal('a');
            result.b.should.equal('b');
            callback();
        });
    });

    it('tests the options.target="hahaha"', function(callback) {
        legoZ({
            hahaha: {},
        }, function(err, result) {
            should.not.exist(err);
            util.keys(result).should.deepEqual(['a']);
            result.a.should.equal('a');
            callback();
        });
    });

    it('legoZ should add "a" onto the source', function(callback) {
        var source = {};

        legoZ({
            hahaha: source,
        }, function(err, result) {
            should.not.exist(err);
            (result === source).should.be.true();
            util.keys(result).should.deepEqual(['a']);
            result.a.should.equal('a');
            callback();
        });
    });

    it('should return new object when the options.target="hahaha" and the input missing "hahaha"', function(callback) {
        var source = {};

        legoZ({
            target: source,
        }, function(err, result) {
            should.not.exist(err);
            (result === source).should.be.false();
            util.keys(result).should.deepEqual(['a']);
            result.a.should.equal('a');
            callback();
        });
    });

    it('legoZ.a should not exist when $.a is off', function(callback) {
        legoZ({
            hahaha: {},
            $: {
                a: $.OFF,
            }
        }, function(err, result) {
            should.not.exist(err);
            util.keys(result).should.deepEqual([]);
            callback();
        });
    });

    it('should callback an error, when findError is required', function(callback) {
        legoE({
            $: {
                findError: $.REQUIRED
            }
        }, function(err, result) {
            should.exist(err);
            should.not.exist(result);
            callback();
        });
    });

    it('should not callback an error, when findError is optional', function(callback) {
        legoE({
            $: {
                a: $.REQUIRED,
                findError: $.OPTIONAL,
            }
        }, function(err, result) {
            should.not.exist(err);
            util.keys(result).should.deepEqual(['a']);
            callback();
        });
    });

    it('neither callback an error, nor log any error, when findError is SKIP_ERROR', function(callback) {
        legoE({
            $: {
                a: $.REQUIRED,
                findError: $.SKIP_ERROR,
            }
        }, function(err, result) {
            should.not.exist(err);
            util.keys(result).should.deepEqual(['a']);
            callback();
        });
    });
});