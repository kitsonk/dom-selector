import assert = require('intern/chai!assert');
import select = require('../../select');
import dom = require('../../dom');
import registerSuite = require('intern!object');
import jsdom = require('dojo/has!host-node?../loadjsdom');

var hasDOM:boolean = typeof document !== 'undefined';

if (!hasDOM) {
	dom.setDoc(jsdom.jsdom('<html><body></body></html>'));
}

var doc:Document;

function get(id:string):HTMLElement {
	return doc.getElementById(id);
}

function emptyDom(root?:HTMLElement) {
	root = root || doc.body;
	while (root.firstChild) {
		root.removeChild(root.firstChild);
	}
	return root;
}

function setQueryTestDom(root?:HTMLElement) {
	root = root || doc.body;
	root.className = 'upperclass';
	root.innerHTML = '		<h1>Testing dom-selector/select</h1>' +
		'		<p>Something</p>' +
		'		<div id="t" class="lowerclass">' +
		'			<h3>h3 <span>span</span> endh3 </h3>' +
		'			<!-- comment to throw things off -->' +
		'			<div class="foo bar" id="_foo">' +
		'				<h3>h3</h3>' +
		'				<span id="foo"></span>' +
		'				<span></span>' +
		'			</div>' +
		'			<h3>h3</h3>' +
		'			<h3 class="baz foobar" title="thud">h3</h3>' +
		'			<span class="fooBar baz foo"></span>' +
		'			<span foo="bar"></span>' +
		'			<span foo="baz bar thud"></span>' +
		'			<!-- FIXME: should foo="bar-baz-thud" match? [foo$=thud] ??? -->' +
		'			<span foo="bar-baz-thudish" id="silly:id::with:colons"></span>' +
		'			<div id="container">' +
		'				<div id="child1" qux="true"></div>' +
		'				<div id="child2"></div>' +
		'				<div id="child3" qux="true"></div>' +
		'			</div>' +
		'			<div id="silly~id" qux="true"></div>' +
		'			<input id="notbug" name="bug" type="hidden" value="failed"> ' +
		'			<input id="bug" type="hidden" value="passed"> ' +
		'		</div>' +
		'		<div id="t2" class="lowerclass">' +
		'			<input type="checkbox" name="checkbox1" id="checkbox1" value="foo">' +
		'			<input type="checkbox" name="checkbox2" id="checkbox2" value="bar" checked>' +
		'			<input type="radio" disabled="true" name="radio" id="radio1" value="thinger">' +
		'			<input type="radio" name="radio" id="radio2" value="stuff" checked>' +
		'			<input type="radio" name="radio" id="radio3" value="blah">' +
		'		</div>' +
		'		<select id="t2select" multiple="multiple">' +
		'			<option>0</option>' +
		'			<option selected="selected">1</option>' +
		'			<option selected="selected">2</option>' +
		'		</select>' +
		'		<div id="t4">' +
		'			<div id="one" class="subDiv">' +
		'				<p class="one subP"><a class="subA">one</a></p>' +
		'				<div id="two" class="subDiv">' +
		'					<p class="two subP"><a class="subA">two</a></p>' +
		'				</div>' +
		'			</div>' +
		'		</div>' +
		'		<section></section>' +
		'		<div id="other">' +
		'		  <div id="abc55555"></div>' +
		'		  <div id="abd55555efg"></div>' +
		'		  <div id="55555abc"></div>' +
		'		  <div id="1"></div>' +
		'		  <div id="2c"></div>' +
		'		  <div id="3ch"></div>' +
		'		  <div id="4chr"></div>' +
		'		  <div id="5char"></div>' +
		'		  <div id="6chars"></div>' +
		'		</div>' +
		'		<div id="attrSpecialChars">' +
		'			<select name="special">' +
		'				<!-- tests for special characters in attribute values (characters that are part of query' +
		'syntax) -->' +
		'				<option value="a+b">1</option>' +
		'				<option value="a~b">2</option>' +
		'				<option value="a^b">3</option>' +
		'				<option value="a,b">4</option>' +
		'			</select>' +
		'			<!-- tests for quotes in attribute values -->' +
		'			<a href="foo=bar">hi</a>' +
		'			<!-- tests for brackets in attribute values -->' +
		'			<input name="data[foo][bar]">' +
		'			<!-- attribute name with a dot, goes down separate code path -->' +
		'			<input name="foo[0].bar">' +
		'			<input name="test[0]">' +
		'		</div>';
}

registerSuite({
    name: 'select',
    'basic': function () {
		doc = dom.getDoc();
		emptyDom();
		setQueryTestDom();
		assert.equal(4, select('h3').length, 'select("h3")');
		assert.equal(1, select('#t').length, 'select("#t")');
		assert.equal(1, select('#bug').length, 'select("#bug")');
		assert.equal(4, select('#t h3').length, 'select("#t h3")');
		assert.equal(1, select('div#t').length, 'select("div#t")');
		assert.equal(4, select('div#t h3').length, 'select("div#t h3")');
		assert.equal(0, select('span#t').length, 'select("span#t")');
		assert.equal(0, select('.bogus').length, 'select(".bogus")');
		assert.equal(0, select(get('container'), '.bogus').length, 'select(container, ".bogus")');
		assert.equal(0, select('#bogus').length, 'select("#bogus")');
		assert.equal(0, select(get('container'), '#bogus').length, 'select(container, "#bogus")');
		assert.equal(1, select('#t div > h3').length, 'select("#t div > h3")');
		assert.equal(2, select('.foo').length, 'select(".foo")');
		assert.equal(1, select('.foo.bar').length, 'select(".foo.bar")');
		assert.equal(2, select('.baz').length, 'select(".baz")');
		assert.equal(3, select('#t > h3').length, 'select("#t > h3")');
		assert.equal(1, select('section').length, 'select("section")');
		assert.equal(0, select(null).length, 'select(null)');
    },
	'syntatic equivilents': function () {
		assert.equal(12, select('#t > *').length, 'select("#t > *")');
		assert.equal(3, select('.foo > *').length, 'select(".foo > *")');
	},
	'rooted selections': function () {
		var container = get('container'),
			t = get('t');
		assert.equal(3, select(container, '> *').length, 'select(container, "> *")');
		assert.equal(3, select(container, '> *, > h3').length, 'select(container, "> *"');
		assert.equal(3, select(t, '> h3').length, 'select(t, "> h3")');
	},
	'compound selections': function () {
		assert.equal(2, select('.foo, .bar').length, 'select(".foo, .bar")');
		assert.equal(2, select('.foo,.bar').length, 'select(".foo,.bar")');
		assert.equal(2, select('#baz,#foo,#t').length, 'select("#baz,#foo,#t")');
		assert.equal(2, select('#foo,#baz,#t').length, 'select("#foo,#baz,#t")');
	},
	'multiple class attributes': function () {
		assert.equal(1, select('.foo.bar').length, 'select(".foo.bar")');
		assert.equal(2, select('.foo').length, 'select(".foo")');
		assert.equal(2, select('.baz').length, 'select(".bar")');
	},
	'case sensitivity': function () {
		assert.equal(1, select('span.baz').length, 'select("span.baz")');
		assert.equal(1, select('sPaN.baz').length, 'select("sPaN.baz")');
		assert.equal(1, select('SPAN.baz').length, 'select("SPAN.baz")');
		assert.equal(1, select('.fooBar').length, 'select(".fooBar")');
	},
	'attribute selectors': function () {
		assert.equal(3, select('[foo]').length, 'select("[foo]")');
		assert.equal(1, select('[foo$="thud"]').length, 'select(\'[foo$="thud"]\')');
		assert.equal(1, select('[foo$=thud]').length, 'select(\'[foo$=thud]\')');
		assert.equal(1, select('[foo$="thudish"]').length, 'select(\'[foo$="thudish"]\')');
		assert.equal(1, select('#t [foo$=thud]').length, 'select("#t [foo$=thud]")');
		assert.equal(1, select('#t [title$=thud]').length);
		assert.equal(0, select('#t span[title$=thud ]').length);
		assert.equal(1, select('[id$=\'55555\']').length);
		assert.equal(2, select('[foo~="bar"]').length);
		assert.equal(2, select('[ foo ~= "bar" ]').length);
		assert.equal(2, select('[foo|="bar"]').length);
		assert.equal(1, select('[foo|="bar-baz"]').length);
		assert.equal(0, select('[foo|="baz"]').length);
	},
	'descendent selectors': function () {
		var container = get('container');
		assert.equal(3, select(container, '> *').length, 'select(container, "> *")');
		assert.equal(2, select(container, '> [qux]').length, 'select(container, "> [qux]")');
		assert.equal('child1', (<any>select(container, '> [qux]')[0])['id'], 'select(container, "> [qux]")[0]');
		assert.equal('child3', (<any>select(container, '> [qux]')[1])['id'], 'select(container, "> [qux]")[1]');
		assert.equal(3, select(container, '> *').length, 'select(container, "> *")');
		assert.equal(3, select(container, '>*').length, 'select(container, ">*")');
		assert.equal('passed', (<any>select('#bug')[0])['value'], 'select("#bug")[0].value');
	},
	'complex node structures': function () {
		var t4 = get('t4');
		assert.equal(2, select(t4, 'a').length);
		assert.equal(2, select(t4, 'p a').length);
		assert.equal(2, select(t4, 'div p').length);
		assert.equal(2, select(t4, 'div p a').length);
		assert.equal(2, select(t4, '.subA').length);
		assert.equal(2, select(t4, '.subP .subA').length);
		assert.equal(2, select(t4, '.subDiv .subP').length);
		assert.equal(2, select(t4, '.subDiv .subP .subA').length);
	},
	'failed scope arg': function () {
		var thinger = get('thinger');
		assert.equal(0, select(thinger, '*').length, 'select(thinger, "*")');
		assert.equal(0, select('div#foo').length, 'select("div#foo")');
	},
	'selector engine regressions': function () {
		// These were additional regression tests for Dojo 1.X
		var attrSpecialChars = get('attrSpecialChars');
		assert.equal(1, select(attrSpecialChars, 'option[value="a+b"]').length);
		assert.equal(1, select(attrSpecialChars, 'option[value="a~b"]').length);
		assert.equal(1, select(attrSpecialChars, 'option[value="a^b"]').length);
		assert.equal(1, select(attrSpecialChars, 'option[value="a,b"]').length);
		assert.equal(1, select(attrSpecialChars, 'a[href*=\'foo=bar\']', 'attrSpecialChars').length);
		assert.equal(1, select(attrSpecialChars, 'input[name="data[foo][bar]"]').length);
		assert.equal(1, select(attrSpecialChars, 'input[name="foo[0].bar"]').length);
		assert.equal(1, select(attrSpecialChars, 'input[name="test[0]"]').length);
		// escaping special characters with backslashes (http://www.w3.org/TR/CSS21/syndata.html#characters)
		// selector with substring that contains brackets (bug 9193, 11189, 13084)
		assert.equal(1, select(attrSpecialChars, 'input[name=data\\[foo\\]\\[bar\\]]').length);
		assert.equal(1, select(attrSpecialChars, 'input[name=foo\\[0\\]\\.bar]').length);
	},
	'silly ids': function () {
		assert(get('silly:id::with:colons'), 'get("silly:id::with:colons")');
		assert.equal(1, select('#silly\\:id\\:\\:with\\:colons').length, 'select("#silly\\:id\\:\\:with\\:colons")');
		assert.equal(1, select('#silly\\~id').length, 'select("#silly\\~id")');
	},
	'css 2.1': function () {
		// first-child
		assert.equal(1, select('h1:first-child').length);
		assert.equal(2, select('h3:first-child').length);

		// + sibling selector
		assert.equal(1, select('.foo+ span').length);
		assert.equal(1, select('.foo+span').length);
		assert.equal(1, select('.foo +span').length);
		assert.equal(1, select('.foo + span').length);
	},
	'css 3': function () {
		// sub-selector parsing
		assert.equal(1, select('#t span.foo:not(:first-child)').length);

		// ~ sibling selector
		assert.equal(4, select('.foo~ span').length);
		assert.equal(4, select('.foo~span').length);
		assert.equal(4, select('.foo ~span').length);
		assert.equal(4, select('.foo ~ span').length);
		assert.equal(1, select('#foo~ *').length);
		assert.equal(1, select('#foo ~*').length);
		assert.equal(1, select('#foo ~*').length);
		assert.equal(1, select('#foo ~ *').length);

		// nth-child tests
		assert.equal(2, select('#t > h3:nth-child(odd)').length);
		assert.equal(3, select('#t h3:nth-child(odd)').length);
		assert.equal(3, select('#t h3:nth-child(2n+1)').length);
		assert.equal(1, select('#t h3:nth-child(even)').length);
		assert.equal(1, select('#t h3:nth-child(2n)').length);
		assert.equal(1, select('#t h3:nth-child(2n+3)').length);
		assert.equal(2, select('#t h3:nth-child(1)').length);
		assert.equal(1, select('#t > h3:nth-child(1)').length);
		assert.equal(3, select('#t :nth-child(3)').length);
		assert.equal(0, select('#t > div:nth-child(1)').length);
		assert.equal(7, select('#t span').length);
		assert.equal(3, select('#t > *:nth-child(n+10)').length);
		assert.equal(1, select('#t > *:nth-child(n+12)').length);
		assert.equal(10, select('#t > *:nth-child(-n+10)').length);
		assert.equal(5, select('#t > *:nth-child(-2n+10)').length);
		assert.equal(6, select('#t > *:nth-child(2n+2)').length);
		assert.equal(5, select('#t > *:nth-child(2n+4)').length);
		assert.equal(5, select('#t > *:nth-child(2n+4)').length);
		assert.equal(5, select('#t> *:nth-child(2n+4)').length);
		assert.equal(12, select('#t > *:nth-child(n-5)').length);
		assert.equal(12, select('#t >*:nth-child(n-5)').length);
		assert.equal(6, select('#t > *:nth-child(2n-5)').length);
		assert.equal(6, select('#t>*:nth-child(2n-5)').length);
		assert.strictEqual(get('_foo'), select('.foo:nth-child(2)')[0]);
		// currently don't have the same head structure as the original Dojo 1.x tests...
		// assert.strictEqual(select('style')[0], select(':nth-child(2)')[0]);

		// :checked pseudo-selector
		assert.equal(2, select('#t2 > :checked').length);
		assert.strictEqual(get('checkbox2'), select('#t2 > input[type=checkbox]:checked')[0]);
		assert.strictEqual(get('radio2'), select('#t2 > input[type=radio]:checked')[0]);
		// This :checked selector is only defined for elements that have the checked property, option elements are
		// not specified by the spec (http://www.w3.org/TR/css3-selectors/#checked) and not universally supported
		//assert.equal(2, select('#t2select option:checked').length);

		assert.equal(1, select('#radio1:disabled').length);
		assert.equal(0, select('#radio1:enabled').length);
		assert.equal(0, select('#radio2:disabled').length);
		assert.equal(1, select('#radio2:enabled').length);

		// :empty pseudo-selector
		assert.equal(4, select('#t > span:empty').length);
		assert.equal(6, select('#t span:empty').length);
		assert.equal(0, select('h3 span:empty').length);
		assert.equal(1, select('h3 :not(:empty)').length);
	}
});
