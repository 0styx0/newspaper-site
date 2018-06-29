import * as React from 'react';
import { Link } from 'react-router-dom';

import Slideframe from './frame';

export interface Image {
    url: string;
    img: string;
}

interface Props {
    images: Image[];
}

interface State {
    images: JSX.Element[] | Image[];
    activeImg: number;
}

export class Slideshow extends React.Component<Props, State> {

    public state: State;

    constructor(props: Props) {
        super(props);

        this.switchActiveImg = this.switchActiveImg.bind(this);

        this.state = {
            images: this.props.images,
            activeImg: 0
        };
    }

    /**
     * Puts state.img.img into <img> and wraps with <Link> pointing to img.url
     */
    componentWillMount() {

        const imagesWithLinks: JSX.Element[] = (this.state.images as Image[]).map(img => (
            <Link to={img.url}>
                <img alt="" className="slideshowPic" src={img.img} />
            </Link>
        ));

        this.setState({
            images: imagesWithLinks
        });
    }

    /**
     * Switches slideshow to next image (or loops back to first if at the end)
     */
    switchActiveImg() {

        this.setState({
                activeImg: (this.state.activeImg + 1) % this.state.images.length
            });
    }

    render() {

        const defaultImg = (
            <Link to="/">
                <img alt="Default, TABC logo" className="slideshowPic" src="../images/tabc_logo.png" />
            </Link>
        );

        const currentImg = this.state.images[this.state.activeImg] || defaultImg;

        return (
            <Slideframe
                img={currentImg as JSX.Element}
                switchImg={this.switchActiveImg}
            />
        );
    }
}

export default Slideshow;
