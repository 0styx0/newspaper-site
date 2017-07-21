import React from 'react';
import PropTypes from 'prop-types';

import Comment from './Comment';
import EditableComment from './EditableComment';
import {jwt} from '../jwt';

import './index.css';

/**
 * Plan:
 *
 * Each individual Comment has control over its own deletion, creation
 *
 * This component is in change of adding/removing components from the list after they are created
 *
 * This also will put an editable comment at the bottom if a user is logged in
 */


/**
 * @prop - array of @see Comments
 */
export default class CommentList extends React.Component {

    constructor() {
        super();

        ['add'].forEach(method => this[method] = this[method].bind(this));

        this.state = {
            Comments: []
        }

    }

    add(content) {

        const Comments = this.state.Comments.slice();

        Comments.push(<Comment
                        content={content}
                        authorid={jwt.id}
                        profileLink={jwt.email}
                        author="You"
                      />);

        this.setState({
            Comments
        })
    }

    componentWillReceiveProps(nextProps) {

        if (nextProps.Comments) {

            this.setState({
                Comments: nextProps.Comments
            })
        }
    }

    shouldComponentUpdate(nextProps, nextState) {

        return !!nextProps.Comments || nextState.Comments !== this.state.Comments;
    }

    render() {

        const Comments = this.state.Comments.length === 0 ? [] : [...this.state.Comments];

        if (jwt.level) {
            Comments.push(<EditableComment addToList={this.add} name={this.props.name} issue={this.props.issue} />);
        }


        return (

            <div id="comments">

            {
                Comments.map((comment, idx) => {
                    return React.cloneElement(comment, {
                        key: idx,
                    })
                })
            }
            </div>
        )

    }

}




CommentList.PropTypes = {

    Comments: PropTypes.arrayOf(Comment)

}