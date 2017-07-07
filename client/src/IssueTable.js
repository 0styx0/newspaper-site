import React from 'react';
import Table from './components/Table';
import {Container} from './components/Container';

class IssueTable extends React.Component {

    constructor() {
        super();

        this.state = {
            issueInfo: [[]]
        };
    }

    async componentWillMount() {

        const rawData = await fetch('/api/issue', {
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await rawData.json();

        const dataArr = data.map((issue) => [
                 issue.num,
                 <a href={`/issue/${issue.num}`}>{issue.name}</a>,
                 issue.views,
                 issue.madepub
        ]);

        this.setState({issueInfo: dataArr});
    }

    render() {

        const headings = ["Issue", "Name", "Views", "Published"];

        return (
            <Container
                heading="Issues"
                children={<Table headings={headings} rows={this.state.issueInfo} />}
            />
        )
    }
}




export default IssueTable;