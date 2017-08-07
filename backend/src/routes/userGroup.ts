import * as express from 'express';
const router = express.Router();
import Info from '../classes/Info';
import UserGroup from '../classes/UserGroup';

router.get("/", async function(req, res) {

    const InfoInstance = new Info();

    res.send(await InfoInstance.getUsersInfo());
});

router.put('/', function(req, res) {

    const UserGroupInstance = new UserGroup();
    const data = req.body;

    const levels = [[], [], []];

    data['name[]'].forEach((val, idx) => levels[data['lvl[]'][idx] - 1].push(val));

    levels.forEach((nameArr, idx) => UserGroupInstance.promote(nameArr, idx + 1, data.password));
});

router.delete('/', function(req, res) {

    const UserGroupInstance = new UserGroup();
    const data = req.body;

    UserGroupInstance.delete(data['delAcc[]'], data.password);
});
module.exports = router;