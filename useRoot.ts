
var unionSplit:RegExp = /([^\s,](?:"(?:\\.|[^"])+"|'(?:\\.|[^'])+'|[^,])*)/g,
    uid:string = '__ur' + Math.floor(Math.random() * 100000000) + '__';

function useRoot(context:HTMLElement, query:string, method:Function):NodeList {
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

export = useRoot;
