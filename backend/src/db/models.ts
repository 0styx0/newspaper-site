import { Sequelize } from 'sequelze';
import { sequelize } from './connection';
const Sequelize = require('sequelize'); // typescript throws errors if do es6 import
const { EMAIL_HOST } = require('../../../config.json');

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
        type: Sequelize.Date
    },
    password: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
            isLength: {
                min: 6
            }
        }
    },
    getterMethods: {
        fullName: () => {
            return `${this.f_name} ${this.m_name ? this.m_name + ' ' : ''}${this.l_name}`;
        }
    },
}, {
    underscored: true,
    timestamps: true
});


const Issues = sequelize.define('issues', {
     num: {
        type: Sequelize.UUID,
        primaryKey: true,
        autoIncrement: true
    },
    madepub: {
        type: Sequelize.Date,
        allowNull: true, // only filled when made public, so before that should be null
        validate: {
            isBefore: new Date(Date.now() + 1)
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
    },
    validate: {

        publicIssueWithName() {

            if (!this.name && this.ispublic) {
                throw new Error('Require name if issue will be public');
            }
        }
  },
},
{
    underscored: true,
    timestamps: true
});


const PageInfo = sequelize.define('pageinfo', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        autoIncrement: true
    },
    created: {
        type: Sequelize.Date,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        validate: {
            isBefore: new Date(Date.now() + 1) // doing +1 since don't know if it will otherwise mess with defaultValue
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
        validate: {
            is: /<h1>[\s\S]*<\/h1>.*<\/h4>[\s\S]*<\/h4>/
        },
    },
    body: {
        type: Sequelize.BLOB,
        allowNull: false,
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
        validate: {
            min: 0,
            defaultValue: 0,
            allowNull: false
        }
    },
    display_order: {
        type: Sequelize.INTEGER.UNSIGNED(2),
        validate: {
            defaultValue: 0,
            allowNull: false
        }
    },
    getterMethods:{

        slideImages: () => {

            const slideshowImages = this.slide_img;
            return this.img_url.filter((img: string, i: number) => !!+slideshowImages[i]);
        },
        article: () => {

            let content = this.lede + this.body;

            (this.img_url || []).forEach((img: string) => {

                if (content.indexOf("data-src") !== -1) {
                    content = content.replace('data-src', `src='${img}'`);
                }
            });
        }
    }
}, {
    paranoid: true,
    underscored: true, // consisten with preexisting fields
    timestamps: true
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
            model: PageInfo,
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
    underscored: true,
    timestamps: true
});


const Comments = sequelize.define('comments', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        autoIncrement: true
    },
    art_id: {
        type: Sequelize.UUID,
        references: {
            model: PageInfo,
            key: 'id'
        }
    },
    authorid: {
        type: Sequelize.UUID,
        references: {
            model: PageInfo,
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
        type: Sequelize.Date,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        validate: {
            isBefore: new Date(Date.now() + 1)
        }
    },
}, {
    paranoid: true,
    underscored: true,
    timestamps: true
});


Sequelize.addConstraint('Users', ['f_name', 'm_name', 'l_name'], {
  type: 'unique',
  name: 'unique_user_names'
});
Sequelize.addConstraint('Tags', ['tag1', 'tag2', 'tag3'], {
  type: 'unique',
  name: 'unique_tags'
});
Sequelize.addConstraint('PageInfo', ['url', 'issue'], {
  type: 'unique',
  name: 'unique_urls'
});