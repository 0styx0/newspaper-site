import React from 'react';
import Form from './components/Form';
import {Input, Select} from './components/Input';
import {Container} from './components/Container';
import Table from './components/Table';
import {jwt} from './components/jwt';


class JournalistTable extends React.Component {

    constructor() {

        super();

        this.sortInfo = this.sortInfo.bind(this);

        this.state = {
            journalistInfo: [[]]
        }
    }

    async componentWillMount() {

        const data = await this.getData();
        const json = await data.json();
        const journalistInfo = json.map(person => {

            person.name = <a href={person.profile_link}>{person.name}</a>

            if (jwt.level > 1) {

                person.id = (person.level < jwt.level) ? <input type="checkbox" name="delAcc[]" value={person.id} /> : "N/A";
            }

            if (!jwt.level) {

                return [
                    person.name,
                    person.articles,
                    person.views,
                ];
            }

            return [
                person.name,
                person.level,
                person.articles,
                person.views,
                person.id
            ];

        })
        this.setState({journalistInfo: journalistInfo});
    }

    async getData() {

        return await fetch("/api/userGroup", {
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    /**
     * Handler for select elt generate in this.renderSortingOptions
     * Sorts the table by parameter given (the selected option's index)
     */
    sortInfo(event) {

        const sortBy = event.target.options.selectedIndex;

        const copyInfo = [...this.state.journalistInfo]; // making sure not to mutate state since bad practice


        const sortedInfo = copyInfo.sort((a, b) => {

            const sortee1 = (a[sortBy].props) ? a[sortBy].props.children.split(" ")[1] : a[sortBy];
            const sortee2 = (b[sortBy].props) ? b[sortBy].props.children.split(" ")[1] : b[sortBy];

            return (isNaN(+sortee1)) ? sortee1.localeCompare(sortee2) : sortee2 - sortee1;
        });

        this.setState({journalistInfo: sortedInfo});
    }

    renderSortingOptions() {

        const sortingOptions = ["Last Name", "Articles", "Views"];

        if (jwt.level) {
            sortingOptions.splice(1, 0, "Level");
        }

        return (<Select
          label="Sort By"
          onChange={this.sortInfo}
          children={
              sortingOptions.map((val, idx) => <option key={idx} value={val}>{val}</option>)
          }
        />);
    }

    render() {

        const tableHeadings = ['Name', 'Articles', 'Views'];
        let loggedInElts = [];

        if (jwt.level) {
            tableHeadings.splice(1, 0, 'Level');
        }

        if (jwt.level > 1) {
            tableHeadings.push(<span className="danger">Delete</span>);

            loggedInElts = [
                    <Input key={0} label="Password" name="password" type="password" required />,
                    <input key={1} name="" value="Modify Users" type="submit" />
                ];
        }

        return (
            <Container
              heading="Journalists"
              children={
                <div>
                    <Form
                        action="../api/userGroup"
                        children={this.renderSortingOptions()}
                    />
                    <Table
                      headings={tableHeadings}
                      rows={this.state.journalistInfo}
                    />

                    {loggedInElts.map(input => input)}

                </div>}

            />
        );
    }
}

export default JournalistTable;