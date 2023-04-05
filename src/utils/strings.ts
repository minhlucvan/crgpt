function indexProp(obj: Record<string, any>, is: string | string[], value?: any): any {
    if (!Array.isArray(is)) {
        is = is.split(".");
    }
    if (is.length === 1 && value !== undefined) {
        obj[is[0]] = value;
        return obj;
    } else if (is.length === 0) {
        return obj;
    } else {
        return indexProp(obj[is[0]], is.slice(1), value);
    }
}

function parseStringTemplate(str: string, obj: Record<string, any>): string {
    const re = /\$\{([^{}]+)\}/g;
    return str.replace(re, (match, name) => {
        try {
            return indexProp(obj, name.trim());
        } catch (e) {
            return "";
        }
    });
}
