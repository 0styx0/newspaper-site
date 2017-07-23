import React from 'react';
import FormContainer from '../../components/Form/container';
import Input from '../../components/Form/Input';
import Select from '../../components/Form/Select';
import SecretTwinsContainer from '../../components/Form/SecretTwins/container';
import Container from '../../components/Container';
import Table from '../../components/Table';
import {jwt} from '../../components/jwt';
import fetchFromApi from '../../helpers/fetchFromApi';
import { Link } from 'react-router-dom';

import './index.css';

class JournalistTable extends React.Component {

    constructor() {

        super();

        this.sortInfo = this.sortInfo.bind(this);
        this.updateInfo = this.updateInfo.bind(this);

        this.state = {
            journalistInfoArr: [[]],
            journalistInfoJson: [{}]
        }
    }

    async componentWillMount() {

        const data = await this.getData();
        const json = await data.json();
        const journalistInfoJson = json.map(person => {

            person.name = <Link to={"/u/"+person.profile_link}>{person.name}</Link>

            if (jwt.level > 1) {

                if (person.level < jwt.level) {
                    person.id = <input formMethod="delete" key={person.id} type="checkbox" name="delAcc[]" value={person.id} />
                    person.level =
                        <SecretTwinsContainer
                          original={<select name="lvl[]" onChange={this.mirrorClass} formMethod="put" defaultValue={person.level}>{Array(jwt.level).fill(null).map((val, idx) => {
                                return (<option key={idx} value={idx + 1}>{idx + 1}</option>)
                            })}</select>}

                            props = {{
                                name: "name[]",
                                value: person.profile_link
                            }}
                        />
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

        this.setJournalistInfo(journalistInfoJson);
    }

    async getData() {

        return await fetchFromApi("userGroup");
    }

    /**
     * Handler for select elt generate in this.renderSortingOptions
     * Sorts the table by parameter given (the selected option's index)
     */
    sortInfo(event) {

        const sortBy = event.target.options.selectedIndex;

        const copyInfo = [...this.state.journalistInfoArr]; // making sure not to mutate state since bad practice

        const sortedInfo = copyInfo.sort((a, b) => {

            const sortee1 = getSortInfo(a[sortBy]);
            const sortee2 = getSortInfo(b[sortBy]);

            return (isNaN(+sortee1)) ? sortee1.localeCompare(sortee2) : sortee2 - sortee1;
        });


        function getSortInfo(elt) {


            if (elt.props) {

                // sort by level, last name
                return elt.props.original ?  elt.props.original.props.defaultValue : elt.props.children.split(" ")[0];
            }

            return elt;
        }

        this.setJournalistInfo(sortedInfo);
    }

    renderSortingOptions() {

        const sortingOptions = ["Last Name", "Articles", "Views"];

        if (jwt.level) {
            sortingOptions.splice(1, 0, "Level");
        }

        return (
            <div id="sortingContainer">
                <Select
                  label="Sort By"
                  props={{
                    onChange: this.sortInfo,
                    children: sortingOptions.map((val, idx) => <option key={idx} value={val}>{val}</option>)
                  }}
            />
        </div>);
    }

    updateInfo(method, infoChanged) {

        let updatedInfo = this.state.journalistInfoJson;

        if (infoChanged['delAcc[]']) {

            updatedInfo = this.state.journalistInfoJson.filter(person =>
            (person.id.props) ? infoChanged['delAcc[]'].indexOf(person.id.props.value.toString()) === -1 : true);
        }

        this.setJournalistInfo(updatedInfo);
    }

    setJournalistInfo(journalistInfoJson) {

        // converts data to arrays so can be put into table
        const journalistInfoArr = journalistInfoJson.map(json => {

            const arr = [];
            for (const key in json) {
                arr.push(json[key])
            }
            return arr;
        });

        this.setState({journalistInfoArr, journalistInfoJson});
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
                    <Input
                        key={0}
                        label="Password"
                        props={{
                            key: 0,
                            name: "password",
                            type: "password",
                            required: true
                        }}
                    />,
                    <input key={1} name="" value="Modify Users" type="submit" />
                ];
        }

        return (
            <Container
              heading="Journalists"
              children={
                <div>
                    {this.renderSortingOptions()}
                     <FormContainer
                        action="/api/userGroup"
                        method={['put', 'delete']} // since delete and put are in the same form, asking to check each input separately
                        onSubmit={this.updateInfo}
                        children={
                          <div>
                            <Table
                            headings={tableHeadings}
                            rows={this.state.journalistInfoArr}
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