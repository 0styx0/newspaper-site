import toggler from './';
import * as casual from 'casual';

describe('#toggler', () => {

    it(`adds to Set if item isn't present`, () => {

        const value = casual.word;
        const set = new Set<string>();

        toggler(set, value);

        expect([...set]).toEqual([value]);
    });

    it('removes from Set if item is not present', () => {

        const value = casual.word;
        let set = new Set<string>();
        set.add(value);

        set = toggler(set, value);

        expect([...set]).toEqual([]);
    });
});
