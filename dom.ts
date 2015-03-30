import domSelector = require('./interfaces');

type DomTypes = Node|HTMLElement;

/* Document */
var _doc:Document = typeof document !== 'undefined' ? document : undefined;

export function getDoc():Document {
    return _doc;
}

export function setDoc(value:Document):void {
    _doc = value;
}

export function resetDoc():void {
    _doc = typeof document !== 'undefined' ? document : undefined;
}

/* Use Root */

var unionSplit:RegExp = /([^\s,](?:"(?:\\.|[^"])+"|'(?:\\.|[^'])+'|[^,])*)/g,
    uid:string = '__ur' + Math.floor(Math.random() * 100000000) + '__';

export function useRoot(context:HTMLElement, query:string, method:Function):NodeList {
    var oldContext:HTMLElement = context,
        oldId:string = context.getAttribute('id'),
        newId:string = oldId || uid,
        hasParent:boolean = Boolean(context.parentNode),
        relativeHierarchySelector:boolean = /^\s*[+~]/.test(query);

    if (relativeHierarchySelector && !hasParent) {
        return new NodeList();
    }
    if (!oldId) {
        context.setAttribute('id', newId);
    }
    else {
        newId = newId.replace(/'/g, '\\$&');
    }
    if (relativeHierarchySelector) {
        context = <HTMLElement>context.parentNode;
    }
    var selectors = query.match(unionSplit);
    for (var i = 0; i < selectors.length; i++) {
        selectors[i] = '[id="' + newId + '"] ' + selectors[i];
    }
    query = selectors.join(',');

    try {
        return method.call(context, query);
    }
    finally {
        if (!oldId) {
            oldContext.removeAttribute('id');
        }
    }
}

/* NodeArray */

var toStr:Function = Object.prototype.toString,
    maxSafeInteger:number = Math.pow(2, 53) - 1,
    hasOwnProperty = Object.prototype.hasOwnProperty;

function isCallable(fn:any):boolean {
    return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
}

function toInteger(value:any):number {
    var num = Number(value);
    if (isNaN(num)) { return 0; }
    if (num === 0 || !isFinite(num)) { return num; }
    return (num > 0 ? 1 : -1) * Math.floor(Math.abs(num));
}

function toLength(value:any):number {
    var len = toInteger(value);
    return Math.min(Math.max(len, 0), maxSafeInteger);
}

function getMaxIndexProperty(object:Object):number {
    var maxIndex:number = -1,
        isValidProperty:boolean;

    for (var prop in object) {
        isValidProperty = (String(toInteger(prop)) === prop && toInteger(prop) !== maxSafeInteger &&
            hasOwnProperty.call(object, prop));
        if (isValidProperty && prop > maxIndex) {
            maxIndex = prop;
        }
    }

    return maxIndex;
}

class ExtensionArray<T> {
    constructor() {
        Array.apply(this, arguments);
        return new Array();
    }
    pop():any { }
    push(val:T):number { return 0; }
    splice(start:number, deleteCount:number, ...items:any[]):any { }
    concat<U extends T[]>(...items: U[]): T[] { return []; }
    forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void { }
    length: number;
}

ExtensionArray['prototype'] = new Array();

export class NodeArray extends ExtensionArray<DomTypes> implements domSelector.INodeArray {
    [index:number]: DomTypes;
    private _length:number = 0;
    private _isMutating:boolean = false;
    get length():number {
        var maxIndexProperty:number = +getMaxIndexProperty(this);
        return Math.max(this._length, maxIndexProperty + 1);
    }
    set length(value: number) {
        var constrainedValue:number = toLength(value),
            currentLength:number = this.length;
        if (constrainedValue !== +value) {
            throw new RangeError();
        }
        if (!this._isMutating && constrainedValue < currentLength) {
            this._isMutating = true;
            this.splice(constrainedValue, currentLength - constrainedValue);
            this._isMutating = false;
        }
        this._length = constrainedValue;
    }

    static from(arrayLike:any, mapFn?:Function, thisArg?:Object):NodeArray {
        var C:Function = this,
            items = Object(arrayLike);

        if (arrayLike === null) {
            throw new TypeError('NodeArray.from requires an array-like object - not null or undefined');
        }

        var T:Object;
        if (typeof mapFn !== 'undefined') {
            if (!isCallable(mapFn)) {
                throw new TypeError('NodeArray.from: when provided, the second argument must be a function');
            }
            if (arguments.length > 2) {
                T = arguments[2];
            }
        }

        var len = toLength(items.length),
            NA:NodeArray = new NodeArray(len),
            k:number = 0,
            kValue:any;

        while (k < len) {
            kValue = items[k];
            if (mapFn) {
                NA[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
            }
            else {
                NA[k] = kValue;
            }
            k += 1;
        }
        NA.length = len;
        return NA;
    }

    constructor();
    constructor(length:number);
    constructor(...items:any[]) {
        super();
        var length:number = 0;
        if (items.length === 1 && typeof items[0] === 'number') {
            length = items[0];
        }
        else if (items.length > 1) {
            for (var i = 0; i < items.length; i++) {
                this[i] = items[i];
            }
            length = items.length;
        }
    }

    select(...selectors:string[]):NodeArray {
        var results:any[] = [];
        this.forEach(function (value: DomTypes, index: number, array: (DomTypes)[]) {
            var args:any[] = [ value ];
            args = args.concat(selectors);
            results = results.concat(select.apply(this, args));
        }, this)
        return NodeArray.from(results);
    }
}

/* select */

var slice = Array.prototype.slice,
    fastPathRE:RegExp = /^([\w]*)#([\w\-]+$)|^(\.)([\w\-\*]+$)|^(\w+$)/;

export function select(root:DomTypes|Document, ...selectors:string[]):NodeArray;
export function select(...selectors:string[]):NodeArray;
export function select(...selectors:any[]):NodeArray {
    var doc:Document = getDoc(),
        node:HTMLElement = <HTMLElement><Node>doc,
        selector:DomTypes|Document|string,
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
