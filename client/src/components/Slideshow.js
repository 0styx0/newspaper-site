import React from 'react';
import { Link } from 'react-router-dom';

class Slideshow extends React.Component {

    constructor(props) {
        super(props);

        this.switchActiveImage = this.switchActiveImage.bind(this);

        this.state = {
            slideInfo: this.separateImages(this.props.images),
            images: [],
            activeImg: 0
        }
    }

    /**
     * Splits array of objects {img_url: json string array, slide_img: json string array of 0 or 1, issue: int, url: string}
     * into array of objects {img: image url, url: url of article}
     */
    separateImages(images) {

       const imageInfo = [];

       images.forEach((val) => {
            const img_url = JSON.parse(val.img_url)
            const display = JSON.parse(val.slide_img);


            img_url.filter((img, idx) => +display[idx] !== 0)
                    .forEach((img => imageInfo.push({
                        img,
                        url: `/issue/${val.issue}/story/${val.url}`
                    })))
        });

        if (imageInfo.length === 0) {

            imageInfo.push({
                img: "../images/tabc_logo.png",
                url: "/"
            });
        }

        return imageInfo;
    }

    componentWillMount() {

        const imagesWithLinks = this.state.slideInfo.map((img =>
                                  <Link to={img.url}>
                                    <img alt="" className="slideshowPic" src={img.img} />
                                  </Link>));

        this.setState({
            images: imagesWithLinks
        });

    }

    switchActiveImage(event) {

        this.setState({
            activeImg: this.state.activeImg + 1
        })

    }

    render() {


        if (!this.state.images[this.state.activeImg]) {
            return <span />
        }

        const imgClone = React.cloneElement(this.state.images[this.state.activeImg], {

           children: React.cloneElement(this.state.images[this.state.activeImg].props.children, {
               className: "slideshowPic activePic"
           }),

            onAnimationIteration: () => this.setState({
                activeImg: (this.state.activeImg + 1) % this.state.images.length
            })
        })


        return (

            <div id="slideShow">
                {imgClone}
            </div>
        );


    }
}

export default Slideshow;