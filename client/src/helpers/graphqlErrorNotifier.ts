import Notification from './Notification/Notification';

export default async function (query: Function, params: Object, successMessage?: string): Promise<any> {

    return await query(params)
        .then((result: any) => {

            if (successMessage) {
                Notification({
                    body: successMessage
                });
            }

            return result;
        })
        .catch((e: Error) => {
            console.log(e);
            Notification({
                body: e.message.split(': ')[1]
            });

            // throw new Error(e.message);
        });
}