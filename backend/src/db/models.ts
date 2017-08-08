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
    }
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
        type: Sequelize.STRING,
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
        }
    },
    slide_img: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: {
            isJSON: true,
            is: /\[[0-1,]*\]/
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
        type: Sequelize.INTEGER,
        validate: {
            defaultValue: 0,
            allowNull: false
        }
    },


});



// TODO: Find out how to use this
// queryInterface.addConstraint('Items', ['minor', 'major'], {
//   type: 'unique',
//   name: 'custom_unique_constraint_name'
// });
