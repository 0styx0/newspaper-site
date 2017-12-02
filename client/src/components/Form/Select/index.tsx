import * as React from 'react';
import Label from '../Label';
import { HTMLProps } from 'react';

interface Props {
    label: string;
    props: HTMLProps<HTMLSelectElement>; // really should be html attributes
}

/**
 * @prop label - string, contents of label element
 * @prop props - object of attributes of select
 */
export default function Select(props: Props) {

    const select = React.cloneElement(<select />, props.props);

    return (
        <Label
            value={props.label}
            required={!!props.props.required}
            children={
                select
            }
        />
    );
}
