import React from 'react';
import PropTypes from 'prop-types'

import commands from './execCommands.min.js'
import './index.css';



/**
 * @return an editable version of whatever element is passed as `content`
 */
function Editable(props) {

    return (
        <div>
            <div id={props.buttons === "all" ? "buttonContainer" : ""}>
                {commands.map((command, idx) => {

                    if (((props.buttons === "basic" && command.basic) || props.buttons === "all")
                        && document.queryCommandSupported(command.cmd)) {

                        return <button key={idx} className={command.cmd} onClick={props.handleEdits}>{command.cmd}</button>
                    }
                    return null;
                })}

                <br />
                <button onClick={props.submit}>Submit</button>
            </div>
            {props.content}
        </div>
        );
}

Editable.propTypes = {
    handleEdits: PropTypes.func.isRequired, // whenever a formatting button is clicked (bold, italic, etc)
    submit: PropTypes.func, // what to do when user wants to save the edit
    content: PropTypes.element.isRequired, // what element is being edited
    buttons: PropTypes.oneOf(["all", "basic", "none"]) // all buttons, or just a subset of them
}

Editable.defaultProps = {
    buttons: "all"
};

export default Editable;