import assert = require('intern/chai!assert');
import dom = require('../../src/dom');
import registerSuite = require('intern!object');
import jsdom = require('dojo/has!host-node?../loadjsdom');

var hasDOM:boolean = typeof document !== 'undefined';
var useRoot = dom.useRoot;
var doc:Document;

registerSuite({
    name: 'useRoot',
    setup: function () {
        if (!hasDOM) {
            dom.setDoc(jsdom.jsdom('<html><body></body></html>'));
        }
        doc = dom.getDoc();
    },
    teardown: function () {
        dom.resetDoc();
    },
    'basic': function () {
        if (!hasDOM) {
            this.skip('Apparently jsdom doesn\'t behave in a broken way!');
        }
        var div = <HTMLElement>doc.body.appendChild(doc.createElement('div')),
            p = <HTMLElement>div.appendChild(doc.createElement('p')),
            qsa = div.querySelectorAll;
        p.appendChild(doc.createElement('span'));

        assert.equal(qsa.call(p, 'div span').length, 1);
        assert.equal(useRoot(p, 'div span', qsa).length, 0);
    },
    'with id': function () {
        var div = <HTMLElement>doc.body.appendChild(doc.createElement('div')),
            p = <HTMLElement>div.appendChild(doc.createElement('p')),
            qsa = div.querySelectorAll;

        p.appendChild(doc.createElement('span'));
        p.setAttribute('id', 'test_p');

        assert.equal(useRoot(p, 'div span', function (query:string) {
            assert.equal(p.id, 'test_p');
            return qsa.call(this, query);
        }).length, 0);
    },
    'without id': function () {
        var div = <HTMLElement>doc.body.appendChild(doc.createElement('div')),
            p = <HTMLElement>div.appendChild(doc.createElement('p')),
            qsa = div.querySelectorAll;

        p.appendChild(doc.createElement('span'));

        assert.strictEqual(p.id, '');

        assert.equal(useRoot(p, 'div span', function (query:string) {
            assert(p.id.length);
            return qsa.call(this, query);
        }).length, 0);

        assert.strictEqual(p.id, '');
    }
});
