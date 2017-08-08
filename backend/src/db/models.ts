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
        type: Sequelize.INTEGER,
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