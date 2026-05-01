import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientEstimationDetailsInstance, i.PatientEstimationDetailsAttributes> {
    let PatientEstimationDetails = sequelize.define<i.PatientEstimationDetailsInstance, i.PatientEstimationDetailsAttributes>
    ('PatientEstimationDetails', {
        Id: { type: DataTypes.BIGINT,  field: 'PatientEstimationDetailsId', primaryKey: true, autoIncrement: true },
        PatientEstimationId: { type: DataTypes.BIGINT,  field: 'PatientEstimationId' },
        BedTypeId: { type: DataTypes.BIGINT,  field: 'BedTypeId' },
        Days: { type: DataTypes.INTEGER,  field: 'Days'},
        EstimationAmount: { type: DataTypes.DECIMAL,  field: 'EstimationAmount' },
        Remarks: { type: DataTypes.STRING,  field: 'Remarks' },
        Rate: { type: DataTypes.DECIMAL,  field: 'Rate' },
        ServiceGroupId: { type: DataTypes.BIGINT,  field: 'ServiceGroupId' },
        ServiceGroup: { type: DataTypes.STRING,  field: 'ServiceGroup' },
        BedTypes: { type: DataTypes.STRING,  field: 'BedTypes' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' }
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'patientestimationdetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });
        (PatientEstimationDetails as any).associate = function (models: Models) {
            PatientEstimationDetails.belongsTo(models.PatientEstimation, { as: 'PatientEstimation', foreignKey: 'PatientEstimationId' });
            PatientEstimationDetails.belongsTo(models.ServiceGroupRateMapping, { foreignKey: 'ServiceGroupId' });
            PatientEstimationDetails.belongsTo(models.ReferenceValue, {
                as: 'BedType',
                foreignKey: 'BedTypeId', targetKey: 'ReferenceValueCodeId'
            });
        };
    return PatientEstimationDetails;
}


