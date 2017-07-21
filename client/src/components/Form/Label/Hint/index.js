import React from 'react';
import PropTypes from 'prop-types';


export default function Hint(props) {


    return <span>
               <abbr onClick={props.onClick} title={props.title}>?</abbr>
               {props.revealHint ? <div className="abbrMessage">{props.title}</div> : <span />}
           </span>
}

Hint.propTypes = {
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired, // what will be shown when revealHint is true
    revealHint: PropTypes.bool // show or not to show, that is the question
}