'use strict';

var async = require('async');
var util = require('./util');

var LEGO = {
    target: '$target',
    filter: util.isUndefined,
    logger: console.log.bind(console),
    fieldCallback: function(err, params, callback) {
        var value = params.value;
        var field = params.field;

        if (err) {
            if (field === LEGO.$.OPTIONAL) {
                params.logger(err.stack || err.message);
                callback();
            } else if (field === LEGO.$.SKIP_ERROR) {
                callback();
            } else {
                callback(err);
            }
        } else {
            callback(null, value);
        }
    },
    setDefaultTarget: function(name) {
        LEGO.target = name;
    },
    setDefaultFilter: function(filter) {
        LEGO.filter = filter;
    },
    setDefaultLogger: function(logger) {
        LEGO.logger = logger;
    },
    setDefaultFieldCallback: function(fieldCallback) {
        LEGO.fieldCallback = fieldCallback;
    },

    legoIt: legoIt,

    $: {
        OFF: false,
        REQUIRED: true,
        // value must not be 0/null/undefined
        OPTIONAL: 1,
        SKIP_ERROR: 2,
    },
};

module.exports = exports = LEGO;

/**
 * Make Your LEGO! Just Do It!!
 *
 * the function return a lego function which you can use to assign any of its fields to a specific object.
 *
 * See examples at https://github.com/adoyle-h/lego-it/blob/develop/doc/example.md
 *
 * @param  {Object} [options]
 * @param  {Object} [options.fields={}]  set the default option of each field.
 *                                       the key is the name of field, and its value is one of `LEGO.$`.
 *
 * @param  {String} [options.target='$target']  assign fields to the target object.
 *                                              While calling the lego function without its "$target", the fields will be assigned to a new empty object.
 *
 * @param  {Function} [options.filter='lodash.isUndefined']  which should be like `function(value, key, array)`.
 *                                                           the function should return a boolean which determining to omit the key.
 *
 * @param  {Function} [options.logger=console.log.bind(console)]  for printing error when get an error from each fieldCallback.
 *
 * @param  {Fcuntion} [options.fieldCallback=LEGO.fieldCallback]  the function signature is `function(err, params, callback)`.
 *                                                                - `err` is the error which comes from the callback in the second parameter `functions`.
 *                                                                - `params` is an object have properties:
 *                                                                    - `value`: the value from the callback in the second parameter `functions`.
 *                                                                    - `field`: the name of a field
 *                                                                    - `logger`: the actual logger for printing error
 *                                                                - `callback` the signature is `function(err, value)`. It return the final result for target object.
 *
 * @param  {Object<key, Function>} functions  Each function should be this form: `function(params, callback)`.
 *                                            The first parameter is the first parameter of the lego function
 *
 * @return {Function}  a lego function, of which signature is `function(params, callback)`.
 * @method legoIt(options, functions)
 */
function legoIt(options, functions) {
    if (arguments.length === 1) {
        functions = options;
        options = {};
    }

    options = util.defaults({}, options, {
        fields: {},
        target: LEGO.target,
        filter: LEGO.filter,
        logger: LEGO.logger,
        fieldCallback: LEGO.fieldCallback,
    });

    function wrapTaskCallback(field, callback) {
        return function(err, value) {
            options.fieldCallback(err, {
                value: value,
                field: field,
                logger: options.logger,
            }, callback);
        };
    }

    function makeTask(func, params, field) {
        return function(callback) {
            func(params, wrapTaskCallback(field, callback));
        };
    }

    return function(params, callback) {
        if (util.isObject(params) === false) {
            return callback(new Error('params must be an object!'));
        }

        var fields = util.defaults({}, params.$, options.fields);
        var _params = util.omit(params, ['$']);
        _params.$ = fields;
        var target = params[options.target];
        var tasks = {};

        if (target && util.isObject(target) === false) {
            return callback(new Error('the target must be an object while current target is: ', JSON.stringify(target)));
        }
        target = target || {};

        util.each(fields, function(field, key) {
            if (!field) return undefined;
            if (!functions[key]) return undefined;

            tasks[key] = makeTask(functions[key], _params, field);
        });

        async.parallel(tasks, function(err, results) {
            if (err) return callback(err);

            results = util.omit(results, options.filter);
            util.extend(target, results);

            callback(null, target);
        });
    };
}
