export type {
    DataTypes, Sequelize, Model,
    Instance, QueryOptions, DestroyOptions, FindOptions, UpdateOptions, UpsertOptions, CreateOptions, WhereOptions, IncludeOptions
} from 'sequelize';
import * as SStatic from 'sequelize';
export const SequelizeStatic = SStatic;
export const _ = SStatic.Utils._;
