import React from 'react';

import './index.css';

/**
 * @prop headings - array
 * @prop rows - 2d array where [row][tdText]
 */
class Table extends React.Component {

    render() {

        return (<table>
            <thead>
                <tr>
                    {this.props.headings.map((text, idx) => <th key={idx}> {text && text[0] ? text[0].toUpperCase() + text.slice(1) : text}</th>)}
                </tr>
            </thead>
            <tbody>
                {this.props.rows.map((row, idx) =>
                    <tr key={idx}>
                        {row.map((cellText, idx) => <td key={idx}>{cellText}</td>)}
                    </tr>)}
            </tbody>
        </table>);
    }
}

export default Table;