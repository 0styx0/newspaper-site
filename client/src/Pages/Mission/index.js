import React from 'react';
import EditableContainer from '../../components/Editable/container';
import {jwt} from '../../components/jwt';
import PropTypes from 'prop-types';

import './index.css';


export default function Mission(props) {

    return <EditableContainer
                key={props.content}
                canEdit={jwt.level > 2}
                submit={props.submit}
                children={<div
                            className="mission"
                            dangerouslySetInnerHTML={{__html: props.content}}
                            onBlur={props.save}
                            />}
            />
}

Mission.propTypes = {
    content: PropTypes.string.isRequired,
    submit: PropTypes.func.isRequired,
    save: PropTypes.func.isRequired
}
