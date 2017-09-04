import * as React from 'react';

interface Props {
    onClick: Function;
    title: string; // what will be shown when revealHint is true
    revealHint: boolean; // show or not to show, that is the question
    children: JSX.Element;
}

/**
 * Appends a hint to props.children
 */
export default function Hint(props: Props) {

    return React.cloneElement(props.children, {
        children: props.children.props.children.concat([
            (
                <span>
                  <abbr onClick={props.onClick as any} title={props.title}>?</abbr>
                  {props.revealHint ? <div className="abbrMessage">{props.title}</div> : <span />}
                </span>
                )
        ])
    });
}
