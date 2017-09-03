import * as React from 'react';
import Label from '../Label';
import './index.css';

interface Props {
    label: string;
    abbr?: string;
    // I can't find a way to just say that html attributes should be accepted
    props: Object;
}

/**
 * @prop label, required, name, children - @see Select
 * @prop abbr - optional text for abbr elt if want to give user a hint about the input
 * @prop props - json of any native attr wanted
 *
 * @return input elt wrapped in a @see Label
 */
export default function Input(props: Props) {

    const input = React.cloneElement(<input />, props.props);

    return (
        <Label
            value={props.label}
            required={!!props.props.required}
            abbr={props.abbr}
            children={
                input
            }
        />
    );
}
