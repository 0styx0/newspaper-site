import * as React from 'react';
import Container from '../../components/Container';
import Input from '../../components/Form/Input';
import TagSelect from '../../components/TagSelect';
import Label from '../../components/Form/Label';
import FormContainer from '../../components/Form/container';

import './index.css';

interface Props {
    onSubmit: Function;
    onAutoFormat: Function;
}

function Publish(props: Props) {

    return (
        <Container heading="Publish Story">
            <FormContainer onSubmit={props.onSubmit as any}>

                <Label key="tags" value="Tags" >
                    <TagSelect
                        props={{
                            name: 'tags',
                            multiple: true,
                            required: true
                        }}
                    />
                </Label>

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

                <button key="autoformat" onClick={props.onAutoFormat as any} type="button">Auto Format</button>
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
