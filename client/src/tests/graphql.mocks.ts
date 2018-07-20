import { createQuery } from './graphql.helper';
import { TagQuery } from '../graphql/tags';

const tagQueryMock = createQuery(TagQuery, { allTags: ['random', 'strings']});

export {
    tagQueryMock
};
