import * as React from 'react';
import Container from '../../components/Container';
import Input from '../../components/Form/Input';
import TagSelect from '../../components/TagSelect';
import Label from '../../components/Form/Label';
import FormContainer from '../../components/Form/container';
import { ChangeEvent, MouseEvent } from 'react';
import { Helmet } from 'react-helmet';
import './index.css';
import { getJWT } from '../../helpers/jwt/index';

interface Props {
    onSubmit: Function;
    onAutoFormat: (e: MouseEvent<HTMLButtonElement>) => void;
    onTagChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    showTagInput: boolean;
}

function Publish(props: Props) {

    const defaultTags = getJWT().level > 1 ? ['other'] : [];

    return (
        <Container heading="Publish Story">

            <Helmet>
                <title>Publish</title>
                <meta
                    name="description"
                    content="Publish an article"
                />
            </Helmet>

            <FormContainer onSubmit={props.onSubmit}>

                <Label key="tags" value="Tags" >
                    <TagSelect
                        tags={defaultTags}
                        props={{
                            name: 'tags',
                            multiple: true,
                            required: true,
                            onChange: props.onTagChange
                        }}
                    />
                </Label>

                { props.showTagInput && getJWT().level > 1 ?
                    (
                        <Input
                          key="addTag"
                          label="Custom Tag"
                          props={{
                              name: 'addTag',
                              type: 'text'
                          }}
                        />
                    )
                  :
                  <span key="nothing" />
                }

                <Input
                    key="url"
                    label="Page Name"
                    abbr={`This article will be located at tabceots.com/issue/n/story/name_you_enter
                            (where n is the issue number). Can be up to 75 characters long
                            (some non-word characters such as spaces may count as more).`}
                    props={{
                        name: 'name',
                        type: 'text',
                        autoFocus: true,
                        title: 'Must only contain letters, numbers, -, _, and spaces',
                        required: true,
                        pattern: '^[\\sa-zA-Z0-9_-]+$',
                        maxLength: 75,
                        placeholder: 'mystory'
                    }}
                />

                <button key="autoformat" onClick={props.onAutoFormat} type="button">Auto Format</button>
                <textarea key="txtArea" name="txtArea" className="changed" id="editor" />

                <input
                  key="submit"
                  type="submit"
                  className="submit"
                  name="create"
                  value="Submit"
                />
            </FormContainer>
        </Container>
    );
}

export default Publish;
