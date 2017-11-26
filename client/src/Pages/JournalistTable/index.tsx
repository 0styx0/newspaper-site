import * as React from 'react';
import Input from '../../components/Form/Input';
import Select from '../../components/Form/Select';
import Container from '../../components/Container';
import Table from '../../components/Table';
import { getJWT, Jwt } from '../../helpers/jwt';
import { Link } from 'react-router-dom';
import { User } from './interface.shared';
import FormContainer from '../../components/Form/container';

import './index.css';

interface Props {
    users: User[];
    onSortInfo: Function;
    onSubmit: Function;
    onLevelChange: Function;
    onDelete: Function;
}


function JournalistTable(props: Props) {

    const jwt = getJWT();

    let loggedInElts: JSX.Element[] = [];

    if (jwt.level > 1) {

        loggedInElts = [
                (
                    <Input
                        key={0}
                        label="Password"
                        props={{
                            key: 0,
                            name: 'password',
                            type: 'password',
                            required: true
                        }}
                    />
                ),
                <input key={1} name="" value="Modify Users" type="submit" />
            ];
    }

    return (
        <Container heading="Journalists">
            <div id="sortingContainer">
                <Select
                    label="Sort By"
                    props={{
                        onChange: props.onSortInfo,
                        children: getSortingOptions(jwt).map((val) =>
                            <option key={val.view} value={val.value}>{val.view}</option>)
                    }}
                />
            </div>

            <FormContainer onSubmit={props.onSubmit as any}>
                <div key="table">
                    <Table
                        headings={getTableHeadings(jwt)}
                        rows={formatDataForTable(props.users, props.onLevelChange, props.onDelete, jwt)}
                    />
                    {loggedInElts.map(input => input)}
                </div>
            </FormContainer>
        </Container>
    );
}

function getTableHeadings(jwt: Jwt) {

    const tableHeadings: Array<string | JSX.Element> = ['Name', 'Articles', 'Views'];

    if (jwt.level) {
        tableHeadings.splice(1, 0, 'Level');
    }

    if (jwt.level > 1) {
        tableHeadings.push(<span className="danger">Delete</span>);
    }

    return tableHeadings;
}

/**
 * @return array to loop through to get sorting <option>s
 */
function getSortingOptions(jwt: Jwt) {

    const sortingOptions = [ // view: what user sees, value: index of @see User interface
        {
            view: 'Last Name',
            value: 'lastName'
        },
        {
            view: 'Articles',
            value: 'articleCount'
        },
        {
            view: 'Views',
            value: 'views'
        }
    ];

    if (jwt.level) {

        sortingOptions.splice(1, 0, {
            view: 'Level',
            value: 'level'
        });
    }

    return sortingOptions;
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
function formatDataForTable(userData: User[], onLevelChange: Function, onDelete: Function, jwt: Jwt) {

    return userData.map((person: User) => {

        const fullName =
            `${person.firstName} ${person.middleName ? person.middleName + ' ' : ''}${person.lastName}`;
        const profileLink = <Link to={`/u/${person.profileLink}`}>{fullName}</Link>;

        let deleteBox: JSX.Element | string = 'N/A';
        let level: JSX.Element | number = person.level;

        if (person.level < jwt.level) {

            deleteBox = (
                <input
                    onChange={onDelete as any}
                    key={person.id}
                    type="checkbox"
                    name="delAcc"
                    value={person.id}
                />
            );
            
            level = (
                <select
                    name="lvl"
                    onChange={((e: Event) => onLevelChange(e, person.id)) as any}
                    defaultValue={person.level.toString()}
                >
                    {Array(+jwt.level).fill(null).map((val, idx) =>
                        // fill with levels until and including current user's level
                        <option key={idx} value={idx + 1}>{idx + 1}</option>
                    )}
                </select>
            );
        }

        let info: (number | string | JSX.Element)[] = [
            profileLink,
            person.articleCount,
            person.views
        ];

        if (person.canEdit) {
            info.push(deleteBox);
        }

        if (jwt.level) {
            info.splice(1, 0, level);
        }

        return info;
    });
}



export default JournalistTable;