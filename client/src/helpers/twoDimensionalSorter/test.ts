import twoDimensionalSorter from './';

describe('#twoDimensionalSorter', () => {

    it('sorts numbers', () => {

        const initial = [[1, 4, 1], [4, 5, 0]];
        const expected = [[4, 5, 0], [1, 4, 1]]; // since initial[0][2] = 0, but initial[1][2] = 1

        expect(twoDimensionalSorter(initial, 2)).toEqual(expected);
    });

    it('sorts strings', () => {

        const initial = [['zzz', 'aaa'], ['bbb', 'ccc']];
        const expected = [['bbb', 'ccc'], ['zzz', 'aaa']];

        expect(twoDimensionalSorter(initial, 0)).toEqual(expected);

    });

    it('sorts numbers and strings', () => {

        const initial = [['bbb', 'aaa', 5], ['aaa', 99, 'bbb']];
        const expected = [['aaa', 99, 'bbb' ], ['bbb', 'aaa', 5 ]];

        expect(twoDimensionalSorter(initial, 1)).toEqual(expected);
    });

    it('can sort objects', () => {

        const initial = [
            {
                test: 99,
                apple: 'seed'
            },
            {
                random: [],
                test: 4
            }
        ];

        const expected = [
            {
                random: [],
                test: 4
            },
            {
                test: 99,
                apple: 'seed'
            }
        ];

        expect(twoDimensionalSorter(initial, 'test')).toEqual(expected);
    });
});

