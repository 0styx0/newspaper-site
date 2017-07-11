import React from 'react';
import commands from './execCommands.min.js'


/**
 * @prop content - html
 * @prop canEdit - boolean
 * @prop location - after this.props.children.props.children, where else to go until reach node that want to edit
 *
 * @return lets content be edited and renders a bar of buttons that can edit the html of props.content if props.canEdit = true
 */
class EditableHTML extends React.Component {

    constructor() {
        super();

        this.handleEdits = this.handleEdits.bind(this);

        this.state = {
            content: ""
        }
    }

    renderEditButtons() {

        if (this.props.canEdit) {
            return commands.map((command, idx) => <button key={idx} className={command.cmd} onClick={this.handleEdits}>{command.cmd}</button>);
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

        const content = React.cloneElement(this.props.kids.content, {contentEditable: this.props.canEdit});
        this.props.kids.content = content;
        const kids = Object.values(this.props.kids).map((elt, idx) => React.cloneElement(elt, {key: idx}));

        this.setState({content: kids});
    }

    render() {

        return (
            <div>
                <div id="buttonContainer">
                    {this.renderEditButtons()}
                </div>
                {this.state.content}
            </div>
        );
    }
}

export default EditableHTML;