import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import Slideframe from './frame';


class Slideshow extends React.Component {

    constructor(props) {
        super(props);


        this.switchActiveImg = this.switchActiveImg.bind(this);

        this.state = {
            images: this.props.images,
            activeImg: 0
        }
    }

    componentWillMount() {


        const imagesWithLinks = this.state.images.map((img =>
                                  <Link to={img.url}>
                                    <img alt="" className="slideshowPic" src={img.img} />
                                  </Link>));

        this.setState({
            images: imagesWithLinks
        });

    }

    switchActiveImg() {

        this.setState({
                activeImg: (this.state.activeImg + 1) % this.state.images.length
            })
    }

    render() {

        const defaultImg = <Link to="/">
                                <img alt="Default, TABC logo" className="slideshowPic" src="../images/tabc_logo.png" />
                            </Link>


        const currentImg = this.state.images[this.state.activeImg] || defaultImg

        return <Slideframe
                 img={currentImg}
                 switchImg={this.switchActiveImg}
               />

    }
}


Slideshow.propTypes = {
    images: PropTypes.arrayOf(PropTypes.shape({
              url: PropTypes.string,
              img: PropTypes.string
    }))
}

export default Slideshow;