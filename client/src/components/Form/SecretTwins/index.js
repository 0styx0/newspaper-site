import React from 'react';
import PropTypes from 'prop-types';

import './index.css';

/**
 * @return div with a hidden input with @prop `mirror` going off every onChange event
 */
export default function SecretTwins(props) {

        const original = React.cloneElement(props.original, {onChange: props.mirror});

        const originProps = props.original.props;

        const copy = <input
                        type="hidden"
                        name={props.name}
                        value={props.value || originProps.value}
                        formMethod={originProps.formMethod}
                        className={props.className}
                      />

        const copyWithCustom = React.cloneElement(copy, props.props);

        return (
            <div>
                {original}
                {copyWithCustom}
            </div>
        )
}

SecretTwins.propTypes = {
    original: PropTypes.element.isRequired,
    mirror: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired, // for hidden "mirror" input
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    className: PropTypes.string
}