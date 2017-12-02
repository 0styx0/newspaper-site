import Notification from './Notification/Notification';

export default async function (query: Function, params: Object, successMessage?: string) {

    return await query(params)
        .then(result => {

            if (successMessage) {
                Notification({
                    body: successMessage
                });
            }

            return result;
        })
        .catch((e: Error) => {

            Notification({
                body: e.message.split(': ')[1]
            });

            throw new Error(e.message);
        });
}