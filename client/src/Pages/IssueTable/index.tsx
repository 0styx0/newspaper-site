import * as React from 'react';
import Table from '../../components/Table';
import Container from '../../components/Container';
import {jwt} from '../../components/jwt';
import Input from '../../components/Form/Input';
import { Link } from 'react-router-dom';
import { compose, graphql } from 'react-apollo';
import { IssueQuery, IssueUpdate } from '../../graphql/issues';

jwt.level = 3;

interface State {
    issueInfo?: Array<number | Date | JSX.Element>[]; // convert some of Issue to html
    privateIssue: { // admins can change these (until public is true)
        public?: boolean;
        name?: string;
    };
}

interface Issue {
    num: number;
    name: string;
    views: number;
    datePublished: Date;
    public: boolean;
}

interface Props {
    data: {
        loading: boolean;
        issues: Issue[]
    };
    mutate: Function;
}

class IssueTable extends React.Component<Props, State> {

    constructor() {
        super();

        this.changeIssueInfo = this.changeIssueInfo.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            issueInfo: [],
            privateIssue: {}
        }
    }

    componentDidUpdate() {

        if (this.props.data.loading || this.state.issueInfo!.length > 0) {
            return;
        }

        const admin = jwt.level > 2;

        const dataArr = this.props.data.issues.map((issue: Issue) => [
                 issue.num,
                 (admin && !issue.public) ?
                     <input
                       type="text"
                       name="name"
                       onChange={this.changeIssueInfo as any}
                       defaultValue={issue.name}
                     />
                   : <Link to={'/issue/'+issue.num}>{issue.name}</Link>,
                 issue.views,
                 (admin && !issue.public) ?
                                      <select name="public" onChange={this.changeIssueInfo as any}>
                                        <option value={0}>No</option>
                                        <option value={1}>Yes</option>
                                      </select>
                                    : issue.datePublished
        ]);

        this.setState({issueInfo: dataArr});
    }

    changeIssueInfo(e: Event) {

        const target = e.target as HTMLInputElement;

        const privateIssue = Object.assign({}, this.state.privateIssue);
        privateIssue[target.name] = target.value;

        this.setState({
            privateIssue
        });
    }

    onSubmit(e: Event) {

        e.stopPropagation();
        e.preventDefault();

        this.props.mutate({
            variables: {
                name: this.state.privateIssue.name,
                public: !!this.state.privateIssue.public
            }
        })
    }

    render() {

        if (!this.state.issueInfo) {
            return null;
        }

        const headings = ["Issue", "Name", "Views", "Published"];

        return (
            <Container
                heading="Issues"
                children={
                    <form onSubmit={this.onSubmit as any}>
                        <div>
                            <Table headings={headings} rows={this.state.issueInfo} />
                            {jwt.level > 2 ?
                                <div>
                                    <Input label="Password" props={{type: "password", name: "password"}}/>
                                    <input type="submit" />
                                </div>
                            : ""}
                        </div>
                     </form>
                    }
            />
        )
    }
}


const IssueTableWithData = compose(
    graphql(IssueQuery),
    graphql(IssueUpdate)
)(IssueTable as any);

export default IssueTableWithData;