import * as React from 'react';
import Container from '../../components/Container';
import Table from '../../components/Table';

interface Props {
    name: string;
    level: number;
    articles: number;
    views: number;
}

function PublicUserInfo(props: Props) {

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
