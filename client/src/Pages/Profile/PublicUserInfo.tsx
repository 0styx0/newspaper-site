import * as React from 'react';
import Container from '../../components/Container';
import Table from '../../components/Table';
import { PublicUserInfo } from './shared.interfaces';

function PublicUserInfo(props: PublicUserInfo) {

    return (
        <Container
            className="tableContainer"
            children={
                <Table
                  headings={Object.keys(props)}
                  rows={[Object.values(props)]}
                />
            }
        />
    );
}

export default PublicUserInfo;
