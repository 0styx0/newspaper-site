
const Cookie = require('cookies');

module.exports = class Utilities {

    /**
      *
      * @return args which have been sanitized
      */
    static filter(...args) {

        const res = args.map(elt => {

            if (typeof elt == 'string') {
                return elt.replace(/[^\w\s,]/g, "")
            }
            return elt
        });

        return (args.length == 1) ? res[0] : res;
    }

    static setHeader(num = 200, thing = '', end = true) {

        Utilities.res.statusMessage = thing;
        Utilities.res.status(num);

        if (end) {
            Utilities.res.end();
        }
    }

    static setCookies(name, value, expires) {

        if (!Utilities.req || !Utilities.res) {
            Utilities.setHeader(500, 'cookie');
            return false;
        }

        const CookieInstance = new Cookie(Utilities.req, Utilities.res);
        CookieInstance.set(name, value, {/*signed: true,*/ overwrite: true})
    }

    static getCookies(name) {

        if (!Utilities.req || !Utilities.res) {
            Utilities.setHeader(500, 'cookie');
            return false;
        }

        const CookieInstance = new Cookie(Utilities.req, Utilities.res);
        return CookieInstance.get(name);
    }
}