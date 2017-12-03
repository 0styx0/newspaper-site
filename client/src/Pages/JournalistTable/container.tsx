import * as React from 'react';
import twoDimensionalSorter from '../../helpers/twoDimensionalSorter';
import { compose, graphql } from 'react-apollo';
import { UserQuery, UserUpdate, UserDelete } from '../../graphql/users';
import { User } from './interface.shared';
import JournalistTable from './';
import graphqlErrorNotifier from '../../helpers/graphqlErrorNotifier';

import './index.css';
import { ChangeEvent } from 'react';

export interface State {
    users: User[];
    usersToDelete: Set<string | undefined>;
    idLevelMap: Map<string, number>;
}

export interface Props {
    data: {
        loading: boolean;
        users: User[];
    };
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
export class JournalistTableContainer extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.sortInfo = this.sortInfo.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onIdLevelMap = this.onIdLevelMap.bind(this);

        this.state = {
            users: [],
            usersToDelete: new Set(),
            idLevelMap: new Map()
        };
    }

    /**
     * If data is loaded, sets state.users to props.data.users
     */
    componentWillReceiveProps(props: Props) {

        if (!props.data.users || this.state.users.length > 0) {
            return;
        }

        this.setState({
            users: props.data.users
        });
    }

    /**
     * Sorts by target.value
     */
    sortInfo(event: ChangeEvent<HTMLSelectElement>) {

        const sortBy = (event.target as HTMLSelectElement).value;
        const sortedData = twoDimensionalSorter(this.props.data.users.slice(), sortBy) as User[];

        this.setState({
            users: sortedData
        });
    }

    /**
     * @param e - {htmlInputEvent} whose target.value is a number
     * @param id - id of user
     *
     * Adds an mapping of id -> e.target.value to this.state.idLevelMap
     */
    onIdLevelMap(e: ChangeEvent<HTMLSelectElement>, id: string) {

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
    onDelete(e: ChangeEvent<HTMLInputElement>) {

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
            } else {

                data[data.length] = {
                    level,
                    ids: [id]
                };
            }
        });

        return data;
    }

    /**
     * Sends data to server, if there's data to be sent from this.state usersToDelete and/or idLevelMap
     */
    async onSubmit(target: HTMLFormElement) {

        const data = this.convertMapToArrayOfJSON(this.state.idLevelMap);

        const password = (target.querySelector('[name=password]') as HTMLInputElement).value;

        if (data.length > 0) {

            await graphqlErrorNotifier(
                this.props.userUpdate, {
                    variables: {
                        data,
                        password
                    }
                },
                'userUpdate'
            );

            // this line will only fire if sucess since graphqlErrorNotifier throws error otherwise
            const updatedUsers = [...this.state.users].map(user => {

                const updatedLevel = this.state.idLevelMap.get(user.id);
                return Object.assign(JSON.parse(JSON.stringify(user)), {
                    level: updatedLevel || user.level
                });
            });

            this.setState({
                users: updatedUsers,
                idLevelMap: new Map()
            });
        }

        if (this.state.usersToDelete.size > 0) {

            await graphqlErrorNotifier(
                this.props.userDelete, {
                    variables: {
                        ids: [...this.state.usersToDelete],
                        password
                    }
                },
                'userDeleted'
            );

            // this line will only fire if sucess since graphqlErrorNotifier throws error otherwise
            const existingUsers = this.state.users.filter(user => !this.state.usersToDelete.has(user.id));

            this.setState({
                users: existingUsers,
                usersToDelete: new Set()
            });
        }
    }

    render() {

        if (!this.state.users.length) {
            return null;
        }

        return (
            <JournalistTable
              key={this.state.users.map((user: User) => user.id).join(',')}
              users={this.state.users}
              onDelete={this.onDelete}
              onSortInfo={this.sortInfo}
              onSubmit={this.onSubmit}
              onLevelChange={this.onIdLevelMap}
            />
        );
    }
}

const JournalistTableContainerWithData = compose(
    graphql(UserQuery),
    graphql(UserUpdate, {name: 'userUpdate'}),
    graphql(UserDelete, {name: 'userDelete'})
)(JournalistTableContainer);

export default JournalistTableContainerWithData;
