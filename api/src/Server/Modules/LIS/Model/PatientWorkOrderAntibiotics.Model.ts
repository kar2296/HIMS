import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientWorkOrderAntibioticsInstance, i.PatientWorkOrderAntibioticsAttributes> {
    let PatientWorkOrderAntibiotics = sequelize.define<i.PatientWorkOrderAntibioticsInstance, i.
        PatientWorkOrderAntibioticsAttributes>('PatientWorkOrderAntibiotics', {
            Id: { type: DataTypes.BIGINT, field: 'PatientWorkOrderAntibioticId', primaryKey: true, autoIncrement: true },
            OrderId: { type: DataTypes.BIGINT, field: 'OrderId' },
            WorkOrderId: { type: DataTypes.BIGINT, field: 'WorkOrderId' },//WorkorderDetailId
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            OrderedDate: { type: DataTypes.DATE, field: 'OrderedDate' },
            SpecimenId: { type: DataTypes.STRING, field: 'SpecimenId' },
            OrganismIsolatedId: { type: DataTypes.STRING, field: 'OrganismIsolatedId' },
            GramStain: { type: DataTypes.STRING, field: 'GramStain' },
            ColonyCount: { type: DataTypes.STRING, field: 'ColonyCount' },
            MCH: { type: DataTypes.STRING, field: 'MCH' },
            Blood: { type: DataTypes.STRING, field: 'Blood' },
            MicroNo: { type: DataTypes.STRING, field: 'MicroNo' },
            CultutreReport: { type: DataTypes.STRING, field: 'CultutreReport' },
            Remarks: { type: DataTypes.STRING, field: 'Remarks' },
            TypeId: { type: DataTypes.BIGINT, field: 'TypeId' },
            Antibiotics: { type: DataTypes.STRING, field: 'Antibiotics' },
            ResultId: { type: DataTypes.INTEGER, field: 'ResultId' },
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
                tableName: 'patientworkorderantibiotics',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    // (PatientWorkOrderAntibiotics as any).associate = function (models: Models) {
    //     PatientWorkOrderAntibiotics.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
    //     PatientWorkOrderAntibiotics.belongsTo(models.ReferenceValue, { as: 'AntibioticType', targetKey: 'ReferenceValueCodeId' });
    // };
    return PatientWorkOrderAntibiotics;
}
