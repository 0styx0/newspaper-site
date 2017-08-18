import * as React from 'react';

interface Props {
    tags?: string[];
    props: Object;
};

export default function TagSelect(props: Props) {

    const tags = [
                    'news',
                    'reaction',
                    'opinion',
                    'poll',
                    'features',
                    'sports',
                    'politics',
                    'other'
                ];

    const options = [...new Set((props.tags || []).concat(tags))].map((val =>
            <option key={val} value={val}>{val[0].toUpperCase() + val.slice(1)}</option>
        ));

    const select = <select
                     children={options}
                   />

    return React.cloneElement(select, props.props);
}
