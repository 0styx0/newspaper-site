import React from 'react';
import PropTypes from 'prop-types';


export default function TagSelect(props) {

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

    const options = props.tags.concat(tags).map((val =>
            <option key={val} value={val}>{val[0].toUpperCase() + val.slice(1)}</option>
        ));

    const select = <select
                     children={options}
                   />

    return React.cloneElement(select, props.props);
}

TagSelect.defaultProps = {
    tags: []
}

TagSelect.propTypes = {
    tags: PropTypes.arrayOf(PropTypes.string),
    props: PropTypes.object,
}
