import * as faker from 'faker';

import * as fs from 'fs-extra';
const mysql = require('mysql2/promise');

import * as dotenv from 'dotenv-safe';

dotenv.load({
  path: './tests/.env'
});

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

interface User {
    id: number;
    username: string;
    f_name: string;
    m_name: string | null;
    l_name: string;
    password: string;
    email: string;
    level: number;
    auth: string;
    auth_time: string; // iso date
    notifications: number;
    two_fa_enabled: number;
}

interface TagList {
    tag: string;
}

interface Issue {
    num: number;
    ispublic: number;
    name: string;
    madepub: string; // iso date
}

interface Pageinfo {
    id: number;
    created: string; // iso date
    url: string;
    lede: string;
    body: string;
    issue: number;
    authorid: number;
    views: number;
    display_order: number;
}

interface Image {
    id: number;
    slide: number;
    url: string;
}

interface Tag {
    id: number;
    tag: string;
    art_id: number;
}

interface Comment {
    id: number;
    art_id: number;
    authorid: number;
    content: string;
    created: string; // iso date
}

interface Database {
    users: User[];
    tagList: TagList[];
    issues: Issue[];
    pageinfo: Pageinfo[];
    images: Image[];
    tags: Tag[];
    comments: Comment[];
}

const randomNumber = () => Math.max(1, faker.random.number(100));

export default class TestDatabase {

    asyncDB: any;
    initialized = false;

    constructor() {

        Object.keys(this.tables.generate)
        .forEach(property =>
          this.tables.generate[property] = this.tables.generate[property].bind(this));

        Object.keys(this.mock)
        .forEach(property =>
          this.mock[property] = this.mock[property].bind(this));
    }

    async connect() {

        await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            multipleStatements: true
        }).then((asyncDB: {query: Function}) => {
            this.asyncDB = asyncDB
        });
    }

    /**
     * Creates database with name given in @see .env process.env.DB_TEST_NAME
     */
    async create() {

        console.log('Initializing database...');

        const schema = await fs.readFile(__dirname + '/../../../schema.sql', 'utf8').catch(err => {
            console.warn(err);
            process.abort();
            return;
        });

        await this.asyncDB.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        await this.asyncDB.query(`USE ${process.env.DB_NAME}`).then(() => console.log('here'));
        return await this.asyncDB.query(schema).then(() => {

            console.log('Database created...');
        });
    }

    async insertMockData() {

        const data = this.mock.all();

        return Promise.all(Object.keys(data).map(table => {

            console.log('Inserting into table', table);

            if (!data[table][0]) {
                console.log('No data for table', table);
                return;
            }

            const fields = Object.keys(data[table][0]).join(',');

            const valuesArr = data[table].reduce((accum, row) => accum.concat('"' + Object.values(row).join('","') + '"'), []);

            const values = `(${valuesArr.join('),(')})`;

            return this.asyncDB.query(`INSERT INTO ${table} (${fields}) VALUES ${values}`).catch(e => {
                console.warn(e);
                console.warn('Error in table', table);
                console.log(`INSERT INTO ${table} (${fields})`);
                process.exit(1);
            });
        }));
    }

    async drop() {
        await this.asyncDB.query(`DROP DATABASE ${process.env.DB_NAME}`);
        console.log('Database dropped');
    }

    async init() {

        await this.connect();
        await this.create();
        return await this.insertMockData();
    }

    /**
     * Each of the following map to their respective table in the database and generate info for that table
     * (to the extent that they can, since some have foreign keys of others)
     */
    tables = {

        generate: {

            user() {

                return {
                    id: faker.random.number(),
                    username: faker.internet.userName(),
                    f_name: faker.name.firstName(),
                    m_name: faker.random.boolean() ? faker.name.prefix() : null,
                    l_name: faker.name.lastName(),
                    password: faker.internet.password(),
                    email: faker.internet.email(),
                    level: faker.random.arrayElement([1, 2, 3]),
                    auth: faker.internet.password(),
                    auth_time: faker.date.past().toISOString().slice(0, 19).replace('T', ' '),
                    notifications: +faker.random.boolean(),
                    two_fa_enabled: +faker.random.boolean()
                }
            },

            tag_list() {

                return {
                    tag: faker.random.word().substr(0, 6) // `tag` col is varchar(10), plus unique numbers appended later
                }
            },

            issue() {

                return {
                    // num should be autoincrement. The current value is a placeholder that will be replaced
                    num: randomNumber(),
                    ispublic: 1,
                    // 15 is so don't cut off by varchar length and have room for number to make unique
                    name: faker.name.title().substr(0, 15),
                    madepub: faker.date.past().toISOString().slice(0, 19).replace('T', ' ')
                }
            },

            pageinfo() {

                return {
                    id: faker.random.number(),
                    created: faker.date.past().toISOString().slice(0, 19).replace('T', ' '),
                    url: faker.internet.url(),
                    lede: `
                    <h1>${faker.lorem.word()}</h1>
                    <h4>${faker.name.findName()}</h4>
                    <p>${faker.lorem.paragraph()}</p>`,
                    body: faker.lorem.paragraphs(randomNumber()),
                    issue: randomNumber(), // Placeholder. from issue.num
                    authorid: faker.random.number(), // Placeholder. get from user.id
                    views: randomNumber(),
                    display_order: randomNumber()
                }
            },

            image() {

                return {
                    id: faker.random.number(),
                    art_id: faker.random.number(), // pageinfo.id
                    slide: +faker.random.boolean(),
                    url: faker.image.imageUrl()
                }
            },

            tag() {

                return {
                    id: faker.random.number(),
                    tag: '', // from tag_list.tag
                    art_id: faker.random.number() // from pageinfo.id
                }
            },

            comment() {

                return {
                    id: faker.random.number(),
                    art_id: faker.random.number(), // from pageinfo.id
                    authorid: faker.random.number(), // from user.id
                    content: faker.lorem.lines(),
                    created: faker.date.past().toISOString().slice(0, 19).replace('T', ' ')
                }
            }
        },

        values: {

            /**
             * Store mock data. Mirrors db table names
             */
            users: [] as User[],
            tags: [] as Tag[],
            tag_list: [] as TagList[], // tag_list
            pageinfo: [] as Pageinfo[],
            images: [] as Image[],
            comments: [] as Comment[],
            issues: [] as Issue[],
        }
    }

    mock = {

        /**
         * The following methods must be called in the order defined for foreign keys to work
         */

        /**
         * Puts array of `user` objects which can be inserted into database, into this.users
         */
        users(amount = randomNumber()) {

            const users: User[] = [];

            while (amount-- > 0) {
                const user = this.tables.generate.user();
                user.id = amount;
                user.username += amount;
                user.f_name += amount;
                users.push(user);
            }

            this.tables.values.users = users;
            return users;
        },

        issues(amount = randomNumber()) {

            const issues: Issue[] = [];

            while (amount-- > 0) {

                const issue = this.tables.generate.issue();
                issue.num = amount + 1;
                issue.name += amount;

                issues.push(issue);
            }

            issues[0].ispublic = 0;

            this.tables.values.issues = issues;
            return issues;
        },

        pageinfo(amount = randomNumber()) {

            const pageinfos: Pageinfo[] = [];
            const issuesUsed = new Set<number>();

            while (amount-- > 0) {

                const pageinfo = this.tables.generate.pageinfo();
                pageinfo.id = amount;

                if (issuesUsed.size < this.tables.values.issues.length) {
                    pageinfo.issue = amount;
                    issuesUsed.add(amount);
                } else {
                    pageinfo.issue = faker.random.number(this.tables.values.issues.length);
                }

                pageinfo.authorid = faker.random.arrayElement(this.tables.values.users).id
                pageinfo.url += '/' + pageinfos.length;

                pageinfos.push(pageinfo);
            }

            this.tables.values.pageinfo = pageinfos;
            return pageinfos;
        },

        tag_list(amount = randomNumber()) {

            const tagList = new Set<string>();

            while (amount-- > 0) {

                tagList.add(this.tables.generate.tag_list().tag + amount);
            }

            this.tables.values.tag_list = [...tagList].map(tag => ({ tag }));

            return this.tables.values.tag_list
        },

        /**
         * Gives random amount of tags to all pageinfo
         */
        tags() {

            const tags = new Set<Tag>();

            this.tables.values.pageinfo.forEach(article => {

                let numberOfTags = faker.random.number(this.tables.values.tag_list.length);
                const unusedTags = new Set([...this.tables.values.tag_list].map(list => list.tag));

                while (unusedTags.size - numberOfTags > 0) {

                    const tag = faker.random.arrayElement([...unusedTags]);

                    tags.add(Object.assign(this.tables.generate.tag(), {
                        art_id: article.id,
                        id: tags.size + '0' + article.id,
                        tag
                    }));

                    unusedTags.delete(tag);
                }
            });

            this.tables.values.tags = [...tags];
            return this.tables.values.tags
        },

        comments() {

            const comments = new Set<Comment>();

            this.tables.values.pageinfo.forEach(article => {

                let numberOfComments = randomNumber();

                while (numberOfComments-- > 0) {

                    comments.add(Object.assign(this.tables.generate.comment(), {
                        art_id: faker.random.arrayElement(this.tables.values.pageinfo).id,
                        id: comments.size,
                        authorid: faker.random.arrayElement(this.tables.values.users).id
                    }));
                }
            });

            this.tables.values.comments = [...comments];
            return this.tables.values.comments
        },

        images() {

            const images = new Set<Image>();

            this.tables.values.pageinfo.forEach((article, i) => {

                if (faker.random.boolean) {

                    for (let j = 0, amount = randomNumber(); j < amount; j++) {

                        images.add(Object.assign(this.tables.generate.image(), {
                            id: images.size,
                            art_id: article.id,
                        }));

                        article.body += `<img data-src />`;
                    }
                }
            });

            this.tables.values.images = [...images];
            return this.tables.values.images
        },

        all() {

            const allMocks = {} as Database;

            console.log('Starting...');

            const mocks = Object.keys(this.mock);
            mocks.pop(); // stops recursion

            mocks.forEach(mock => {

                console.log(`Working on ${mock}`);
                const data = this.mock[mock]();

                allMocks[mock] = data;
            });

            console.log('Completed');
            return allMocks;
        }
    }
};

