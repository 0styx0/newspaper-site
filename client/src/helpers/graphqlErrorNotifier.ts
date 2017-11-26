import Notification from './Notification/Notification';

export default async function (query: Function, params: Object, successMessage?: string): Promise<any> {

    return await query(params)
        .then(() => {

            if (successMessage) {
                Notification({
                    body: successMessage
                });
            }
        })
        .catch((e: Error) => {

            Notification({
                body: e.message.split(': ')[1]
            });

            throw new Error(e.message);
        });
}