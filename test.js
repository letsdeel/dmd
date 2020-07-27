'use strict';
const assert = require('assert');
const dmd = require('./');

describe('dmd', function () {
    it('parse', function () {
        assert.deepStrictEqual(
            dmd.parse(
                '<section id=first attr1=\'1\' attr2="2" readOnly><ul><li>1.1</li>This is a <b>test</b><br />With a new line</ul></section>'
            ),
            [
                {tag: 'section', attr: {id: 'first', attr1: '1', attr2: '2', readOnly: true}},
                {tag: 'ul', attr: {}},
                {tag: 'li', attr: {}},
                {text: '1.1'},
                {close: 'li'},
                {text: 'This is a '},
                {tag: 'b', attr: {}},
                {text: 'test'},
                {close: 'b'},
                {tag: 'br', attr: {}},
                {text: 'With a new line'},
                {close: 'ul'},
                {close: 'section'},
            ]
        );
    });
    it('html', function () {
        assert.equal(
            dmd.html('<section id=test><script src=test />Hello</section>'),
            '<section id="test">Hello</section>'
        );
    });
});
