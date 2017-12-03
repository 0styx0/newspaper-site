import * as React from 'react';
import NumberlineContainer from '../../components/Numberline/container';
import { Slideshow, Image } from '../../components/Slideshow';
import Preview from '../../components/Preview';
import { Article, Issue } from './shared.interfaces';
import { Helmet } from 'react-helmet';

import './index.css';

interface Props {
    articles: Article[];
    issue: Issue;
    title: string | number;
}

function MainPage(props: Props) {

    // takes all slide images and urls from all articles and flattens them into 1 array
    const slides = props.articles.reduce((accum, elt) =>

        accum.concat(elt.images.reduce((imgUrls, img) =>
            imgUrls.concat([{
                img: img.url,
                url: `/issue/${props.issue.num}/story/${elt.url}`
            }]),                       [] as Image[]))

    ,                                    [] as Image[]);

    const articlesAreFromTag = props.title === props.title.toString();

    return (
        <div>
            (
                <Helmet key={props.title}>
                    <title>{articlesAreFromTag ?
                        `Tag: ${props.title}` :
                        `Issue #${props.issue.num}: ${props.issue.name}`}
                    </title>
                    <meta
                        name="description"
                        content="Previews of articles"
                    />
                </Helmet>
            ),
            (
                <div key={props.title + 'random'}>
                    <header>
                        <h1>
                            <img src="/images/tabc_logo.png" alt="TABC Logo" />
                            Eye Of The Storm
                        </h1>
                        <q>A Clearer View Of TABC</q>
                        <h2>{articlesAreFromTag ? props.title : props.issue.name}</h2>
                    </header>
                    <div id="mainContent">
                        <Slideshow key={slides.length} images={slides} />
                        {props.articles.map(article =>
                            <Preview
                                key={article.url}
                                views={article.views}
                                lede={article.lede}
                                url={article.url}
                                issue={article.issue}
                            />)}
                    </div>
                    <NumberlineContainer max={props.issue.max} current={props.issue.num} />
                    <footer id="credits" className="small">
                        Created by <a href="https://dovidm.com">Dovid Meiseles</a> ('18)
                    </footer>
                </div>
            )
        </div>
    );

}

export default MainPage;