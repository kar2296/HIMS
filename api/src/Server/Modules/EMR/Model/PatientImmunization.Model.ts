import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientImmunizationInstance, i.PatientImmunizationAttributes> {
    let PatientImmunization = sequelize.define<i.PatientImmunizationInstance, i.PatientImmunizationAttributes>('PatientImmunization', {
        Id: { type: DataTypes.BIGINT, field: 'PatientImmunizationId', primaryKey: true, autoIncrement: true },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        ImmunizationId: { type: DataTypes.BIGINT, field: 'ImmunizationId' },
        ImmunizationName: { type: DataTypes.STRING, field: 'ImmunizationName' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        ImmunizationTypeId: { type: DataTypes.BIGINT, field: 'ImmunizationTypeId' },
        CVXCode: { type: DataTypes.STRING, field: 'CVXCode' },
        UOM: { type: DataTypes.STRING, field: 'UOM' },
		    RouteId: { type: DataTypes.BIGINT, field: 'RouteId' },
        AgeFrom: { type: DataTypes.INTEGER, field: 'AgeFrom' },
        AgeTo: { type: DataTypes.INTEGER, field: 'AgeTo' },
        TotalDosageCount: { type: DataTypes.INTEGER, field: 'TotalDosageCount' },
        ImmunizationStatusId: { type: DataTypes.BIGINT, field: 'ImmunizationStatusId' },
        ImmunizationAdministrationTypeId: { type: DataTypes.BIGINT, field: 'ImmunizationAdministrationTypeId' },
        AdministeredById: { type: DataTypes.BIGINT, field: 'AdministeredById' },
        AdministeredBy: { type: DataTypes.STRING, field: 'AdministeredBy' },
       Location: { type: DataTypes.STRING, field: 'Location' },
        ManufacturerId: { type: DataTypes.BIGINT, field: 'ManufacturerId' },
        ManufacturerName: { type: DataTypes.STRING, field: 'ManufacturerName' },
        LotNumber: { type: DataTypes.STRING, field: 'LotNumber' },
        ExpiryDate: { type: DataTypes.DATE, field: 'ExpiryDate' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        PerformedDate: { type: DataTypes.DATE, field: 'PerformedDate' },
        PerformedBy: { type: DataTypes.BIGINT, field: 'PerformedBy' },
        PatientImmunizationScheduleId: { type: DataTypes.BIGINT, field: 'PatientImmunizationScheduleId' },
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
            tableName: 'patientimmunizations',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (PatientImmunization as any).associate = function(models: Models) {
                    PatientImmunization.belongsTo(models.ReferenceValue,
                            { as: 'ImmunizationType', targetKey: 'ReferenceValueCodeId' });
                    PatientImmunization.belongsTo(models.ReferenceValue,
                            { as: 'ImmunizationStatus', targetKey: 'ReferenceValueCodeId' });
				 PatientImmunization.belongsTo(models.ReferenceValue,
                        { as: 'Route', targetKey: 'ReferenceValueCodeId' });
                    PatientImmunization.belongsTo(models.ReferenceValue,
                            { as: 'ImmunizationAdministrationType', targetKey: 'ReferenceValueCodeId' });
                };
 return PatientImmunization;
}
