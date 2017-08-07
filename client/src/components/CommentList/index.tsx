import * as React from 'react';

import './index.css';

interface Props {

    Comments: Array<JSX.Element | HTMLElement | Comment >;
}

export default function CommentList(props: Props) {


    return (
        <div id="comments">

        {
            props.Comments.map((comment, idx) =>
                React.cloneElement(comment as JSX.Element, {
                    key: idx,
                })
            )
        }
        </div>
    );

}
