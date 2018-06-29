import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { IssueQuery, IssueUpdate } from '../../graphql/issues';
import { Issue } from './interface.shared';
import IssueTable from './';
import { ChangeEvent } from 'react';
import graphqlErrorNotifier from '../../helpers/graphqlErrorNotifier';

export interface State {
    privateIssue: { // admins can change these (until public is true)
        public?: boolean;
        name?: string;
    };
    loaded: boolean;
    canEdit: boolean;
}

export interface Props {
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

    public state: State;

    constructor(props: Props) {
        super(props);

        this.onChangeIssueInfo = this.onChangeIssueInfo.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            privateIssue: {},
            loaded: false,
            canEdit: false
        };
    }

    /**
     * When graphql gets data from @see graphql/issues,
     * this turns it into 2d array of what will be table rows and saves it to state.issueInfo
     *
     * If current user is an admin, enables editing of most recent, unpublished issue @see this.allowEditsOfLastIssue
     */
    componentWillReceiveProps(props: Props) {

        if (!props.data.issues || !this.props.data.issues) {
            return;
        }

        this.setState({
            loaded: true,
            canEdit: props.data.issues[0].canEdit
        });
    }

    /**
     * @param e {HTMLInputElement event}
     *
     * Adds input's value to this.state.privateIssue[input.name]
     *
     * @example if event.target = <input name="public" value="1" />, then after this, this.state.privateIssue.public = 1
     */
    onChangeIssueInfo(e: ChangeEvent<HTMLInputElement>) {

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
    onSubmit(target: HTMLFormElement) {

        graphqlErrorNotifier(
            this.props.mutate,
            {
                variables: {
                    name: this.state.privateIssue.name,
                    public: !!this.state.privateIssue.public,
                    password: (target.querySelector('[name=password]') as HTMLInputElement).value
                }
            },
            'issueUpdated'
        );

        this.setState({
            canEdit: !this.state.privateIssue.public
        });
    }

    render() {

        if (!this.props.data.issues) {
            return null;
        }

        return (
            <IssueTable
                key={+this.state.canEdit}
                onSubmit={this.onSubmit}
                onChangeIssueInfo={this.onChangeIssueInfo}
                issues={this.props.data.issues}
                canEdit={this.state.canEdit}
            />
        );
    }
}

const IssueTableContainerWithData = compose(
    graphql(IssueQuery),
    graphql(IssueUpdate)
)(IssueTableContainer);

export default IssueTableContainerWithData;
