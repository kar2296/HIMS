import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.CostDetailInstance, i.CostDetailAttributes> {
    let CostDetail = sequelize.define<i.CostDetailInstance, i.CostDetailAttributes>('CostDetail', {
        Id: { type: DataTypes.BIGINT, field: 'CostDetailId', primaryKey: true, autoIncrement: true },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        ActiveStatusId: { type: DataTypes.BIGINT, field: 'ActiveStatusId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        TypeId: { type: DataTypes.BIGINT, field: 'TypeId' },
        ServiceId: { type: DataTypes.BIGINT, field: 'ServiceId' },
        ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
        ItemName: { type: DataTypes.STRING, field: 'ItemName' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        FilmSize: { type: DataTypes.STRING, field: 'FilmSize' },
        OpTariff: { type: DataTypes.BIGINT, field: 'OpTariff' },
        IpTariff: { type: DataTypes.BIGINT, field: 'IpTariff' },
        InsuranceTariff: { type: DataTypes.BIGINT, field: 'InsuranceTariff' },
        FilmCost: { type: DataTypes.DECIMAL, field: 'FilmCost' },
        StationaryCost: { type: DataTypes.DECIMAL, field: 'StationaryCost' },
        ConsumablesCost: { type: DataTypes.DECIMAL, field: 'ConsumablesCost' },
        MedicineCost: { type: DataTypes.DECIMAL, field: 'MedicineCost' },
        OtherCost: { type: DataTypes.DECIMAL, field: 'OtherCost' },
        TotalCost: { type: DataTypes.DECIMAL, field: 'TotalCost' },
        StationedFixedCost: { type: DataTypes.DECIMAL, field: 'StationedFixedCost' },
        StationedAMCCost: { type: DataTypes.DECIMAL, field: 'StationedAMCCost' },
        TotalMobileCost: { type: DataTypes.DECIMAL, field: 'TotalMobileCost' },
        MobileFixedCost: { type: DataTypes.DECIMAL, field: 'MobileFixedCost' },
        MobileAMCCost: { type: DataTypes.DECIMAL, field: 'MobileAMCCost' },
        Casette: { type: DataTypes.DECIMAL, field: 'Casette' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        NotionalRent: { type: DataTypes.DECIMAL, field: 'NotionalRent' },
        RadiationCost: { type: DataTypes.DECIMAL, field: 'RadiationCost' },
        RegistrationCost: { type: DataTypes.DECIMAL, field: 'RegistrationCost' },
        EquipmentOtherCost: { type: DataTypes.DECIMAL, field: 'EquipmentOtherCost' },
        TotalStationedFixedCost: { type: DataTypes.DECIMAL, field: 'TotalStationedFixedCost' },
        TotalMobileFixedCost: { type: DataTypes.DECIMAL, field: 'TotalMobileFixedCost' },
        TechnicianCost: { type: DataTypes.DECIMAL, field: 'TechnicianCost' },
        NurseCost: { type: DataTypes.DECIMAL, field: 'NurseCost' },
        DoctorCost: { type: DataTypes.DECIMAL, field: 'DoctorCost' },
        ExternalDoctorCost: { type: DataTypes.DECIMAL, field: 'ExternalDoctorCost' },
        TotalLabourCost: { type: DataTypes.DECIMAL, field: 'TotalLabourCost' },
        StationedPowerCost: { type: DataTypes.DECIMAL, field: 'StationedPowerCost' },
        MobilePowerCost: { type: DataTypes.DECIMAL, field: 'MobilePowerCost' },
        StationedVariableCost: { type: DataTypes.DECIMAL, field: 'StationedVariableCost' },
        MobileVariableCost: { type: DataTypes.DECIMAL, field: 'MobileVariableCost' },
        TotalStationedCost: { type: DataTypes.DECIMAL, field: 'TotalStationedCost' },
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
            tableName: 'costdetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (CostDetail as any).associate = function(models: Models) {
                    CostDetail.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
                    CostDetail.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return CostDetail;
}
