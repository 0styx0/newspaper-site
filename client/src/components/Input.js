import React from 'react';

/**
 * @prop label, children, abbr, required @see Select
 *
 * @return html label as parent to props.children with text of prop.value concatted with ': ',
   if abbr is given, that's put in too, and if required is given, a red asterisk is put in too
 */
function Label(props) {

    const label = props.value + ": ";

    return (
        <label>{label}
            {props.children}
            {!!props.required ? <span className="danger">*</span> : ""}
            {!!props.abbr ? <Hint title={props.abbr} /> : ""}
        </label>
    )
}

class Hint extends React.Component {

    constructor() {
        super();

        this.state = {
            reveal: false
        };
    }

    render() {

        if (this.state.reveal) {

            return (
                <span>
                    <abbr onClick={() => this.setState({reveal: false})} title={this.props.title}>?</abbr>
                    <br />
                    <div className="abbrMessage">{this.props.title}</div>
                </span>
                )
        }
        else {

            return (<abbr onClick={() => this.setState({reveal: true})} title={this.props.title}>?</abbr>)
        }
    }
}

/**
 * @prop label, required, name, children - @see Select
 * @prop abbr - optional text for abbr elt if want to give user a hint about the input
 * @prop props - json of any native attr wanted
 *
 * @return input elt wrapped in a @see Label
 */

function Input(props) {

    const input = React.cloneElement(<input />, props.props);

    return (
        <Label
        value={props.label}
        required={!!props.props.required}
        abbr={props.abbr}

        children={
            input
        }

        />
    );
}

/**
 * @prop label - string, contents of label element
 * @prop required - if it exists, the select gets `required attribute
 * @prop name - name of select
 * @prop className - class
 * @prop children - option elements
 */
function Select(props) {

    const select = React.cloneElement(<select/>, props.props);

    return (
        <Label
            value={props.label}
            required={!!props.props.required}
            children={
                select
            }
        />
    );
}

// Form's onChange doesn't fire if defaultChecked is true and then uncheck box, so creating this
class Checkbox extends React.Component {

    constructor() {
        super();

        this.handleToggles = this.handleToggles.bind(this);

        this.state = {
            checked: null
        }
    }

    handleToggles(e) {

        e.target.classList.add("changed")

        this.setState({
            value: e.target.checked ? "true" : ''
        });
    }
    
    render() {

        const checkbox = React.cloneElement(<input />, this.props);

        return React.cloneElement(checkbox, {
            value: this.state.value,
            onClick: this.handleToggles,
            type: "checkbox"
        });
    }
}

/**
 * Creates 2 inputs - one that's hidden and one that's not, with the same value
 * When the visible one changes, both get the .changed class which allows them to be submitted
 *
 * @prop original - element to copy off of and return together with copy
 * @prop props - json with any extra properties for hidden elt. Must include name
 */
class SecretTwins extends React.Component {

    constructor() {
        super();

        this.mirror = this.mirror.bind(this);

        this.state = {
            className: ''
        }
    }

    mirror() {
        this.setState({className: 'changed'});
    }

    render() {

        const original = React.cloneElement(this.props.original, {onChange: this.mirror});

        const originProps = this.props.original.props;

        const copy = <input
                        type="hidden"
                        name={this.props.name}
                        value={this.props.value || originProps.value}
                        formMethod={originProps.formMethod}
                        className={this.state.className}
                      />

        const copyWithCustom = React.cloneElement(copy, this.props.props);

        return (
            <div>
                {original}
                {copyWithCustom}
            </div>
        )
    }
}

export {
    Input,
    Select,
    SecretTwins,
    Checkbox
};