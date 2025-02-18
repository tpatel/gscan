const debug = require('@tryghost/debug')('ghost-spec');

module.exports = {
    get: function get(key) {
        let [version] = key;

        if (version === 'v4') {
            version = 'canary';
        }

        debug('Checking against version: ', version);

        return require(`./${[version]}`);
    }
};
