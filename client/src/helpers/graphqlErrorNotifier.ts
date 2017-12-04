import Notification from './Notification/Notification';
import notifyUserOf from './Notification';

/**
 *
 * @param query - graphql query
 * @param params - to pass into query
 * @param successMessage - what to tell user if query does not return an error.
 *  Must be a key to @see ./Notification `messages`
 */
export default async function (query: Function, params: Object, successMessage?: string) {

    return await query(params)
        .then(result => {

            if (successMessage) {
                notifyUserOf(successMessage);
            }

            return result;
        })
        .catch((e: Error) => {

            Notification({
                body: e.message.match(/^.+:(.+)$/)![1]
            });

            throw new Error(e.message);
        });
}