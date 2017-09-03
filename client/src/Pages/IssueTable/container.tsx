import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { IssueQuery, IssueUpdate } from '../../graphql/issues';
import { Issue } from './interface.shared';
import IssueTable from './';

interface State {
    privateIssue: { // admins can change these (until public is true)
        public?: boolean;
        name?: string;
    };
    loaded: boolean;
}

interface Props {
    data: {
        loading: boolean;
        issues: Issue[]
    };
    mutate: Function;
}

/**
 * Creates a table of issues, in descending order with info of
 * number, name, datePublished, and views (sum of views of all articles in the issue)
 *
 * If user is admin (lvl 3) and issue is not public, user can change issue name and make it public.
 * In that case, @see IssueTable.allowEditsOfLastIssue for difference in UI
 */
export class IssueTableContainer extends React.Component<Props, State> {

    constructor() {
        super();

        this.onChangeIssueInfo = this.onChangeIssueInfo.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            privateIssue: {},
            loaded: false
        };
    }

    /**
     * When graphql gets data from @see graphql/issues,
     * this turns it into 2d array of what will be table rows and saves it to state.issueInfo
     *
     * If current user is an admin, enables editing of most recent, unpublished issue @see this.allowEditsOfLastIssue
     */
    componentWillReceiveProps(props: Props) {

        if (!props.data.issues || this.props.data.issues.length > 0) {
            return;
        }

        this.setState({loaded: true});
    }

    /**
     * @param e {HTMLInputElement event}
     *
     * Adds input's value to this.state.privateIssue[input.name]
     *
     * @example if event.target = <input name="public" value="1" />, then after this, this.state.privateIssue.public = 1
     */
    onChangeIssueInfo(e: Event) {

        const target = e.target as HTMLInputElement;

        const privateIssue = Object.assign({}, this.state.privateIssue);
        privateIssue[target.name] = target.value;

        this.setState({
            privateIssue
        });
    }

    /**
     * @param e {HTMLFormElement event}
     *
     * Sends this.state.privateIssue data to server (so name and/or public status can be saved to db)
     */
    onSubmit(e: Event) {

        e.stopPropagation();
        e.preventDefault();

        this.props.mutate({
            variables: {
                name: this.state.privateIssue.name,
                public: !!this.state.privateIssue.public
            }
        });
    }

    render() {

        if (this.props.data.issues.length < 1) {
            return null;
        }

        return (
            <IssueTable
              key={+this.state.loaded}
              onSubmit={this.onSubmit}
              onChangeIssueInfo={this.onChangeIssueInfo}
              issues={this.props.data.issues}
            />
        );
    }
}


const IssueTableContainerWithData = compose(
    graphql(IssueQuery),
    graphql(IssueUpdate)
)(IssueTable as any);

export default IssueTableContainerWithData;