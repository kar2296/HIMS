import * as i from './Interface/Index';
import * as SequelizeStatic  from 'sequelize';
declare global {
    interface Models {
		AERegistration: SequelizeStatic.Model<i.AERegistrationInstance, i.AERegistrationAttributes>;
    AETriage: SequelizeStatic.Model<i.AETriageInstance, i.AETriageAttributes>;
    }
}
