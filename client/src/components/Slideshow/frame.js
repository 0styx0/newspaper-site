import React from 'react';
import PropTypes from 'prop-types';

import './index.css';


export default function Slideframe(props) {

    const imgClone = React.cloneElement(props.img, {

        children: React.cloneElement(props.img.props.children, {
            className: "slideshowPic activePic"
        }),

        onAnimationIteration: props.switchImg
    })

    return (

        <div id="slideShow">
            {imgClone}
        </div>
    );
}

Slideframe.propTypes = {

    img: PropTypes.element.isRequired,
    switchImg: PropTypes.func // required only if need more than 1 image in slideshow (so basically always)
}

