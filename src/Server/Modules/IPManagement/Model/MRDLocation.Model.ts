import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.MRDLocationInstance, i.MRDLocationAttributes> {
    let MRDLocation = sequelize.define<i.MRDLocationInstance, i.MRDLocationAttributes>('MRDLocation', {
        Id: { type: DataTypes.BIGINT, field: 'MRDFileLocationId', primaryKey: true, autoIncrement: true },
        BarcodeId: { type: DataTypes.STRING, field: 'BarcodeId' },
        TransactionDate: { type: DataTypes.DATE, field: 'TransactionDate' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        OrganisationId: { type: DataTypes.BIGINT, field: 'OrganisationId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        PatientMrn: { type: DataTypes.STRING, field: 'PatientMrn' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        RackId: { type: DataTypes.BIGINT, field: 'RackId' },
        LocationId: { type: DataTypes.BIGINT, field: 'LocationId' },
        MRDFileStatusId: { type: DataTypes.BIGINT, field: 'MRDFileStatusId' },
        MRDMovementStatusId: { type: DataTypes.BIGINT, field: 'MRDMovementStatusId' },
        Self: { type: DataTypes.STRING, field: 'Self' },
        Reason: { type: DataTypes.STRING, field: 'Reason' },
        MisplacedReason: { type: DataTypes.STRING, field: 'MisplacedReason' },
        DamagedReason: { type: DataTypes.STRING, field: 'DamagedReason' },
        IsManual: { type: DataTypes.BOOLEAN, field: 'IsManual' },
        PriorityId: { type: DataTypes.BIGINT, field: 'PriorityId' },
        MRDTypeId: { type: DataTypes.BIGINT, field: 'MRDTypeId' },
        RequestTypeId: { type: DataTypes.BIGINT, field: 'RequestTypeId' },
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
            tableName: 'mrdfilelocation',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (MRDLocation as any).associate = function (models: Models) {
        MRDLocation.belongsTo(models.Patient);
        MRDLocation.belongsTo(models.Encounter);
        MRDLocation.hasOne(models.FileRequest, { foreignKey: 'MrdLocId' });
        MRDLocation.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
        MRDLocation.belongsTo(models.ReferenceValue,
            { as: 'MRDRequestType', foreignKey: 'RequestTypeId', targetKey: 'ReferenceValueCodeId' });
        MRDLocation.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'UpdatedBy' });
        MRDLocation.belongsTo(models.Department, { as: 'PatientDepartment', foreignKey: 'DepartmentId' });
        MRDLocation.belongsTo(models.Department, { as: 'FileLocation', foreignKey: 'LocationId' });
        MRDLocation.belongsTo(models.ReferenceValue, { as: 'PRIORITY', targetKey: 'ReferenceValueCodeId' });
        MRDLocation.belongsTo(models.ReferenceValue, { as: 'MRDFileStatus', targetKey: 'ReferenceValueCodeId' });
        MRDLocation.belongsTo(models.ReferenceValue, { as: 'MRDMovementStatus', targetKey: 'ReferenceValueCodeId' });
        MRDLocation.belongsTo(models.ReferenceValue,
            { as: 'EncounterType', foreignKey: 'MRDTypeId', targetKey: 'ReferenceValueCodeId' });
        MRDLocation.belongsTo(models.ReferenceValue,
            { as: 'FileRack', foreignKey: 'RackId', targetKey: 'ReferenceValueCodeId' });
    };

    return MRDLocation;
}
