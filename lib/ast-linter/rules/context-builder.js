const Rule = require('./base');
const {getNodeName, logNode} = require('../helpers');

module.exports = class ContextBuilder extends Rule {
    _gatherHelpers(node) {
        if(!this.scanner) return;

        const nodeName = getNodeName(node);
        this.scanner.context.helpers.push({
            node: nodeName,
            type: node.type,
            loc: node.loc,
            parameters: node.params?.map(p => p.original),
        });
    }

    _gatherPartials(node) {
        if(!this.scanner) return;

        console.log(node)
        const nodeName = getNodeName(node);
        this.scanner.context.partials.push({
            node: nodeName,
            type: node.type,
            loc: node.loc,
            parameters: node.params?.map(p => p.original),
        });
    }

    visitor() {
        return {
            BlockStatement: this._gatherHelpers.bind(this),
            MustacheStatement: this._gatherHelpers.bind(this),
            PartialStatement: this._gatherPartials.bind(this),
            PartialBlockStatement: this._gatherPartials.bind(this),
        };
    }
};
