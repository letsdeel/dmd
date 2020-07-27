'use strict';
const he = require('he');

module.exports.parse = (input) => {
    const data = [];
    while (input.length) {
        const close = input.match(/^<\/(\w+)>/);
        if (close) {
            data.push({close: close[1].toLowerCase()});
            input = input.substring(close[0].length);
            continue;
        }
        const tag = input.match(/^<([\w]+)([\s\S]*?)\/?>/);
        if (tag) {
            data.push({
                tag: tag[1].toLowerCase(),
                attr: [...tag[2].matchAll(/(\w+)(?:=(?:'([^']*)'|"([^"]*)"|(\S+)))?/gs)].reduce(
                    (attr, m) =>
                        Object.assign(attr, {
                            [m[1]]: [m[2], m[3], m[4], true].reduce((res, value) => {
                                if (res !== undefined) return res;
                                switch (typeof value) {
                                    case 'string':
                                        return he.decode(value, {isAttributeValue: true});
                                    case 'boolean':
                                        return value;
                                }
                            }, undefined),
                        }),
                    {}
                ),
            });
            input = input.substring(tag[0].length);
            continue;
        }
        const [text] = input.match(/^[^<]+/s) || [];
        if (!text) {
            const err = new Error('Input Error');
            err.input = input;
            throw err;
        }
        data.push({text: he.decode(text)});
        input = input.substring(text.length);
    }
    return data;
};

module.exports.html = (data) =>
    (typeof data == 'string' ? module.exports.parse(data) : data)
        .map((o) => {
            if (o.close) return `</${o.close}>`;
            if (o.text) return he.encode(o.text);
            if (!/^(?:[ou]l|li|h[1-6]|[biu]|br|section|img|table|t[rd]|placeholder)$/.test(String(o.tag))) return '';
            return `<${o.tag}${Object.entries(o.attr)
                .map(([key, value]) => (value === true ? ` ${key}` : ` ${key}="${he.encode(value)}"`))
                .join('')}>`;
        })
        .join('');
