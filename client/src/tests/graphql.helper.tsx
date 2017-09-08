import { MockedProvider } from 'react-apollo/test-utils';
import { mount } from 'enzyme';
import * as React from 'react';

import { addTypenameToDocument } from 'apollo-client';

/**
 * @return graphql data
 */
export default function mockGraphql(query: any, data: any, component: any) {

    const GraphQLMocks = [
      {
        request: {
          query: addTypenameToDocument(query)
        },
        result: {
          data
        }
      }
    ];

    const wrapper = mount(
      <MockedProvider mocks={GraphQLMocks}>
        {component}
      </MockedProvider>
    );

    return {
      wrapper
    };
}