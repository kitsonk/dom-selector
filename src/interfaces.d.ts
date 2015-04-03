
export interface INodeArray {
    [index: number]: Node|HTMLElement;
    select(...selectors: string[]): INodeArray;
}

export interface ISelectorObject {
    combinator?: string;
    typeName?: string;
    id?: string;
    classNames?: string[];
    attributes?: { [key: string]: string; };
    psuedoSelector?: string;
    psuedoSelectorArguments?: string;
}
