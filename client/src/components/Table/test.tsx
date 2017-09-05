import * as React from 'react';
import * as renderer from 'react-test-renderer';
import Table from './';
import casual from '../../tests/casual.data';



describe('<Slideshow>', () => {

    describe('snapshots', () => {

        function snap(headings: any[], rows: any[][]) {

            const tree = renderer.create(
                <Table headings={headings} rows={rows} />
            ).toJSON();

            expect(tree).toMatchSnapshot();
        }

        it('renders correctly', () => {

            const headings = ['col1', 'col2'];

            const rows = [
                ['hi', 'bye'],
                ['yes', 'no'],
                ['short', 'tall']
            ];

            snap(headings, rows);
        });

    });
});