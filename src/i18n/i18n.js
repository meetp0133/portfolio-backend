const i18n = require('i18n');

i18n.configure({
    locales: ['en'],

    directory: __dirname + '/locales',

    defaultLocale: 'en',

    cookie: 'lang',
});

module.exports = function (req, res, next) {

    i18n.init(req, res);

    return next();
};
