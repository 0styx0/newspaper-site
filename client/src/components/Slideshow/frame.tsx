import * as React from 'react';

import './index.css';

interface Props {
    img: JSX.Element;
    switchImg: Function // required only if need more than 1 image in slideshow (so basically always)
}

export default function Slideframe(props: Props) {

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
