import * as i from './Interface/Index';
import * as SequelizeStatic  from 'sequelize';
declare global {
    interface Models {
		ProcedureServices: SequelizeStatic.Model<i.ProcedureServicesInstance, i.ProcedureServicesAttributes>;
    ServiceGroupRateMapping: SequelizeStatic.Model<i.ServiceGroupRateMappingInstance, i.ServiceGroupRateMappingAttributes>;
    PatientEstimation: SequelizeStatic.Model<i.PatientEstimationInstance, i.PatientEstimationAttributes>;
    PatientEstimationDetails: SequelizeStatic.Model<i.PatientEstimationDetailsInstance, i.PatientEstimationDetailsAttributes>;
    }
}
