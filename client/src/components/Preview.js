import React from 'react';

function Preview(props) {

    return (
        <div className="preview">
            <div className="content" dangerouslySetInnerHTML={{__html: props.lede}} />
            <a className="small" href={`/issue/${props.issue}/story/${props.url}`}>Read More</a>
            <span className="small"> ({props.views} views)</span>
        </div>
    )
}



export default Preview;