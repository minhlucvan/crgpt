function indexProp(obj: Record<string, any>, is: any, value?: any): any {
    if (typeof is == "string") is = is.split(".");
    if (is.length == 1 && value !== undefined) return (obj[is[0]] = value);
    else if (is.length == 0) return obj;
    else return indexProp(obj[is[0]], is.slice(1), value);
}

export function parseStringTemplate(
    str: string,
    obj: Record<string, any>
): string {
    return str.replace(/\$\{.+?\}/g, (match) => {
        return indexProp(obj, match);
    });
}
