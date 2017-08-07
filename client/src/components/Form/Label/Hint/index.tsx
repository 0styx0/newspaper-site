import * as React from 'react';

interface Props {
    onClick: Function;
    title: string; // what will be shown when revealHint is true
    revealHint: boolean; // show or not to show, that is the question
}

export default function Hint(props: Props) {

    return <span>
               <abbr onClick={props.onClick as any} title={props.title}>?</abbr>
               {props.revealHint ? <div className="abbrMessage">{props.title}</div> : <span />}
           </span>
}
