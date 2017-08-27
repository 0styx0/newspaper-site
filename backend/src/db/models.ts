import { sequelize } from './connection';
const Sequelize = require('sequelize'); // typescript throws errors if do es6 import
import config from '../../config';
const EMAIL_HOST = config.EMAIL_HOST;

const Users = sequelize.define('users', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
            is: /^[a-zA-Z]+$/
        }
    },
    f_name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            is: /^[a-zA-Z]+$/
        }
    },
    m_name: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
            is: /^[a-zA-Z]{0, 3}$/
        }
    },
    l_name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            is: /^[a-zA-Z]$/
        }
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
            is: [`^.+${EMAIL_HOST === '*' ? '' : EMAIL_HOST}$`],
        }
    },
    level: {
        type: Sequelize.INTEGER.UNSIGNED,
        validate: {
            min: 1,
            max: 3
        },
        allowNull: false,
        defaultValue: 1
    },
    notifications: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
    },
    two_fa_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    auth: {
        type: Sequelize.TEXT
    },
    auth_time: {
        type: Sequelize.DATE
    },
    password: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
            isLength: {
                min: 6
            }
        }
    }
}, {
    getterMethods: {
        fullName: function() {
            return `${this.f_name} ${this.m_name ? this.m_name + ' ' : ''}${this.l_name}`;
        }
    },
    underscored: true,
    timestamps: false,
    indexes: [
        {
            unique: true,
            name: 'unique_names',
            fields: ['f_name', 'm_name', 'l_name']
        }
    ]
});


const Issues = sequelize.define('issues', {
     num: {
        type: Sequelize.UUID,
        primaryKey: true,
        autoIncrement: true
    },
    madepub: {
        type: Sequelize.DATE,
        allowNull: true, // only filled when made public, so before that should be null
        validate: {
            isBefore: new Date(Date.now() + 1).toISOString()
        }
    },
    name: {
        type: Sequelize.STRING,
        validate: {
            is: /^[\sa-zA-Z0-9_-]+$/
        },
        allowNull: false
    },
    ispublic: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
},
{
    validate: {

        publicIssueWithName() {

            if (!this.name && this.ispublic) {
                throw new Error('Require name if issue will be public');
            }
        }
    },
    underscored: true,
    timestamps: false
});


const Articles = sequelize.define('pageinfo', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        autoIncrement: true
    },
    created: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        validate: {
            isBefore: new Date(Date.now() + 1).toISOString() // doing +1 since don't know if it will otherwise mess with defaultValue
        }
    },
    url: {
        type: Sequelize.STRING(75),
        validate: {
            is: /^[\sa-zA-Z0-9_-]+$/
        },
        allowNull: false
    },
    lede: {
        type: Sequelize.BLOB,
        allowNull: false,
        // validate: {
        //     is: /<h1>[\s\S]*<\/h1>.*<\/h4>[\s\S]*<\/h4>/
        // },
    },
    body: {
        type: Sequelize.BLOB,
        // allowNull: false,
        validate: {
            isLength: {
                min: 50 // random number, just don't want articles too short
            }
        },
    },
    img_url: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: {
            isJSON: true,
            validImage: function(pics: string) {

                const acceptedImgFormats = ['jpg', 'jpeg', 'png', 'jif', 'jfif', 'tiff', 'tif', 'gif', 'bmp'];

                for (let pic of JSON.parse(pics)) {

                    const imgFormat = (/^\//.test(pic)) ? 'data' : 'png' // data uri or local imags

                    if (!/^https?/.test(pic) || // googleusercontent is just letting users use pics from google docs
                      (acceptedImgFormats.indexOf(imgFormat) == -1 && (pic.indexOf('googleusercontent') == -1))) {

                            throw new Error('Invalid Image');
                    }
                }
            }
        },
        get() {
            return JSON.parse(this.getDataValue('img_url'));
        }
    },
    slide_img: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: {
            isJSON: true,
            is: /\[[0-1,]*\]/
        },
        get() {
            return JSON.parse(this.getDataValue('slide_img'));
        }
    },
    issue: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        validate: {
            min: 0
        },
        references: {
            // This is a reference to another model
            model: Issues,
            // This is the column name of the referenced model
            key: 'num',
        }
    },
    authorid: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            // This is a reference to another model
            model: Users,
            // This is the column name of the referenced model
            key: 'id',
        }
    },
    views: {
        type: Sequelize.INTEGER.UNSIGNED,
        defaultValue: 0,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    display_order: {
        type: Sequelize.INTEGER(2).UNSIGNED,
        defaultValue: 0,
        allowNull: false
    }
}, {
    getterMethods: {

        slideImages: function() {

            const slideshowImages = this.slide_img;
            return this.img_url.filter((img: string, i: number) => !!+slideshowImages[i]);
        }
    },
    setterMethods: {

        /**
         * Splits up an article into lede, body, slide_img, and img_url
         */
        article(article: string) {

            const { modifiedArticle, img_url, slide_img } = separatePics(article);

            const firstParagraph = (modifiedArticle.match(/[^\/>]<\/p>/) || modifiedArticle.match(/<\/p>/)!)[0];

            const lede = modifiedArticle.substring(0, article.indexOf(firstParagraph) + 5);

            let body = modifiedArticle.substring(article.indexOf(firstParagraph) + 5);
            
            this.setDataValue('lede', lede);
            this.setDataValue('body', body);
            this.setDataValue('img_url', JSON.stringify(img_url));
            this.setDataValue('slide_img', JSON.stringify(slide_img));
        }
    },
    paranoid: true,
    underscored: true, // consisten with preexisting fields
    timestamps: false,
    freezeTableName: true,
    indexes: [
        {
            unique: true,
            name: 'unique_urls',
            fields: ['url', 'issue']
        }
    ]
});

const Tags = sequelize.define('tags', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        autoIncrement: true
    },
    art_id: {
        type: Sequelize.UUID,
        references: {
            model: Articles,
            key: 'id'
        }
    },
    tag1: {
        type: Sequelize.STRING(15),
        allowNull: false,
        validate: {
            is: /^[\sa-zA-Z0-9_-]+$/
        },
    },
    tag2: {
        type: Sequelize.STRING(15),
        allowNull: true,
        validate: {
            is: /^[\sa-zA-Z0-9_-]+$/
        },
    },
    tag3: {
        type: Sequelize.STRING(15),
        allowNull: true,
        validate: {
            is: /^[\sa-zA-Z0-9_-]+$/
        },
    }
}, {
    setterMethods: {

        all(tags: string[]) {

            ['tag1', 'tag2', 'tag3'].forEach((col, i) => this.setDataValue(col, tags[i]));
        }
    },
    underscored: true,
    timestamps: false,
    indexes: [
        {
            unique: true,
            name: 'unique_tags',
            fields: ['tag1', 'tag2', 'tag3']
        }
    ]
});


sequelize.define('comments', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        autoIncrement: true
    },
    art_id: {
        type: Sequelize.UUID,
        references: {
            model: Articles,
            key: 'id'
        }
    },
    authorid: {
        type: Sequelize.UUID,
        references: {
            model: Users,
            key: 'id'
        }
    },
    content: {
        type: Sequelize.STRING(500),
        allowNull: false,
        validate: {
            isLength: {
                min: 4 // random number, just don't want comments too short
            }
        },
    },
    created: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        validate: {
            isBefore: new Date(Date.now() + 1).toISOString()
        }
    },
}, {
    paranoid: true,
    underscored: true,
    timestamps: false
});

Articles.hasOne(Tags, { foreignKey: 'art_id' });


/**
 *
 * @return {
 *  slide_img - (0 | 1)[] if img_url corresponding to it can be in slideshow in frontend's MainPage
 *  img_url - array of img urls taken from `article`'s `img src`s
 *  modifiedArticle - `article`, but with all <img> `src` replaced with `data-src`
 * }
 */
function separatePics(article: string) {

    const img_url: string[] = [];
    let match: RegExpExecArray | null;
    const regex = /src='([^']+)'/gi;


    while ((match = regex.exec(article)) !== null) {
        img_url.push(match[1]);
    }

    const slide_img = (new Array(Math.max(0, img_url.length))).fill(1);

    const modifiedArticle = article.replace(/src='[^']+'/gi, 'data-src');

    const images = article.match(/<img.[^>]+/gi) || [];

    for (let i = 0; i < images.length; i++) {

        if (images[i].indexOf('previewHidden') != -1) {
            slide_img[i] = 0;
        }
    }

    return {
        modifiedArticle,
        img_url,
        slide_img
    }
}


export default sequelize;