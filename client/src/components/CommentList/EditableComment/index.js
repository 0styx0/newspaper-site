import React from 'react';
import PropTypes from 'prop-types';
import Editable from '../../Editable';

import {jwt} from '../../jwt';

import '../Comment/index.css';
import './index.css';


export default function EditableComment(props) {

    return <article id="reply" className="comment">
                <Editable
                    canEdit={!!jwt.id /*if logged in*/}
                    buttons="basic"
                    submit={props.onSubmit}
                    children={
                        <div
                            onBlur={props.onBlur}
                            className="content"
                        />
                    }
                />
            </article>
}


EditableComment.propTypes = {

    onSubmit: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired // use case: saving current progress when use clicks away (specifically, this event must fire when clicking submit, and the input event was too frequent for my taste)
}



