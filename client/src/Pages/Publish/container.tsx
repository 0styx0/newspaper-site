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
import { TagCreate } from '../../graphql/tags';
import { graphql, withApollo, compose } from 'react-apollo';
import './index.css';
import { ChangeEvent } from 'react';
import graphqlErrorNotifier from '../../helpers/graphqlErrorNotifier';
import toggler from '../../helpers/toggler';

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
    createTag: (params: { variables: { tag: string } }) => {};
}

export interface State {
    editor?: {
        getContent: () => string;
        setContent: (content: string) => void;
        content?: string;
    };
    showTagInput: boolean;
    tags: Set<string>;
}

export class PublishContainer extends React.Component<Props, State> {

    public state: State;

    constructor(props: Props) {

        super(props);

        this.onSubmit = this.onSubmit.bind(this);
        this.autoFormat = this.autoFormat.bind(this);
        this.onTagChange = this.onTagChange.bind(this);

        this.state = {
            editor: undefined,
            showTagInput: false,
            tags: new Set<string>
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
          setup: (editor: State['editor']) => {

            this.setState({
                editor
            });
          }
        });
    }

    /**
     * Removes tinymce
     */
    componentWillUnmount() {

        // tslint:disable-next-line:no-any
        (tinymce as any).remove(this.state.editor);
    }

    onTagChange(e: ChangeEvent<HTMLSelectElement>) {

        this.setState({
            showTagInput: e.target.value === 'other',
            tags: toggler(new Set([...this.state.tags]), e.target.value)
        });
    }

    /**
     * Sends data to server to save article
     */
    async onSubmit(target: HTMLFormElement) {

        const url = (target.querySelector('[name=name]') as HTMLInputElement).value;
        let tags = [...this.state.tags];

        if (this.state.showTagInput) {

            const newTag = (target.querySelector('[name=addTag]') as HTMLInputElement).value;

            await graphqlErrorNotifier(
                this.props.createTag,
                {
                    variables: {
                        tag: newTag
                    }
                },
                'tagCreated'
            );

            tags = tags.filter(tag => tag !== 'other');
            tags.push(newTag);
        }

        const { data } = await graphqlErrorNotifier(
            this.props.createArticle,
            {
                variables: {
                    url,
                    article: this.state.editor!.getContent(),
                    tags
                }
            }
        );

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
              onTagChange={this.onTagChange}
              showTagInput={this.state.showTagInput}
              onAutoFormat={this.autoFormat}
              onSubmit={this.onSubmit}
            />
        );
    }
}

const PublishContainerWithData = compose(
    graphql(ArticleCreate, {name: 'createArticle'}),
    graphql(TagCreate, {name: 'createTag'}),
)(PublishContainer);

export default withApollo(PublishContainerWithData as any) as any;
