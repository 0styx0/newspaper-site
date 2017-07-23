import React from 'react';
import { Link } from 'react-router-dom';

import Numberline from './';

/**
 * @prop max - max number to go to
 * @prop current - current number
 *
 * @return numberline with links to issues of numbers 1-5, 4 on either side of current (including current), and last 4 numbers
 */
export default class NumberlineContainer extends React.Component {

    constructor() {
        super();

        this.state = {
            line: []
        }
    }

    getData() {

        const allIssues = Array(this.props.max)
                               .fill(0)
                               .map((val, issue) => <Link
                                                      key={issue}
                                                      to={`/issue/${issue + 1}`}
                                                    >
                                                      {issue + 1}
                                                    </Link>
                               );


        allIssues.splice(5, this.props.current - 10, "...")  // gets 1-5 and 5 before currentIssue
        allIssues.splice(15, allIssues.length - 20, "...") // start at 10 so keep 1-5 and 5 before current issue

        // get rid of trailing ...
        for (let i = allIssues.length - 1; i > allIssues.length - 2; i--) {

            if (allIssues[i] === "...") {
                allIssues.pop();
            }
            else {
                break;
            }
        }

        this.setState({
            line: allIssues
        });
    }

    render() {
        return <Numberline lineContent={this.state.line} />
    }
}

NumberlineContainer.propTypes = {
    max: PropTypes.number.isRequired,
    current: PropTypes.number.isRequired
}