import * as React from 'react';
import Container from '../../components/Container';

function PublicUserInfo(props: {info: ModifiableInfo}) {

    const headingsJSON = props.info;

    return (
        <Container
            className="tableContainer"
            children={
                <Table
                  headings={Object.keys(headingsJSON)}
                  rows={[Object.values(headingsJSON)]}
                />
            }
        />
    );
}

export default PublicUserInfo;
