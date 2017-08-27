import * as React from 'react';

import commands from './execCommands';
import './index.css';

interface Props {
    handleEdits: Function; // whenever a formatting button is clicked (bold, italic, etc)
    submit?: Function; // what to do when user wants to save the edit
    content: JSX.Element; // what element is being edited
    buttons: 'all' | 'basic' | 'none'; // all buttons, or just a subset of them
}

interface Command {
    basic?: boolean;
    cmd: string;
}

/**
 * @return an editable version of whatever element is passed as `content`
 */
function Editable(props: Props) {

    let buttons: JSX.Element | null = null;

    if (props.buttons !== 'none') {

        buttons = (
            <div id={props.buttons === 'all' ? 'buttonContainer' : ''}>
                {(commands as any as Command[]).map((command: Command, idx: number) => {

                    if (((props.buttons === 'basic' && command.basic) || props.buttons === 'all')
                        && document.queryCommandSupported(command.cmd)) {

                        return (
                            <button
                              key={idx}
                              className={command.cmd}
                              onClick={props.handleEdits as any}
                            >
                              {command.cmd}
                            </button>
                        );
                    }
                    return null;
                })}

                <br />
                <button onClick={props.submit as any}>Submit</button>
            </div>
        );
    }

    return (
        <div>
            {buttons}
            {props.content}
        </div>
        );
}

export default Editable;