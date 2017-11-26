import Notification from './Notification/Notification';

export default async function (query: Function, params: Object): Promise<any> {

    return await query(params)
        .catch((e: Error) => {
            
            Notification({
                body: e.message.split(': ')[1]
            });

            throw new Error(e.message);
        });
}