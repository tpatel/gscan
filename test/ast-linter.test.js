const should = require('should');
const fs = require('fs');
const path = require('path');
const ASTLinter = require('../lib/ast-linter');
const linter = new ASTLinter();
const utils = require('./utils');

function getTemplate(name) {
    return fs.readFileSync(path.join(__dirname, 'fixtures', 'ast-linter', name), {encoding: 'utf8'});
}

let template;
describe('ast-linter', function () {
    describe('basic tests', function () {
        it('should\'t display errors for a simple template', function () {
            template = getTemplate('simple.hbs');
            const results = linter.verify({source: template, moduleId: 'simple.hbs'});
            should(results).have.length(0);
        });
    });

    describe('should satisfy the img_url rule', function () {
        before(function () {
            template = getTemplate('img-url-in-conditional.hbs');
        });

        it('should reject using img_url in a conditional', function () {
            const results = linter
                .verify({source: template, moduleId: 'simple.hbs'})
                .filter(error => error.rule === 'no-img-url-in-conditionals');
            should(results).have.length(1);
            should(results[0].line).eql(2);
            should(results[0].column).eql(0);
        });
    });

    describe('should satisfy the multi-param-conditional rule', function () {
        before(function () {
            template = getTemplate('multi-param-conditional.hbs');
        });

        it('should reject using multiple params in a conditional', function () {
            const results = linter
                .verify({source: template, moduleId: 'simple.hbs'})
                .filter(error => error.rule === 'no-multi-param-conditionals');
            should(results).have.length(1);
            should(results[0].line).eql(2);
            should(results[0].column).eql(0);
        });
    });

    describe.only('context extraction', function () {
        before(function () {
            template = `
            {{#select @custom.header "minimal" desc="x"}}a{{else select @custom.header "cover" desc="y"}}b{{else select @custom.header "banner"}}c{{else}}d{{/select}}
            {{> author}}
            `;
        });

        it('should extract helpers correctly', function () {
            const results = linter
                .getContext({source: template, moduleId: 'post.hbs'});

            console.log(results);
        });
    });
});
