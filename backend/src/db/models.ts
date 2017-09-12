import { sequelize } from './connection';
const Sequelize = require('sequelize'); // typescript throws errors if do es6 import
import * as validator from 'validator';

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
            is: /^[a-zA-Z]{0,3}$/
        }
    },
    l_name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            is: /^[a-zA-Z]+$/
        }
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
            validEmail(email: string) {

                const validHost = new RegExp(`^.+${process.env.USER_EMAIL_HOST === '*' ? '' : process.env.USER_EMAIL_HOST}$`);

                if (!validHost.test(email)) {
                    throw new RangeError(`Email must end with '@${process.env.USER_EMAIL_HOST}'`);
                }

                // when signing up, email will start with '.'
                const correctEmail = email[0] === '.' ? email.substr(1) : email;

                if (!validator.isEmail(correctEmail)) {
                    throw new RangeError('Invalid email');
                }
            }
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
        type: Sequelize.DATE,
        defaultValue: new Date().toISOString()
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
    setterMethods: {

        firstName: function(firstName: string) {
            this.setDataValue('f_name', firstName);
        },
        middleName: function(middleName: string | null) {
            this.setDataValue('m_name', middleName);
        },
        lastName: function(lastName: string) {
            this.setDataValue('l_name', lastName);
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
        allowNull: true // only filled when made public, so before that should be null
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
        defaultValue: Sequelize.NOW
    },
    url: {
        type: Sequelize.STRING(75),
        validate: {
            is: /^[\sa-zA-Z0-9%_-]+$/
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
        allowNull: false,
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

const TagList = sequelize.define('tag_list', {
    tag: {
        type: Sequelize.STRING(20),
        primaryKey: true,
    }
}, {

    underscored: true,
    timestamps: false,
    freezeTableName: true
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
    tag: {
        type: Sequelize.STRING(15),
        allowNull: false,
        validate: {
            is: /^[\sa-zA-Z0-9_-]+$/
        },
        references: {
            model: TagList,
            key: 'tag'
        }
    }
}, {
    underscored: true,
    timestamps: false,
    indexes: [
        {
            unique: true,
            name: 'unique_tags',
            fields: ['art_id', 'tag']
        }
    ]
});

const Images = sequelize.define('images', {
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
    url: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: {
            validImage: function(pic: string) {

                const acceptedImgFormats = ['jpg', 'jpeg', 'png', 'jif', 'jfif', 'tiff', 'tif', 'gif', 'bmp'];

                const imgFormat = (/^\//.test(pic)) ? 'data' : 'png' // data uri or local imags

                if (!/^https?/.test(pic) || // googleusercontent is just letting users use pics from google docs
                    (acceptedImgFormats.indexOf(imgFormat) == -1 && (pic.indexOf('googleusercontent') == -1))) {

                        throw new Error('Invalid Image');
                }
            }
        }
    },
    slide: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
    }
}, {
    underscored: true,
    timestamps: false
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
            pastDate(date: string) {

                if ((new Date(date)).getTime() > Date.now()) {
                    throw new Error('Cannot use future date')
                }
            }
        }
    },
}, {
    paranoid: true,
    underscored: true,
    timestamps: false
});

Articles.hasMany(Tags, { foreignKey: 'art_id' });
Articles.hasMany(Images, { foreignKey: 'art_id' });

export default sequelize;
