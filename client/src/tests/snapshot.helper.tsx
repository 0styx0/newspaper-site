import * as React from 'react';
import { MemoryRouter } from 'react-router';
import * as renderer from 'react-test-renderer';

/**
 * @description since react-test-renderer doesn't call componentWillReceiveProps, this does.
 * When this is actually running (not just being tested),
 * componentWillReceiveProps will be called when graphql data is given
 *
 * @param component - jsx element with everything needed to render (i.e, all props given)
 *
 * @return result of `renderer.create` (@see react-test-renderer npm module)
 * after giving `router` context and making `componentWillReceiveProps` fire
 */
export default function renderWithProps(component: JSX.Element | any) {

        // in case componentWillMount is used in the component save it so can put back when done
        const mount = component.type.prototype.componentWillMount;

        component.type.prototype.componentWillMount = function() {

            this.componentWillReceiveProps(this.props);
        };

        // MemoryRouter gives component the router context
        const renderedComponent = renderer.create(
            <MemoryRouter>
                {component}
            </MemoryRouter>
        ).toJSON();

        component.type.prototype.componentWillMount = mount;

        return renderedComponent;
}
