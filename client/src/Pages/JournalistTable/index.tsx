import * as React from 'react';
import Input from '../../components/Form/Input';
import Select from '../../components/Form/Select';
import Container from '../../components/Container';
import Table from '../../components/Table';
import { jwt } from '../../components/jwt';
import { Link } from 'react-router-dom';

import { compose, graphql } from 'react-apollo';
import { UserQuery, UserUpdate, UserDelete } from '../../graphql/users';

import './index.css';

interface State {
    journalistInfoArr:  (string | number | JSX.Element)[][]; // should be User[], just as html
    usersToDelete: Set<string | undefined>;
    idLevelMap: Map<string, number>;
}

interface User {
    articles: number;
    views: number;
    level: number;
    id: string;
    profileLink: string;
    firstName: string;
    middleName: string;
    lastName: string;
}

interface Props {
    data: {
        loading: boolean;
        users: User[];
    },
    userUpdate: Function;
    userDelete: Function;
}

class JournalistTable extends React.Component<Props, State> {

    constructor() {

        super();

        this.sortInfo = this.sortInfo.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onIdLevelMap = this.onIdLevelMap.bind(this);


        this.state = {
            journalistInfoArr: [],
            usersToDelete: new Set(),
            idLevelMap: new Map()
        };
    }

    componentDidUpdate() {

        if (this.props.data.loading || this.state.journalistInfoArr!.length > 0) {
            return;
        }

        this.setState({
            journalistInfoArr: this.formatDataForTable(this.props.data.users)
        });
    }

    formatDataForTable(userData: User[]) {

        return userData.map((person: User) => {

            const fullName = `${person.firstName} ${person.middleName ? person.middleName + ' ' : ''}${person.lastName}`;
            const profileLink = <Link to={"/u/"+person.profileLink}>{fullName}</Link>;

            let deleteBox: JSX.Element | string = "N/A";
            let level: JSX.Element | number = person.level;

            if (person.level < jwt.level) {

                deleteBox = <input
                                onChange={this.onDelete as any}
                                key={person.id}
                                type="checkbox"
                                name="delAcc[]"
                                value={person.id}
                            />

                level = <select
                          name="lvl[]"
                          onChange={((e: Event) => this.onIdLevelMap(e, person.id)) as any}
                          defaultValue={person.level.toString()}
                        >
                            {Array(jwt.level).fill(null).map((val, idx) =>
                                // fill with levels until and including current user's level
                                <option key={idx} value={idx + 1}>{idx + 1}</option>
                            )}
                        </select>;
            }

            let info: (number | string | JSX.Element)[] = [
                profileLink,
                level,
                person.articles,
                person.views
            ];

            return jwt.level < 2 ? info : info.concat(deleteBox);
        });
    }

    /**
     * Handler for select elt generate in this.renderSortingOptions
     * Sorts the table by parameter given (the selected option)
     */
    sortInfo(event: Event) {

        const sortBy = (event.target as HTMLSelectElement).value;

        const userData = this.props.data.users.slice();

        const sortedData = userData.sort((a: User, b: User) =>
          // the .slice checks if data is a string or not
          a[sortBy].slice ? a[sortBy].localeCompare(b[sortBy]) : a[sortBy] - b[sortBy]);

        this.setState({
            journalistInfoArr: this.formatDataForTable(sortedData)
        });
    }

    renderSortingOptions() {

        const sortingOptions = [ // view: what user sees, value: index of @see User interface
            {
                view: 'Last Name',
                value: 'lastName'
            },
            {
                view: "Articles",
                value: 'articles'
            },
            {
                view: "Views",
                value: 'views'
            }
        ];

        if (jwt.level) {
            sortingOptions.splice(1, 0, {
                view: 'Level',
                value: 'level'
            });
        }

        return (
            <div id="sortingContainer">
                <Select
                  label="Sort By"
                  props={{
                    onChange: this.sortInfo,
                    children: sortingOptions.map((val) => <option key={val.view} value={val.value}>{val.view}</option>)
                  }}
                />
            </div>);
    }

    onIdLevelMap(e: Event, id: string) {

        const target = e.target as HTMLSelectElement;
        const mapCopy = new Map(this.state.idLevelMap);

        mapCopy.set(id, +target.value);

        this.setState({
            idLevelMap: mapCopy
        });
    }

    onDelete(e: Event) {

        const target = e.target as HTMLInputElement;

        const copySet = new Set(this.state.usersToDelete);

        target.checked ? copySet.add(target.value) : copySet.delete(target.value);

        this.setState({
            usersToDelete: copySet
        });
    }

    formatLevelChanges(idLevelMap: Map<string, number>) {

        const data: {level: number; ids: string[]}[] = [];

        Array.from(idLevelMap).forEach(mapping => {

            const [id, level] = mapping;

            const indexOfLevel = data.findIndex(elt => elt.level === level);

            if (indexOfLevel !== -1) {
                data[indexOfLevel].ids.push(id);
            }
            else {
                data[data.length] = {
                    level,
                    ids: [id]
                }
            }
        });

        return data;
    }

    onSubmit(e: Event) {

        e.preventDefault();
        e.stopPropagation();

        const data = this.formatLevelChanges(this.state.idLevelMap);

        if (data.length > 0) {

            this.props.userUpdate({
                variables: {
                    data
                }
            });
        }

        if (this.state.usersToDelete.size > 0) {

            this.props.userDelete({
                variables: {
                    ids: [...this.state.usersToDelete]
                }
            });
        }
    }

    render() {

        const tableHeadings: Array<string | JSX.Element> = ['Name', 'Articles', 'Views'];
        let loggedInElts: JSX.Element[] = [];


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
                    <form onSubmit={this.onSubmit as any}>
                        <div>
                            <Table
                                headings={tableHeadings}
                                rows={this.state.journalistInfoArr}
                            />
                            {loggedInElts.map(input => input)}
                        </div>
                    </form>
                </div>}
            />
        );
    }
}

const JournalistTableTableWithData = compose(
    graphql(UserQuery),
    graphql(UserUpdate, {name: 'userUpdate'}),
    graphql(UserDelete, {name: 'userDelete'})
)(JournalistTable as any);


export default JournalistTableTableWithData;