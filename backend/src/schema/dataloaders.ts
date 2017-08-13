
import db from '../db/models';
import * as DataLoader from 'dataloader';


const userLoader = new DataLoader(async (id) => [db.models.users.findById(id.toString())]);

export default {
    user: userLoader
}