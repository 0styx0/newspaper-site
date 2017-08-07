
import * as Cookie from 'cookies';

export default class Utilities {

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

        Utilities.res.statusMessage = (thing) ? thing.split(" ")
                                           .map(word => word[0].toLocaleUpperCase() + word.substr(1))
                                           .join(" ")
                                           : null;
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
        // so can see cookie that is set before request is sent back with the set-cookie header
        Utilities[name] = value;

        const CookieInstance = new Cookie(Utilities.req, Utilities.res);
        CookieInstance.set(name, value, {/*signed: true,*/ overwrite: true})
    }

    static getCookies(name) {

        if (!Utilities.req || !Utilities.res) {
            Utilities.setHeader(500, 'cookie');
            return false;
        }

        const CookieInstance = new Cookie(Utilities.req, Utilities.res);
        return Utilities[name] || CookieInstance.get(name)
    }
}