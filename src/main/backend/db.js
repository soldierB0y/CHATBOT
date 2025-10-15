import {Sequelize} from 'sequelize';
export const DB = new Sequelize({
    database:'sp_up_sys',
    username:'root',
    password:'root',
    host:'localhost',
    dialect:'mysql',
})