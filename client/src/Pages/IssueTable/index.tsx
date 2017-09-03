import * as React from 'react';
import Table from '../../components/Table';
import Container from '../../components/Container';
import Input from '../../components/Form/Input';
import { Link } from 'react-router-dom';
import { Issue } from './interface.shared';

interface Props {
    issues: Issue[];
    onSubmit: Function;
    onChangeIssueInfo: Function;
}

/**
 * Creates a table of issues, in descending order with info of
 * number, name, datePublished, and views (sum of views of all articles in the issue)
 *
 * If user is admin (lvl 3) and issue is not public, user can change issue name and make it public.
 * In that case, @see IssueTable.allowEditsOfLastIssue for difference in UI
 */
function IssueTable(props: Props) {


    let issueArr = props.issues.map((issue: Issue) => [
            issue.num,
            <Link key={issue.num} to={`/issue/${issue.num}`}>{issue.name}</Link>,
            issue.views,
            issue.datePublished
    ]);

    if (props.issues[0].canEdit) {

        issueArr[0][1] = (
            <input
              type="text"
              name="name"
              onChange={props.onChangeIssueInfo as any}
              defaultValue={props.issues[0].name}
            />
        );

        issueArr[0][3] = (
            <select name="public" onChange={props.onChangeIssueInfo as any}>
              <option value={0}>No</option>
              <option value={1}>Yes</option>
            </select>
        );
    }

    const headings = ['Issue', 'Name', 'Views', 'Published'];

    return (
        <Container
            heading="Issues"
            children={
                <form onSubmit={props.onSubmit as any}>
                    <div>
                        <Table headings={headings} rows={issueArr} />
                        {props.issues[0].canEdit ?
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

export default IssueTable;
