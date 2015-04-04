import assert = require('intern/chai!assert');
import dom = require('../../src/dom');
import registerSuite = require('intern!object');

var selectorToObject = dom.selectorToObject,
    selectorObjectToString = dom.selectorObjectToString;

registerSuite({
    name: 'selectorConversion',
    'selectorToObject': function () {
        var obj = selectorToObject('> div#id.class.class2[attr="value"][attr2=\'value\']:nth-child(9)::after');
        assert.deepEqual(obj, {
            combinator: '>',
            typeName: 'div',
            id: 'id',
            classNames: [ 'class', 'class2' ],
            attributes: {
                attr: 'value',
                attr2: 'value'
            },
            psuedoClasses: {
                'nth-child': '9',
                after: null
            }
        });

        obj = selectorToObject('p');
        assert.deepEqual(obj, {
            typeName: 'p'
        });

        obj = selectorToObject('.class.class2.class3');
        assert.deepEqual(obj, {
            classNames: [ 'class', 'class2', 'class3' ]
        });
    },
    'selectorObjectToString': function () {
        var selector = selectorObjectToString({
            combinator: '>',
            typeName: 'div',
            id: 'id',
            classNames: [ 'class', 'class2' ],
            attributes: {
                attr: 'value',
                attr2: 'value'
            },
            psuedoClasses: {
                'nth-child': '9',
                after: null
            }
        });
        assert.strictEqual(selector, '> div#id.class.class2[attr="value"][attr2="value"]:nth-child(9):after');

        selector = selectorObjectToString({
            typeName: 'p'
        });
        assert.strictEqual(selector, 'p');

        selector = selectorObjectToString({
            classNames: [ 'class', 'class2', 'class3' ]
        });
        assert.strictEqual(selector, '.class.class2.class3');
    }
});
