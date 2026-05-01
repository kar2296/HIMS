import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.StockConsumptionInstance, i.StockConsumptionAttributes> {
    let StockConsumption = sequelize.define<i.StockConsumptionInstance,
        i.StockConsumptionAttributes>('StockConsumption', {
            Id: { type: DataTypes.BIGINT, field: 'StockConsumptionId', primaryKey: true, autoIncrement: true },
            StockConsumptionNumber: { type: DataTypes.STRING, field: 'StockConsumptionNumber' },
            ConsumptionTypeId: { type: DataTypes.BIGINT, field: 'ConsumptionTypeId' },
            StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
            DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            ProcedureId: { type: DataTypes.BIGINT, field: 'ProcedureId' },
            DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
            Assistant: { type: DataTypes.STRING, field: 'Assistant' },
            OTComments: { type: DataTypes.STRING, field: 'OTComments' },
            StartTime: { type: DataTypes.DATE, field: 'StartTime' },
            EndTime: { type: DataTypes.DATE, field: 'EndTime' },
            LocationId: { type: DataTypes.BIGINT, field: 'LocationId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            OrganisationId: { type: DataTypes.BIGINT, field: 'OrganisationId' },
            ConsumedBy: { type: DataTypes.INTEGER, field: 'ConsumedBy' },
            ConsumptionDate: { type: DataTypes.DATE, field: 'ConsumptionDate' },
            ConsumerComments: { type: DataTypes.STRING, field: 'ConsumerComments' },
            ApprovedBy: { type: DataTypes.INTEGER, field: 'ApprovedBy' },
            ApprovedDate: { type: DataTypes.DATE, field: 'ApprovedDate' },
            ApproverComments: { type: DataTypes.STRING, field: 'ApproverComments' },
            AuthorizedBy: { type: DataTypes.INTEGER, field: 'AuthorizedBy' },
            AuthorizedDate: { type: DataTypes.DATE, field: 'AuthorizedDate' },
            AuthorizerComments: { type: DataTypes.STRING, field: 'AuthorizerComments' },
            TotalGrossAmount: { type: DataTypes.DECIMAL, field: 'TotalGrossAmount' },
            TotalNetAmount: { type: DataTypes.DECIMAL, field: 'TotalNetAmount' },
            CancelledBy: { type: DataTypes.INTEGER, field: 'CancelledBy' },
            CancelledDate: { type: DataTypes.DATE, field: 'CancelledDate' },
            ConsumptionStatusId: { type: DataTypes.INTEGER, field: 'ConsumptionStatusId' },
            Status: { type: DataTypes.INTEGER, field: 'Status' },
            Rev: { type: DataTypes.INTEGER, field: 'Rev' },
            CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        },
            {
                indexes: [],
                timestamps: true,
                tableName: 'stockconsumptions',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (StockConsumption as any).associate = function (models: Models) {
        StockConsumption.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        StockConsumption.belongsTo(models.StoreMaster, { as: 'StoreMaster', foreignKey: 'StoreMasterId' });
        StockConsumption.belongsTo(models.ReferenceValue, { as: 'ConsumptionStatus', targetKey: 'ReferenceValueCodeId' });
        StockConsumption.belongsTo(models.ReferenceValue, { as: 'ConsumptionType', targetKey: 'ReferenceValueCodeId' });
        StockConsumption.belongsTo(models.User, { as: 'ConsumedUser', foreignKey: 'ConsumedBy' });
        StockConsumption.belongsTo(models.User, { as: 'ApprovedUser', foreignKey: 'ApprovedBy' });
        StockConsumption.belongsTo(models.User, { as: 'AuthorizedUser', foreignKey: 'AuthorizedBy' });
        StockConsumption.hasMany(models.StockConsumptionDetail);
        StockConsumption.belongsTo(models.User, { as: 'CancelledUser', foreignKey: 'CancelledBy' });
        StockConsumption.belongsTo(models.Patient);
        StockConsumption.belongsTo(models.Encounter);
    };

    return StockConsumption;
}
