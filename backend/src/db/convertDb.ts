// use this to change tabceots.com's database

import db from './models';


splitPageinfoToImages();
chopTags();
tagsToEnums();

async function splitPageinfoToImages() {

    const tableCreate = `CREATE TABLE IF NOT EXISTS images
                (
                id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
                slide BOOLEAN DEFAULT 1,
                art_id INTEGER NOT NULL,
                url VARCHAR(255),
                FOREIGN KEY (art_id) REFERENCES pageinfo(id)
                );`;

    await db.query(tableCreate);

    const rowsQuery = 'SELECT img_url AS url, id AS art_id, slide_img AS slide FROM pageinfo';

    const rows = (await db.query(rowsQuery))[0];

    rows.forEach(row => {

        const slide_img = JSON.parse(row.slide);

        JSON.parse(row.url.toString('utf8')).forEach((image, i) => {

            const insert = `INSERT INTO images (url, art_id, slide) VALUES("${image}", ${row.art_id}, "${slide_img[i]}")`;
            db.query(insert);
        });
    });

    const deletions = `ALTER TABLE pageinfo DROP slide_img, DROP img_url`;
    db.query(deletions);
}

async function chopTags() {

    const tableCreate = `CREATE TABLE IF NOT EXISTS tags1
                (
                id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
                tag VARCHAR(10),
                art_id INTEGER NOT NULL,
                FOREIGN KEY (art_id) REFERENCES pageinfo(id)
                UNIQUE KEY unique_tags (art_id, tag)
                );`;

    await db.query(tableCreate);

    for (let i = 1; i < 4; i++) {

        const tagsQuery = `SELECT tag${i} AS tag, art_id FROM tags WHERE tag${i} IS NOT NULL`;

        const tags = (await db.query(tagsQuery))[0];

        tags.forEach(tag => db.query(`INSERT INTO tags1 (tag, art_id) VALUES("${tag.tag}", ${tag.art_id})`));
    }

    await db.query('DROP TABLE tags');

    db.query('RENAME TABLE `tags1` TO `tags`');

}

async function tagsToEnums() {

    (async function createListTable() {

        await db.query(`CREATE TABLE IF NOT EXISTS tag_list
                    (
                        tag VARCHAR(20) PRIMARY KEY
                    );`);

        const uniqueTags = (await db.query(`SELECT DISTINCT tag FROM tags`))[0];
        uniqueTags.forEach(async tag => await db.query(`INSERT INTO tag_list (tag) VALUES("${tag.tag}")`));
    })()

    await db.query(`CREATE TABLE IF NOT EXISTS tags1
                (
                    id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
                    tag VARCHAR(10),
                    art_id INTEGER NOT NULL,
                    FOREIGN KEY (art_id) REFERENCES pageinfo(id),
                    FOREIGN KEY (tag) REFERENCES tag_list(tag),
                    UNIQUE KEY unique_tags (art_id, tag)
                );`);


    const tagsQuery = `SELECT tag, art_id FROM tags`;

    const tags = (await db.query(tagsQuery))[0];

    tags.forEach(tag => db.query(`INSERT INTO tags1 (tag, art_id) VALUES("${tag.tag}", ${tag.art_id})`));

    await db.query('DROP TABLE tags');

    db.query('RENAME TABLE `tags1` TO `tags`');
}
