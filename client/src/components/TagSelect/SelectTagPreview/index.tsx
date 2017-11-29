import * as React from 'react';
import { Redirect } from 'react-router';

import TagSelect from '../';

interface State {
    redirect: string;
}

export default class SelectTagPreview extends React.Component<{}, State> {

    constructor(props: {}) {
        super(props);

        this.state = {
            redirect: ''
        };

        this.onChange = this.onChange.bind(this);
    }

    /**
     * Redirects to /tag/tag_user_selected
     */
    onChange(event: Event) {

        this.setState({
            redirect: (event.target as HTMLSelectElement).value
        });
    }

    render() {

        return (
            <span key={this.state.redirect}>
                <TagSelect
                    tags={['Current Issue']}
                    props={{
                        defaultValue: this.state.redirect,
                        onInput: this.onChange
                    }}
                />
                {this.state.redirect ? <Redirect to={`/tag/${this.state.redirect}`} /> : ''}
            </span>
        );
    }
}
