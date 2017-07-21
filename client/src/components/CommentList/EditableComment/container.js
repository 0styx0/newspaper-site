import React from 'react';
import PropTypes from 'prop-types';
import fetchFromApi from '../../../helpers/fetchFromApi';

import EditableComment from './';

export default class EditableCommentContainer extends React.Component {

    constructor() {
        super();

        this.save = this.save.bind(this);

        this.state = {
            content: ''
        }
    }

    /**
     * Sends comment to be saved to database
     */
    save() {

        this.props.addToList(this.state.content);

        const info = {
            issue: this.props.issue,
            url: this.props.name,
            content: this.state.content
        }

        fetchFromApi("comment", "post", info);
    }

    render() {

        return <EditableComment
                 onSubmit={this.save}
                 onBlur={e => this.setState({content: e.target.innerHTML})}
               />
    }

}


EditableCommentContainer.propTypes = {

    issue: PropTypes.string.isRequired, // issue of parent article
    name: PropTypes.string.isRequired, // name (url) of article (ex: name in http://localhost:3001/issue/1/story/name)
    addToList: PropTypes.func.isRequired // callback where content is passed into after user submits the comment
}