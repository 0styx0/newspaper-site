import * as React from 'react';
import { TagQuery } from '../../graphql/tags';
import { graphql, withApollo } from 'react-apollo';

interface Props {
    data: {
        loading: boolean,
        tags: [{
            tags: string[]
        }]
    };
    tags: string[];
    props: Object;
}

function TagSelect(props: Props) {

    let dbTags: string[] = [];

    if (props.data.tags) {
        dbTags = props.data.tags[0].tags;
    }

    const tags = [...new Set((props.tags || []).concat(dbTags))];

    const options = tags.map((val =>
            <option key={val} value={val}>{val[0].toUpperCase() + val.slice(1)}</option>
        ));

    const select = (
        <select
            children={options}
        />
    );

    return React.cloneElement(select, props.props);
}

const TagSelectWithData = graphql(TagQuery)(TagSelect as any);

export default withApollo(TagSelectWithData);
