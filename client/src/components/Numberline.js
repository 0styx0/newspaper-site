import React from 'react';

/**
 * @prop max - max number to go to
 * @prop current - current number
 *
 * @return numberline with links to issues of numbers 1-5, 4 on either side of current (including current), and last 4 numbers
 */
class Numberline extends React.Component {

    constructor() {
        super();

        this.state = {
            max: 0,
            current: 0
        }
    }

    getData() {

        const allIssues = Array(this.props.max)
                               .fill(0)
                               .map((val, issue) => <a key={issue} href={`/issue/${issue + 1}`}>{issue + 1}</a>);

        allIssues.splice(5, this.props.current - 10, "...")  // gets 1-5 and 5 before currentIssue
        allIssues.splice(15, allIssues.length - 20, "...") // start at 10 so keep 1-5 and 5 before current issue

        return allIssues;
    }

    render() {
        return <span id="issueRange">
                   {this.getData()}
               </span>
    }
}

export default Numberline;