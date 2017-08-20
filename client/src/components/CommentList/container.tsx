import * as React from 'react';

import CommentContainer from './Comment/container';

import EditableCommentContainer from './EditableComment/container';
import { getJWT } from '../jwt';

import CommentList from './';

interface Props {
    name?: string;
    issue: number;
    Comments: Comment[] | JSX.Element[]
}

interface State {
    Comments: JSX.Element[] | Comment[];
}

/**
 * @prop - array of @see Comments
 */
export default class CommentListContainer extends React.Component<Props, State> {

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
    add(content: string) {

        const Comments = this.state.Comments.slice() as JSX.Element[];
        const jwt = getJWT();

        Comments.push(<CommentContainer
                        content={content}
                        authorid={jwt.id}
                        profileLink={jwt.email}
                        author="You"
                        id={new Date().toString() /* random temp id*/}
                      />);

        this.setState({
            Comments
        })
    }

    // Sometimes nextProps will be undefined, which in that case, don't want to set state
    componentWillReceiveProps(nextProps: Props) {

        if (nextProps.Comments) {

            this.setState({
                Comments: nextProps.Comments
            })
        }
    }

    shouldComponentUpdate(nextProps: Props, nextState: State) {

        return !!nextProps.Comments || nextState.Comments !== this.state.Comments;
    }

    render() {

        const Comments = [...this.state.Comments];
        const jwt = getJWT();

        if (jwt.level) {
            Comments.push(<EditableCommentContainer addToList={this.add} name={this.props.name as string} issue={this.props.issue} />);
        }


        return <CommentList Comments={Comments as any}/>
    }

}
