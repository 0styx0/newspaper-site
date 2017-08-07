import * as React from 'react';

import './index.css';

interface Props {
    lineContent: Array<string | JSX.Element>;
}

function Numberline(props: Props) {

    return <span id="issueRange">{props.lineContent}</span>;
}

export default Numberline;