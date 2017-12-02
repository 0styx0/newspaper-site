import * as React from 'react';
import { Link } from 'react-router-dom';

import Numberline from './';

interface Props {
    max: number;
    current: number;
}

interface State {
    line: Array<JSX.Element | string>;
}

/**
 * @prop max - max number to go to
 * @prop current - current number
 *
 * @return numberline with links to issues of numbers 1-5, 4 on either side of current
 *  (including current), and last 4 numbers
 *
 */
export default class NumberlineContainer extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            line: []
        };
    }

    componentWillMount() {

        const plainNumberline = this.addPlainNumbers();
        const numberlineWithEllipses = this.addEllipses(plainNumberline);

        const issueNumberLinks: Array<JSX.Element | string> = numberlineWithEllipses.map(issue => (

            typeof issue === 'string' ?
                issue :
                (
                    <Link
                        key={issue}
                        to={`/issue/${issue}`}
                    >
                        {issue}
                    </Link>
                )
        ));

        this.setState({
            line: issueNumberLinks
        });
    }

    /**
     * @return raw numberline (just numbers)
     */
    addPlainNumbers() {

        const numbers: number[] = [];
        const plainLine = new Set<number>();

        for (let i = 1; i < this.props.max + 1; i++) {
            numbers.push(i);
        }

        [...numbers].splice(0, 5).forEach(elt => plainLine.add(elt));

        [...numbers].splice(this.props.current - 3, 6).forEach(elt => plainLine.add(elt));
        [...numbers].splice(this.props.max - 3, 6).forEach(elt => plainLine.add(elt));

        return [...plainLine];
    }

    /**
     * @return numberline with ... whenever there's a gap of more than 1 between numbers
     */
    addEllipses(numberline: number[]) {

        const numberlineWithEllipses: (string | number)[] = [];

        for (let i = 0; i < numberline.length; i++) {

            numberlineWithEllipses.push(numberline[i]);

            // 2 - 4 -> -2, so would add ellipse
            if (numberline[i] - numberline[i + 1] < -1) {

                numberlineWithEllipses.push('...');
            }

        }

        return numberlineWithEllipses;
    }

    render() {
        return <Numberline lineContent={this.state.line} />;
    }
}
