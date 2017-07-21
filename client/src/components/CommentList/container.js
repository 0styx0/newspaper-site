import React from 'react';
import PropTypes from 'prop-types';

import CommentContainer from './Comment/container';
import Comment from './Comment';

import EditableCommentContainer from './EditableComment/container';
import {jwt} from '../jwt';

import CommentList from './';



/**
 * @prop - array of @see Comments
 */
export default class CommentListContainer extends React.Component {

    constructor() {
        super();

        ['add'].forEach(method => this[method] = this[method].bind(this));

        this.state = {
            Comments: []
        }

    }

    /**
     * @param content - html? string
     *
     * Rerenders CommentList with EditableComment changed to Comment, and pushes a new EditableComment to the list
     */
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

    // Sometimes nextProps will be undefined, which in that case, don't want to set state
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

        const Comments = [...this.state.Comments];

        if (jwt.level) {
            Comments.push(<EditableCommentContainer addToList={this.add} name={this.props.name} issue={this.props.issue} />);
        }


        return <CommentList Comments={Comments}/>
    }

}




CommentListContainer.PropTypes = {

    Comments: PropTypes.arrayOf(Comment)
}
