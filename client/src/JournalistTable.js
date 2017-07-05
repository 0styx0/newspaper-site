import React from 'react';
import Form from './components/Form';
import {Input, Select} from './components/Input';
import {Container, jwt} from './components/Container';
import Table from './components/Table';


class JournalistTable extends React.Component {

    constructor() {

        super();

        this.state = {
            journalistInfo: [[]]
        }
    }

    async componentWillMount() {

        const data = await this.getData();
        const json = await data.json();
        const journalistInfo = json.map(person => {

            person.name = <a href={person.profile_link}>{person.name}</a>

            delete person.profile_link;
            delete person.id;

            const arr = [];

            for (const bit in person) {
                arr.push(person[bit]);
            }
            return arr;

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

    renderSortingOptions() {

        const sortingOptions = ["Last Name", "Articles", "Views"];

        if (jwt.level) {
            sortingOptions.push("Level");
        }

        return (<Select
          label="Sort By"
          children={
              sortingOptions.map((val, idx) => <option key={idx} value={val}>{val}</option>)
          }
        />);
    }

    render() {

        const tableHeadings = ['Name', 'Articles', 'Views'];

        if (jwt.level) {
            tableHeadings.push('Level');
        }
        if (jwt.level > 1) {
            tableHeadings.push('Delete');
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
                </div>}

            />
        );
    }
}

export default JournalistTable;