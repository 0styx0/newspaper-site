import * as React from 'react';

import Editable from './';

interface Props {
    children: Element | JSX.Element | HTMLElement; // children - 1 elt to make editable
    canEdit: boolean;
    buttons?: 'all' | 'basic' | 'none'; // all buttons, or just a subset of them
    submit?: Function;
}

/**
 * @prop
 * @prop canEdit - boolean
 * @prop buttons - if "all" (default), show all buttons. If "basic" show subset
 * @prop submit - runs when the submit button is clicked.
 *  If this is not given, nothing will happen when submit is clicked
 *
 * @return lets content be edited and renders a bar of buttons that can edit the html
 *  of props.children if props.canEdit = true
 */
class EditableContainer extends React.Component<Props, {}> {

    constructor() {
        super();

        this.handleEdits = this.handleEdits.bind(this);
    }

    handleEdits(event: Event) {

        const target = event.target as HTMLElement;

        if (target.classList.contains('hideFromPreview')) {
            return this.toggleClassOnElementSelected('previewHidden');
        }

        const value = target.className === 'createLink' ?
                          prompt(`Insert where you would like to link to
                (make sure to include the https:// if linking to an outside site)`)
                                                              : null;

        document.execCommand(target.className, false, value);
    }

    /**
     * Adds a class to user-highlighted element
     *
     * @param className - name of class to add
     */
    toggleClassOnElementSelected(className: string) {

        const eltAnchor = window.getSelection().anchorNode;

        if ((window.getSelection().anchorNode as Element).children) { // if selected elt is an img
            (window.getSelection().anchorNode as Element).children[0].classList.toggle(className);

        } else {

            const eltToChange = (eltAnchor.nodeType === Node.TEXT_NODE) ?
                                  eltAnchor.parentNode as Element :
                                  (eltAnchor as Element).lastElementChild;
            eltToChange!.classList.toggle(className);
        }
    }


    render(): JSX.Element {

        const content = React.cloneElement(this.props.children as JSX.Element, {contentEditable: this.props.canEdit});

        if (!this.props.canEdit) {
            return this.props.children as JSX.Element;
        }

        return (
            <Editable
                buttons={this.props.buttons || 'all'}
                handleEdits={this.handleEdits}
                content={content}
                submit={this.props.submit}
            />
        );
    }
}

export default EditableContainer;
