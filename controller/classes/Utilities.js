
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

    static setHeader(num, thing) {
        console.warn("BAD THING", num, thing);
    }
}