import assert = require('intern/chai!assert');
import dom = require('../../src/dom');
import registerSuite = require('intern!object');
import jsdom = require('dojo/has!host-node?../loadjsdom');

var hasDOM:boolean = typeof document !== 'undefined';
var NodeArray = dom.NodeArray;
var doc:Document;

registerSuite({
    name: 'NodeArray',
    setup: function () {
        if (!hasDOM) {
            dom.setDoc(jsdom.jsdom('<html><body></body></html>'));
        }
        doc = dom.getDoc();
        while (doc.body.firstChild) {
    		doc.body.removeChild(doc.body.firstChild);
    	}
        doc.body.innerHTML = '<div><p><span></span></p><span></span></div><div><p><span></span></p></div><div></div>';
    },
    teardown: function () {
        dom.resetDoc();
    },
    'basic': function () {
        var nodeArray = new NodeArray();
        assert.equal(nodeArray.length, 0);
        nodeArray.push(doc.createElement('div'));
        nodeArray.push(doc.createElement('p'));
        assert.equal(nodeArray.length, 2);
    },
    'from()': function () {
        var div = doc.createElement('div'),
            p = doc.createElement('p'),
            span = doc.createElement('span');

        var nodeArray = NodeArray.from([ div, p, span ]);
        assert.equal(nodeArray.length, 3);
        assert.equal(nodeArray[0], div);
        assert.equal(nodeArray[1], p);
        assert.equal(nodeArray[2], span);
    },
    'select()': function () {
        var na = dom.select('div');
        assert.equal(na.length, 3);
        assert.equal(na.select('p').length, 2);
        assert.equal(na.select('span').length, 3);
        assert.equal(na.select('p').select('span').length, 2);
        assert.equal(na.select('p>span').length, 2);
        assert.equal(na.select().length, 0);
    }
})
