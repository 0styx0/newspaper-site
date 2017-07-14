import React from 'react';
import A from './A';

function Preview(props) {

    return (
        <div className="preview">
            <div className="content" dangerouslySetInnerHTML={{__html: props.lede}} />
            <A
              props={{
                  className: "small"
              }}
              href={`/issue/${props.issue}/story/${props.url}`}
              text="Read More"
              router={props.router}
            />
            <span className="small"> ({props.views} views)</span>
        </div>
    )
}



export default Preview;