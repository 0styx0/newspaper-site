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
        this.updateInfo = this.updateInfo.bind(this);

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

                if (person.level < jwt.level) {
                    person.id = <input formMethod="delete" key={person.id} type="checkbox" name="delAcc[]" value={person.id} />
                    person.level =
                        <div>
                            <select name="lvl[]" formMethod="put" defaultValue={person.level}>{Array(jwt.level).fill(null).map((val, idx) => {
                                return (<option key={idx} value={idx + 1}>{idx + 1}</option>)
                            })}</select>
                            <input formMethod="put" type="hidden" name="name[]" value={person.profile_link}/>
                        </div>

                }
                else {
                    person.id = "N/A";
                }
            }

            if (!jwt.level) {

                delete person.id;
                delete person.level;
            }
            delete person.profile_link;

            return person;
        });

        this.setState({journalistInfo});
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

    updateInfo(method, infoChanged) {

        let updatedInfo = this.state.journalistInfo;

        if (infoChanged['delAcc[]']) {

            updatedInfo = this.state.journalistInfo.filter(person =>
            (person.id.props) ? infoChanged['delAcc[]'].indexOf(person.id.props.value.toString()) === -1 : true);
        }

        this.setState({journalistInfo: updatedInfo});
    }

    render() {

        const tableHeadings = ['Name', 'Articles', 'Views'];
        let loggedInElts = [];

        const data = this.state.journalistInfo;

        // converts data to arrays so can be put into table
        const tableData = data.map(json => {

            const arr = [];
            for (const key in json) {
                arr.push(json[key])
            }
            return arr;
        });


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
                    {this.renderSortingOptions()}
                     <Form
                        action="api/userGroup"
                        method={['put', 'delete']} // since delete and put are in the same form, asking to check each input separately
                        onSubmit={this.updateInfo}
                        children={
                          <div>
                            <Table
                            headings={tableHeadings}
                            rows={tableData}
                            />
                            {loggedInElts.map(input => input)}
                          </div>}

                    />

                </div>}

            />
        );
    }
}

export default JournalistTable;