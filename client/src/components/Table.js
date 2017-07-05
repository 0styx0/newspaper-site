import React from 'react';


/**
 * @prop headings - array
 * @prop rows - 2d array where [row][tdText]
 */
function Table(props) {

    return (<table>
        <thead>
            <tr>
                {props.headings.map((text, idx) => <th key={idx}>{text}</th>)}
            </tr>
        </thead>
        <tbody>
            {props.rows.map((row, idx) =>
                <tr key={idx}>
                    {row.map((cellText, idx) => <td key={idx}>{cellText}</td>)}
                </tr>)}
        </tbody>
    </table>);
}

export default Table;