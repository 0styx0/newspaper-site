import React from 'react';
import {Container} from './components/Container';
import Form from './components/Form';
import {Input, Select} from './components/Input';
import tinymce from 'tinymce';
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


class Publish extends React.Component {

    constructor() {

        super();

        this.readyContentForSubmit = this.readyContentForSubmit.bind(this);

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
          valid_elements: "abbr[!title],h1,h2,h3,h4,h5,h6,img[!src,alt],p,a[!href],table,td,tr,th,tbody,thead,tfoot,strong,em,u,ul,ol,li,q,blockquote,pre,br",
          content_css: "./tinymce.css",
          paste_data_images: true,
          setup: editor => {

            this.setState({
                editor
            });
          }
        });
    }

    componentWillUnmount() {

        tinymce.remove(this.state.editor);
    }

    renderTags() {

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

        return (<Select
          label="Tags"
          props={{
              name: "type[]",
              children: tags.map(tag => <option value={tag}>{tag[0].toUpperCase() + tag.slice(1)}</option>),
              required: true,
              multiple: true
          }}
        />);
    }

    readyContentForSubmit() {


        this.setState({
            content: this.state.editor.getContent()
        });
    }

    autoFormat() {
        //todo
    }



    render() {


        return <Container
                 heading="Publish Story"
                 children={
                   <Form
                     method="post"
                     action="api/story"
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