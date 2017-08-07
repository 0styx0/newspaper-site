import * as React from 'react';
import Container from '../../components/Container';
import FormContainer from '../../components/Form/container';
import Input from '../../components/Form/Input';
import TagSelect from '../../components/TagSelect';
import Label from '../../components/Form/Label';
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

import './index.css';

interface Props { // from react router hoc
    history: string[];
}

interface State {
    editor: any;
    content: string;
};

class Publish extends React.Component<Props, State> {

    constructor() {

        super();

        this.readyContentForSubmit = this.readyContentForSubmit.bind(this);
        this.autoFormat = this.autoFormat.bind(this);
        this.redirect = this.redirect.bind(this);

        this.state = {
            editor: null,
            content: ''
        };
    }

    componentDidMount() {

        tinymce.init({

          selector: `#editor`,
          skin_url: `${process.env.PUBLIC_URL}/skins/lightgray`,
          plugins: 'wordcount table fullscreen autolink autoresize help image paste code',
          menubar: "view help edit tools",
          valid_elements: "abbr[!title],h1,h2,h3,h4,h5,h6,img[!src|alt],p,a[!href],table,td,tr,th,tbody,thead,tfoot,strong,em,u,ul,ol,li,q,blockquote,pre,br",
          content_css: "/tinymce.css",
          paste_data_images: true,
          setup: (editor: HTMLElement) => {

            this.setState({
                editor
            });
          }
        } as any);
    }

    componentWillUnmount() {

        (tinymce as any).remove(this.state.editor);
    }

    renderTags() {

        return (
            <Label
              value="Tags"
              children={
                <TagSelect
                    props={{
                        name: "type[]",
                        multiple: true,
                        required: true
                    }}
                />
              }
            />
            );
    }

    readyContentForSubmit() {


        this.setState({
            content: this.state.editor!.getContent()
        });
    }

    autoFormat() {

        const article = this.state.editor.getContent()

        let formattedArticle = article.replace(/([\s\n]|<br \/>|&nbsp;)+(?=(<h1>)|(<p>))/i, "");

        if (!/^<h1>([\s\S]+)<\/h1>[\s\S]*<h4>.+/.test(article)) {

            formattedArticle = formattedArticle.replace(/<(\w+)>([\s\S]+?)<\/\1>/, "<h1>$2</h1>");

            if (!/^<h1>([\s\S]+)<\/h1>[\s\S]*<h4>.+/.test(formattedArticle)) {
                formattedArticle = formattedArticle.replace(/<\/h1>[\s\S]*?<(\w+)>([\s\S]+?)<\/\1>/i, "<h4>$2</h4>");
            }
        }

        this.state.editor.setContent(formattedArticle.replace(/&nbsp;/g, ""));
    }

    redirect(method: string, json: Object, submissionResult: {url: string}) {

        if (submissionResult.url) {

            this.props.history.push(submissionResult.url)
        }
    }

    render() {


        return <Container
                 heading="Publish Story"
                 children={
                   <FormContainer
                     method="post"
                     action="/api/story"
                     onSubmit={this.redirect}
                     children={
                         <div>
                            {this.renderTags()}
                            <Input
                              label="Page Name"
                              abbr={`This article will be located at tabceots.com/issue/n/story/name_you_enter
                                      (where n is the issue number). Can be up to 75 characters long
                                      (some non-word characters such as spaces may count as more).`}
                              props={{
                                name: "name",
                                type: "text",
                                autoFocus: true,
                                title: "Must only contain letters, numbers, -, _, and spaces",
                                required: true,
                                pattern: "^[\\sa-zA-Z0-9_-]+$",
                                maxLength: 75,
                                placeholder: "mystory"
                              }}
                            />

                           <button onClick={this.autoFormat} type="button">Auto Format</button>
                           <textarea name="txtArea" className="changed" value={this.state.content} id="editor" />

                           <input type="submit" onClick={this.readyContentForSubmit} className="submit" name="create" value="Submit" />
                         </div>
                     }
                   />
                 }
               />
    }
}

export default Publish;