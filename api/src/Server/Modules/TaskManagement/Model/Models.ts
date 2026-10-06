import * as i from './Interface/Index';
import * as SequelizeStatic from 'sequelize';
declare global {
    interface Models {
        TaskManagement: SequelizeStatic.Model<i.TaskManagementInstance, i.TaskManagementAttributes>;
        IncidentManagement: SequelizeStatic.Model<i.IncidentManagementInstance, i.IncidentManagementAttributes>;
    }
}
