import * as React from 'react';
import Input from '../../components/Form/Input';
import Select from '../../components/Form/Select';
import Container from '../../components/Container';
import Table from '../../components/Table';
// import { jwt } from '../../components/jwt';
import { Link } from 'react-router-dom';

import twoDimensionalSorter from '../../helpers/twoDimensionalSorter';

import { compose, graphql } from 'react-apollo';
import { UserQuery, UserUpdate, UserDelete } from '../../graphql/users';

import './index.css';

interface State {
    userInfo:  (string | number | JSX.Element)[][]; // should be User[], just as html
    usersToDelete: Set<string | undefined>;
    idLevelMap: Map<string, number>;
}

export interface User {
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

/**
 * Creates a table with info about users in it
 *
 * Anyone can see users' name (along with link to profile), number of articles, and total views that person has
 *
 * Logged in users can also see users' levels
 *
 * Logged in users with a level greater than one in the table can also modify that user's level and delete account
 */
export class JournalistTable extends React.Component<Props, State> {

    private jwt = window.localStorage.getItem('jwt') ?
                    JSON.parse(window.localStorage.getItem('jwt') as string)[1] :
                    {level: 0};

    constructor() {
        super();

        this.sortInfo = this.sortInfo.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onIdLevelMap = this.onIdLevelMap.bind(this);


        this.state = {
            userInfo: [],
            usersToDelete: new Set(),
            idLevelMap: new Map()
        };
    }

    /**
     * If data is loaded, sets state.userInfo to result of {@see this.formatDataForTable}
     */
    componentWillReceiveProps(props: Props) {

        if (!props.data.users || this.state.userInfo!.length > 0) {
            return;
        }

        this.setState({
            userInfo: this.formatDataForTable(props.data.users)
        });
    }

    /**
     * Transforms raw {User[]} data to jsx
     *
     * name becomes link to user's profile
     *
     * if current user's level is greater than user in table:
     *   * level becomes a `select` element with options 1 - current user's level
     *   * a `input[type=checkbox, value=user.id]` is created to enabled deletion of account
     *
     * @return 2d array of [profileLink, level, articles, views]
     */
    formatDataForTable(userData: User[]) {

        return userData.map((person: User) => {

            const fullName = `${person.firstName} ${person.middleName ? person.middleName + ' ' : ''}${person.lastName}`;
            const profileLink = <Link to={"/u/"+person.profileLink}>{fullName}</Link>;

            let deleteBox: JSX.Element | string = "N/A";
            let level: JSX.Element | number = person.level;

            if (person.level < this.jwt.level) {

                deleteBox = <input
                                onChange={this.onDelete as any}
                                key={person.id}
                                type="checkbox"
                                name="delAcc"
                                value={person.id}
                            />

                level = <select
                          name="lvl"
                          onChange={((e: Event) => this.onIdLevelMap(e, person.id)) as any}
                          defaultValue={person.level.toString()}
                        >
                            {Array(this.jwt.level).fill(null).map((val, idx) =>
                                // fill with levels until and including current user's level
                                <option key={idx} value={idx + 1}>{idx + 1}</option>
                            )}
                        </select>;
            }

            let info: (number | string | JSX.Element)[] = [
                profileLink,
                person.articles,
                person.views
            ];

            switch(this.jwt.level) {
                case 3:
                case 2:
                    info.push(deleteBox)
                case 1:
                    info.splice(1, 0, level)
                default:
                    return info;
            }
        });
    }

    /**
     * Sorts by target.value
     */
    sortInfo(event: Event) {

        const sortBy = (event.target as HTMLSelectElement).value;

        const sortedData = twoDimensionalSorter(this.props.data.users.slice(), sortBy) as User[];

        this.setState({
            userInfo: this.formatDataForTable(sortedData)
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

        if (this.jwt.level) {
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

    /**
     * @param e - {htmlInputEvent} whose target.value is a number
     * @param id - id of user
     *
     * Adds an mapping of id -> e.target.value to this.state.idLevelMap
     */
    onIdLevelMap(e: Event, id: string) {

        const target = e.target as HTMLSelectElement;
        const mapCopy = new Map(this.state.idLevelMap);

        mapCopy.set(id, +target.value);

        this.setState({
            idLevelMap: mapCopy
        });
    }

    /**
     * Adds input value to {@see this.state.usersToDelete} if input is checked, else removes the value
     *
     * @param {htmlInputEvent} - event from html checkbox
     */
    onDelete(e: Event) {

        const target = e.target as HTMLInputElement;

        const copySet = new Set(this.state.usersToDelete);

        target.checked ? copySet.add(target.value) : copySet.delete(target.value);

        this.setState({
            usersToDelete: copySet
        });
    }

    /**
     * @param idLevelMap - map of id to level
     *
     * @return object where level => [ids that mapped to that level]
     *
     * @example convertMapToArrayOfJSON(new Map([['123', 1], ['456', 2], ['789', 1])) =>
     * [
     *   {
     *     level: 1
     *     ids: ['123', '789']
     *   },
     *   {
     *     level: 2,
     *     ids: ['456']
     *   }
     * ]
     */
    convertMapToArrayOfJSON(idLevelMap: Map<string, number>) {

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

    /**
     * Sends data to server, if there's data to be sent from this.state usersToDelete and/or idLevelMap
     */
    onSubmit(e: Event) {

        e.preventDefault();
        e.stopPropagation();

        const data = this.convertMapToArrayOfJSON(this.state.idLevelMap);

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


        if (this.jwt.level) {
            tableHeadings.splice(1, 0, 'Level');
        }

        if (this.jwt.level > 1) {
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
                                rows={this.state.userInfo}
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