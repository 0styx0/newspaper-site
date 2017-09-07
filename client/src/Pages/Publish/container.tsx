import * as React from 'react';
import Publish from './';
import * as tinymce from 'tinymce';
import 'tinymce/themes/modern';
import 'tinymce/plugins/wordcount';
import 'tinymce/plugins/table';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/autoresize';
import 'tinymce/plugins/help';
import 'tinymce/plugins/image';
import 'tinymce/plugins/paste';
import 'tinymce/plugins/code';

import { ArticleCreate } from '../../graphql/article';
import { graphql, withApollo } from 'react-apollo';
import './index.css';

export interface Props { // from react router hoc
    history: string[];
    createArticle: (params: {variables: { tags: string[], article: string, url: string }}) => Promise<{
        data: {
            createArticle: {
                url: string;
                issue: number;
            }
        }
    }>;
}

interface State {
    editor?: {
        getContent: Function;
        setContent: Function;
    };
}

export class PublishContainer extends React.Component<Props, State> {

    constructor() {

        super();

        this.onSubmit = this.onSubmit.bind(this);
        this.autoFormat = this.autoFormat.bind(this);

        this.state = {
            editor: undefined
        };
    }

    /**
     * Sets up tinymce and sets state.editor to it
     */
    componentDidMount() {

        tinymce.init({

          selector: `#editor`,
          skin_url: `${process.env.PUBLIC_URL}/skins/lightgray`,
          plugins: 'wordcount table fullscreen autolink autoresize help image paste code',
          menubar: 'view help edit tools',
          valid_elements: 'abbr[!title],h1,h2,h3,h4,h5,h6,img[!src|alt],p,a[!href],table,' +
           'td,tr,th,tbody,thead,tfoot,strong,em,u,ul,ol,li,q,blockquote,pre,br',
          content_css: '/tinymce.css',
          paste_data_images: true,
          setup: (editor: {getContent: Function, setContent: Function}) => {

            this.setState({
                editor
            });
          }
        } as any);
    }

    /**
     * Removes tinymce
     */
    componentWillUnmount() {

        (tinymce as any).remove(this.state.editor);
    }

    /**
     * Sends data to server to save article
     */
    async onSubmit(target: HTMLFormElement) {

        const url = (target.querySelector('[name=name]') as HTMLInputElement).value;
        const tagList = target.querySelector('select[name=tags]') as HTMLSelectElement;
        const tags = Array.from(tagList.selectedOptions).map(elt => elt.value);

        const { data } = await this.props.createArticle({
            variables: {
                url,
                article: this.state.editor!.getContent(),
                tags
            }
        });

        const article = data.createArticle;

        this.props.history.push(`/issue/${article.issue}/story/${encodeURIComponent(article.url)}`);
    }

    /**
     * Formats article
     *
     * Replaces first tag with <h1> (title) if there isn't one already
     * Replace second tag with <h4> (author) if there isn't one already
     *
     * Also gets rid of <br />, &nbsp
     */
    autoFormat() {

        const article = this.state.editor!.getContent();

        let formattedArticle = article.replace(/([\s\n]|<br \/>|&nbsp;)+(?=(<h1>)|(<p>))/i, '');

        if (!/^<h1>([\s\S]+)<\/h1>[\s\S]*<h4>.+/.test(article)) {

            formattedArticle = formattedArticle.replace(/<(\w+)>([\s\S]+?)<\/\1>/, '<h1>$2</h1>');

            if (!/^<h1>([\s\S]+)<\/h1>[\s\S]*<h4>.+/.test(formattedArticle)) {
                formattedArticle = formattedArticle
                                   .replace(/<\/h1>[\s\S]*?<(\w+)>([\s\S]+?)<\/\1>/i, '</h1><h4>$2</h4>');
            }
        }

        this.state.editor!.setContent(formattedArticle.replace(/&nbsp;/g, ''));
    }

    render() {

        return (
            <Publish
              onAutoFormat={this.autoFormat}
              onSubmit={this.onSubmit}
            />
        );
    }
}

const PublishContainerWithData = graphql(ArticleCreate, {name: 'createArticle'})(PublishContainer as any);

export default withApollo(PublishContainerWithData);