
export interface INodeArray {
    [index:number]: Node|HTMLElement;
    select(...selectors:string[]): INodeArray;
}
