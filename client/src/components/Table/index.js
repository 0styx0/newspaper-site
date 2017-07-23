import React from 'react';
import PropTypes from 'prop-types';

import './index.css';

/**
 * @prop headings - array
 * @prop rows - 2d array where [row][tdText]
 */
function Table(props) {

    return (<table>
        <thead>
            <tr>
                {props.headings.map((text, idx) => <th key={idx}> {text && text[0] ? text[0].toUpperCase() + text.slice(1) : text}</th>)}
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

Table.propTypes = {
    headings: PropTypes.arrayOf(PropTypes.oneOfType([
                                    PropTypes.string,
                                    PropTypes.element
                                ])
                                ).isRequired, // th
    rows: PropTypes.arrayOf( // tr
        PropTypes.arrayOf(
                PropTypes.any
            )
        ).isRequired
}

export default Table;