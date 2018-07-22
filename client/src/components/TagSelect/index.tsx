import * as React from 'react';
import { TagQuery } from '../../graphql/tags';
import { graphql, withApollo } from 'react-apollo';

interface Props {
    data?: {
        loading: boolean,
        allTags: string[]
    };
    tags?: string[];
    props: Object;
}

function TagSelect(props: Props) {

    let dbTags: string[] = [];

    if (props.data!.allTags) { // later, remove `tags` from props since will get all tags from graphql
        dbTags = props.data!.allTags;
    }

    const tags = [...new Set(dbTags.concat(props.tags || []))];

    const options = tags.map((val =>
            <option key={val} value={val}>{val[0].toUpperCase() + val.padEnd(2).slice(1)}</option>
        ));

    const select = (
        <select
            children={options}
            defaultValue={[]}
        />
    );

    return React.cloneElement(select, props.props);
}
// export default TagSelect;

const TagSelectWithData = graphql(TagQuery)(TagSelect as any);

export default withApollo(TagSelectWithData as any) as any;
