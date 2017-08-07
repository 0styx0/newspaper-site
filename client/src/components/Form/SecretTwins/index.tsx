import * as React from 'react';

import './index.css';

interface Props {
    original: JSX.Element;
    mirror: Function;
    name: string; // for hidden "mirror" input
    value: string | number;
    className: string;
    props?: Object;
}

/**
 * @return div with a hidden input with @prop `mirror` going off every onChange event
 */
export default function SecretTwins(props: Props) {

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
