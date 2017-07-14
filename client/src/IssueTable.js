import React from 'react';
import Table from './components/Table';
import {Container} from './components/Container';
import {jwt} from './components/jwt';
import Form from './components/Form';
import {Input} from './components/Input';
import A from './components/A';

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
                 (jwt.level > 2 && !issue.madepub) ?
                     <input
                       type="text"
                       name="issueName"
                       defaultValue={issue.name}
                     />
                   : <A href={'/issue/'+issue.num} text={issue.name} router={this} />,
                 issue.views,
                 (jwt.level > 2 && !issue.madepub) ?
                                      <select name="pub">
                                        <option value="0">No</option>
                                        <option value="1">Yes</option>
                                      </select>
                                    : issue.madepub
        ]);

        this.setState({issueInfo: dataArr});
    }

    render() {

        const headings = ["Issue", "Name", "Views", "Published"];

        return (
            <Container
                heading="Issues"
                children={
                    <Form
                      action="api/issue"
                      method="put"
                      children={
                          <div>
                            <Table headings={headings} rows={this.state.issueInfo} />
                            {(jwt.level > 2) ?
                                <div>
                                  <input type="hidden" name="issue" defaultValue={this.state.issueInfo[0][0]} className="changed" />
                                  <Input label="Password" props={{type: "password", name: "password"}}/>
                                  <input type="submit" />
                                </div>
                             : ""}
                          </div>
                          }
                     />
                    }
            />
        )
    }
}




export default IssueTable;