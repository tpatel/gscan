const Rule = require('./base');
const {getNodeName} = require('../helpers');
const {AST} = require('handlebars');

function indexOf(array, value) {
    for (let i = 0, len = array.length; i < len; i++) {
        if (array[i] === value) {
            return i;
        }
    }
    return -1;
}

function blockParamIndex(name, options) {
    for (
        let depth = 0, len = options.blockParams.length;
        depth < len;
        depth++
    ) {
        let blockParams = options.blockParams[depth],
            param = blockParams && indexOf(blockParams, name);
        if (blockParams && param >= 0) {
            return [depth, param];
        }
    }
}

function classifyNode(sexpr, options = {knownHelpers: [], knownHelpersOnly: false, blockParams: []}) {
    let isSimple = AST.helpers.simpleId(sexpr.path);

    let isBlockParam = isSimple && !!blockParamIndex(sexpr.path.parts[0], options);

    // a mustache is an eligible helper if:
    // * its id is simple (a single part, not `this` or `..`)
    let isHelper = !isBlockParam && AST.helpers.helperExpression(sexpr);

    // if a mustache is an eligible helper but not a definite
    // helper, it is ambiguous, and will be resolved in a later
    // pass or at runtime.
    let isEligible = !isBlockParam && (isHelper || isSimple);

    // if ambiguous, we can possibly resolve the ambiguity now
    // An eligible helper is one that does not have a complex path, i.e. `this.foo`, `../foo` etc.
    if (isEligible && !isHelper) {
        let name = sexpr.path.parts[0];
        if (options.knownHelpers[name]) {
            isHelper = true;
        } else if (options.knownHelpersOnly) {
            isEligible = false;
        }
    }

    if (isHelper) {
        return 'helper';
    } else if (isEligible) {
        return 'ambiguous';
    } else {
        return 'simple';
    }
}

module.exports = class ContextBuilder extends Rule {
    _gatherHelpers(node) {
        if (!this.scanner) {
            return;
        }

        // Don't provide knownHelpers to leave `ambiguous` nodes marked as `ambiguous`
        const type = classifyNode(node, {knownHelpers: [], blockParams:[]});
        const name = getNodeName(node);

        // helper nodes will break the rendering if there is no matching helper
        // ambiguous nodes simply won't appear if there is no matching helper and no matching context
        if (type === 'helper' || type === 'ambiguous') {
            this.scanner.context.helpers.push({
                name,
                type,
                location: node.loc
            });
        }
    }

    visitor() {
        return {
            BlockStatement: this._gatherHelpers.bind(this),
            SubExpression: this._gatherHelpers.bind(this),
            MustacheStatement: this._gatherHelpers.bind(this)
        };
    }
};
