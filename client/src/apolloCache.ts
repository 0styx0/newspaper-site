
import { InMemoryCache } from 'apollo-cache-inmemory';

const cache = new InMemoryCache({
    dataIdFromObject: (o: { id: string }) => o.id,
    addTypename: true
});

export default cache;
