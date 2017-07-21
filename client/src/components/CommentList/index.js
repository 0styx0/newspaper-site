import React from 'react';
import PropTypes from 'prop-types';




export default function CommentList(props) {


    return (
        <div id="comments">

        {
            props.Comments.map((comment, idx) =>
                React.cloneElement(comment, {
                    key: idx,
                })
            )
        }
        </div>
    );

}


CommentList.PropTypes = {

    Comments: PropTypes.arrayOf(Comment)
}