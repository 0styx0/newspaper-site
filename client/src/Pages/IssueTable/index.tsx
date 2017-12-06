import * as React from 'react';
import Table from '../../components/Table';
import Container from '../../components/Container';
import Input from '../../components/Form/Input';
import { Link } from 'react-router-dom';
import { Issue } from './interface.shared';
import FormContainer from '../../components/Form/container';
import { ChangeEvent } from 'react';
import { Helmet } from 'react-helmet';

interface Props {
    issues: Issue[];
    onSubmit: Function;
    canEdit: boolean;
    onChangeIssueInfo: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
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

    if (props.canEdit) {

        issueArr[0][1] = (
            <input
              type="text"
              key="name"
              name="name"
              onChange={props.onChangeIssueInfo}
              defaultValue={props.issues[0].name}
            />
        );

        issueArr[0][3] = (
            <select key="public" name="public" onChange={props.onChangeIssueInfo}>
              <option value={0}>No</option>
              <option value={1}>Yes</option>
            </select>
        );
    }

    const headings = ['Issue', 'Name', 'Views', 'Published'];

    return (
        <Container heading="Issues">

            <Helmet>
                <title>Back Issues</title>
                <meta
                    name="description"
                    content="Past issues published"
                />
            </Helmet>

            <FormContainer onSubmit={props.onSubmit}>
                <Table key="table" headings={headings} rows={issueArr} />
                {props.issues[0].canEdit ?
                    <div key="passwordDiv">
                        <Input label="Password" props={{type: 'password', name: 'password'}}/>
                        <input type="submit" />
                    </div>
                : <span key="nothing" />}
            </FormContainer>
        </Container>
    );
}

export default IssueTable;
