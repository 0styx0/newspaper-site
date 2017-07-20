import React from 'react';
import commands from './execCommands.min.js'

import './index.css';

/**
 * @prop children - 1 elt to make editable
 * @prop canEdit - boolean
 * @prop buttons - if true (default), show all buttons. If "basic" show subset. If false, show none
 * @prop submit - runs when the submit button is clicked. If this is not given, nothing will happen when submit is clicked
 *
 * @return lets content be edited and renders a bar of buttons that can edit the html of props.children if props.canEdit = true
 */
class Editable extends React.Component {

    constructor() {
        super();

        this.handleEdits = this.handleEdits.bind(this);

        this.state = {
            content: ""
        }
    }

    renderEditButtons() {

        if (this.props.canEdit && this.props.buttons) {
            return (
                <div id={this.props.buttons === true ? "buttonContainer" : ""}>
                    {commands.map((command, idx) => {

                        if ((this.props.buttons === "basic" && command.basic) || this.props.buttons === true) {
                            return <button key={idx} className={command.cmd} onClick={this.handleEdits}>{command.cmd}</button>
                        }
                        return null;
                    })}

                    <br />
                    <button onClick={this.props.submit}>Submit</button>
                </div>
            );

        }
    }


    handleEdits(event) {

        if (event.target.classList.contains('hideFromPreview')) {
            return this.toggleClassOnElementSelected("previewHidden");
        }

        const value = event.target.className === "createLink" ?
                          prompt(`Insert where you would like to link to
                (make sure to include the https:// if linking to an outside site)`)
                                                              : null;

        document.execCommand(event.target.className, false, value);
    }

    /**
     * Adds a class to user-highlighted element
     *
     * @param className - name of class to add
     */
    toggleClassOnElementSelected(className) {

        const eltAnchor = window.getSelection().anchorNode;

        if (window.getSelection().anchorNode.children) { // if selected elt is an img
            window.getSelection().anchorNode.children[0].classList.toggle(className);
        }
        else {

            const eltToChange = (eltAnchor.nodeType === Node.TEXT_NODE) ? eltAnchor.parentNode : eltAnchor.lastElementChild;
            eltToChange.classList.toggle(className);
        }
    }


    componentWillMount() {

        const content = React.cloneElement(this.props.children, {contentEditable: this.props.canEdit});

        this.setState({content});
    }

    render() {

        return (
            <div>
                {this.renderEditButtons()}
                {this.state.content}
            </div>
        );
    }
}

Editable.defaultProps = {
    buttons: true
};

export default Editable;