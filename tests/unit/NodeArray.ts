import assert = require('intern/chai!assert');
import NodeArray = require('../../NodeArray');
import registerSuite = require('intern!object');

var hasDOM:boolean = typeof document !== 'undefined';

registerSuite({
    name: 'NodeArray',
    'basic': function () {
        if (!hasDOM) { this.skip('No DOM present'); }
        var nodeArray = new NodeArray();
        assert.equal(nodeArray.length, 0);
        nodeArray.push(document.createElement('div'));
        nodeArray.push(document.createElement('p'));
        assert.equal(nodeArray.length, 2);
    },
    '.from()': function () {
        if (!hasDOM) { this.skip('No DOM present'); }
        var div = document.createElement('div'),
            p = document.createElement('p'),
            span = document.createElement('span');

        var nodeArray = NodeArray.from([ div, p, span ]);
        assert.equal(nodeArray.length, 3);
        assert.equal(nodeArray[0], div);
        assert.equal(nodeArray[1], p);
        assert.equal(nodeArray[2], span);
    }
})
