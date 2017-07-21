
import React from 'react';
import PropTypes from 'prop-types';
import Editable from '../../Editable';
import fetchFromApi from '../../../helpers/fetchFromApi';
import {jwt} from '../../jwt';

/**
 * @prop name
 * @prop issue
 * @prop addToList
 */
export default class EditableComment extends React.Component {

    constructor() {
        super();

        this.save = this.save.bind(this);

        this.state = {
            content: ''
        }
    }

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

        return <article id="reply" className="comment">
                    <Editable
                        canEdit={!!jwt.id /*if logged in*/}
                        buttons="basic"
                        submit={this.save}
                        children={
                            <div
                              onBlur={e => this.setState({content: e.target.innerHTML})}
                              className="content"
                            />
                        }
                    />
                </article>
    }

}

EditableComment.propTypes = {

    issue: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
}