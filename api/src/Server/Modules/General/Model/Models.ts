import * as i from './Interface/Index';
import * as SequelizeStatic  from 'sequelize';
declare global {
    interface Models {
        SequenceMasters: SequelizeStatic.Model<i.SequenceMastersInstance, i.SequenceMastersAttributes>;
        EntityPrintHistory: SequelizeStatic.Model<i.EntityPrintHistoryInstance, i.EntityPrintHistoryAttributes>;
    }
}
