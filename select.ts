import dom = require('./dom');
import NodeArray = require('./NodeArray');
import useRoot = require('./useRoot');

var slice = Array.prototype.slice,
    fastPathRE:RegExp = /^([\w]*)#([\w\-]+$)|^(\.)([\w\-\*]+$)|^(\w+$)/;

function select(root:Node|HTMLElement|Document, ...selectors:string[]):NodeArray;
function select(...selectors:string[]):NodeArray;
function select(...selectors:any[]):NodeArray {
    var doc:Document = dom.getDoc(),
        node:HTMLElement = <HTMLElement><Node>doc,
        selector:Node|HTMLElement|Document|string,
        fastPath:RegExpExecArray,
        fastPathResults:HTMLElement[],
        results:HTMLElement[] = [];

    function get(id:string):HTMLElement {
        return doc.getElementById(id);
    }

    function fastPathQuery(root:HTMLElement|Document, selectorMatch:string[]):HTMLElement[] {
        var parent:Node,
            found:HTMLElement;

        if (selectorMatch[2]) {
            /* Looks like we are selecting an ID */
            found = get(selectorMatch[2]);
            if (!found || (selectorMatch[1] && selectorMatch[1] !== found.tagName.toLowerCase())) {
                /* Either the ID wasn't found or was a tag qualified that didn't match */
                return [];
            }
            if (root !== doc) {
                /* There is a root element, let's make sure it is in the ancestry tree */
                parent = found;
                while (parent !== node) {
                    parent = parent.parentNode;
                    if (!parent) {
                        /* Ooops, silly person tried selecting an ID that isn't a descendent of the root */
                        return [];
                    }
                }
            }
            /* If there is part of the query we haven't resolved, then we need to send it back to select */
            return selectorMatch[3] ? slice.call(select(found, selectorMatch[3])) : [ found ];
        }
        if (selectorMatch[3] && 'getElementsByClassName' in root) {
            /* a .class selector */
            return slice.call(root.getElementsByClassName(selectorMatch[4]));
        }
        if (selectorMatch[5]) {
            /* a tag selector */
            return slice.call(root.getElementsByTagName(selectorMatch[5]));
        }
        return [];
    }

    for (var i = 0; i < selectors.length; i++) {
        selector = selectors[i];
        if ((typeof selector === 'object' && selector && 'nodeType' in selector) || !selector) {
            /* There is an argument that is the subject of subsequent queries */
            node = <HTMLElement>selector;
            continue;
        }
        if (!node) {
            /* There is no subject at the moment, so we keep consuming arguments */
            continue;
        }
        if (typeof selector === 'string') {
            fastPath = fastPathRE.exec(selector);
            if (fastPath) {
                /* It is quicker to not use qSA */
                fastPathResults = fastPathQuery(node, fastPath);
                if (fastPathResults.length) {
                    /* We have results */
                    results = results.concat(fastPathResults);
                }
            }
            else {
                /* qSA Should be Faster */
                if (node === <HTMLElement><Node>doc) {
                    /* This is a non-rooted query, so qSA by itself will work */
                    results = results.concat(slice.call(node.querySelectorAll(selector)));
                }
                else {
                    /* This is a rooted query, so we have to get qSA to behave logically */
                    results = results.concat(slice.call(useRoot(node, selector, node.querySelectorAll)));
                }
            }
        }
        else if(selector) {
            throw new TypeError('Invalid argument type of: "' + typeof selector + '"');
        }
    }
    return NodeArray.from(results);
}

export = select;
