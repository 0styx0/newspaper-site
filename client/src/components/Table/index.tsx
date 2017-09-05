import * as React from 'react';

import './index.css';

interface Props {
    headings: Array<Element | JSX.Element | string>;
    rows: any[][];
}


/**
 * @prop headings - array
 * @prop rows - 2d array where [row][tdText]
 */
function Table(props: Props) {

    return (
        <table>
            <thead>
                <tr>
                    {props.headings.map((text, idx) => <th key={idx}> {text && text[0] ?
                        // the toString is purely to satisfy typescript
                        text[0].toUpperCase() + text.toString().slice(1) : text}</th>)}
                </tr>
            </thead>
            <tbody>
                {props.rows.map((row, idx) =>
                    <tr key={idx}>
                        {row.map((cellText: Text | Element, tdIdx: number) => <td key={tdIdx}>{cellText}</td>)}
                    </tr>)}
            </tbody>
        </table>
    );
}

export default Table;
