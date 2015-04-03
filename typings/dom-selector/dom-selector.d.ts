/// <reference path="../jsdom/jsdom.d.ts" />

declare module 'dojo/has!host-node?../loadjsdom' {
	import jsdom = require('jsdom');
	var jd: {
		jsdom(markup: string, config?: jsdom.Config): Document;
	}
	export = jd;
}

declare module 'dojo/node!../../node_modules/jsdom/lib/jsdom' {
	import jsdom = require('jsdom');
	var jd: {
		jsdom(markup: string, config?: jsdom.Config): Document;
	}
	export = jd;
}
