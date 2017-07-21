import React from 'react';
import PropTypes from 'prop-types'

import Editable from './';

/**
 * @prop
 * @prop canEdit - boolean
 * @prop buttons - if "all" (default), show all buttons. If "basic" show subset
 * @prop submit - runs when the submit button is clicked. If this is not given, nothing will happen when submit is clicked
 *
 * @return lets content be edited and renders a bar of buttons that can edit the html of props.children if props.canEdit = true
 */
class EditableContainer extends React.Component {

    constructor() {
        super();

        this.handleEdits = this.handleEdits.bind(this);
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


    render() {

        const content = React.cloneElement(this.props.children, {contentEditable: this.props.canEdit});

        if (!this.props.canEdit) {
            return <span />
        }

        return <Editable
                buttons={this.props.buttons}
                handleEdits={this.handleEdits}
                content={content}
                submit={this.props.submit}
               />
    }
}

EditableContainer.propTypes = {
    children: PropTypes.element.isRequired, //children - 1 elt to make editable
    canEdit: PropTypes.bool.isRequired,
    buttons: PropTypes.oneOf(["all", "basic", "none"]), // all buttons, or just a subset of them
    submit: PropTypes.func,
}

EditableContainer.defaultProps = {
    buttons: "all"
}


export default EditableContainer;