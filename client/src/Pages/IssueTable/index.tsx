import * as React from 'react';
import Table from '../../components/Table';
import Container from '../../components/Container';
// import { jwt } from '../../components/jwt';
import Input from '../../components/Form/Input';
import { Link } from 'react-router-dom';
import { compose, graphql } from 'react-apollo';
import { IssueQuery, IssueUpdate } from '../../graphql/issues';


interface State {
    issueInfo?: Array<number | Date | JSX.Element>[]; // convert some of Issue to html
    privateIssue: { // admins can change these (until public is true)
        public?: boolean;
        name?: string;
    };
}

export interface Issue {
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

export class IssueTable extends React.Component<Props, State> {

    private jwt = window.localStorage.getItem('jwt') ?
                JSON.parse(window.localStorage.getItem('jwt') as string)[1] :
                {level: 0};

    constructor() {
        super();

        this.changeIssueInfo = this.changeIssueInfo.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            issueInfo: [],
            privateIssue: {}
        };
    }

    /**
     * When graphql gets data from @see graphql/issues,
     * this turns it into 2d array of what will be table rows and saves it to state.issueInfo
     *
     * If current user is an admin, enables editing of most recent, unpublished issue @see this.allowEditsOfLastIssue
     */
    componentWillReceiveProps(props: Props) {

        if (!props.data.issues || this.state.issueInfo!.length > 0) {
            return;
        }

        const admin = this.jwt.level > 2;

        let dataArr = props.data.issues.map((issue: Issue) => [
                 issue.num,
                 <Link key={issue.num} to={`/issue/${issue.num}`}>{issue.name}</Link>,
                 issue.views,
                 issue.datePublished
        ]);


        const lastIssue = props.data.issues[0];

        if (!lastIssue.public && admin) {

            dataArr = this.allowEditsOfLastIssue(dataArr, lastIssue);
        }

        this.setState({issueInfo: dataArr});
    }

    /**
     * @param dataArr - {Array<number, name, views, datePublished>[]}
     *
     * @return dataArr, but with first row's name and dataPublished replaced with `input` and `select` respectively
     */
    allowEditsOfLastIssue(dataArr: (number | JSX.Element | Date)[][], lastIssue: Issue) {

            dataArr[0][1] = (
                         <input
                            type="text"
                            name="name"
                            onChange={this.changeIssueInfo as any}
                            defaultValue={lastIssue.name}
                         />
                     );
            dataArr[0][3] = (
                        <select name="public" onChange={this.changeIssueInfo as any}>
                            <option value={0}>No</option>
                            <option value={1}>Yes</option>
                        </select>
                    );

            return dataArr;
    }

    /**
     * @param e {HTMLInputElement event}
     *
     * Adds input's value to this.state.privateIssue[input.name]
     *
     * @example if event.target = <input name="public" value="1" />, then after this, this.state.privateIssue.public = 1
     */
    changeIssueInfo(e: Event) {

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

        if (!this.state.issueInfo) {
            return null;
        }

        const headings = ['Issue', 'Name', 'Views', 'Published'];

        return (
            <Container
                heading="Issues"
                children={
                    <form onSubmit={this.onSubmit as any}>
                        <div>
                            <Table headings={headings} rows={this.state.issueInfo} />
                            {this.jwt.level > 2 ?
                                <div>
                                    <Input label="Password" props={{type: 'password', name: 'password'}}/>
                                    <input type="submit" />
                                </div>
                            : ''}
                        </div>
                     </form>}
            />
        );
    }
}


const IssueTableWithData = compose(
    graphql(IssueQuery),
    graphql(IssueUpdate)
)(IssueTable as any);

export default IssueTableWithData;