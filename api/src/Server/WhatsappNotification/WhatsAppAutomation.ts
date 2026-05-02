import * as cron from 'node-cron';
import { WhatsappNotificationService } from '../../Server/WhatsappNotification/WhatsappNotification';
import { BaseBo } from '../../Server/Modules/Base/Index';
import { Model } from 'sequelize';
import * as moment from 'moment';

export class WhatsAPPAutomation extends BaseBo<any, any> {
    public GetModel(): Model<any, any> {
        throw new Error('Method not implemented.');
    }
    public async CollectionSummaryWhatsapp() {
        console.log('FollowUp Appointment SMS started job at - ' + new Date());

        // Calculate the date range
        let yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        let FirstDay = new Date(yesterday.setHours(0, 0, 0, 0));
        let LastDay = new Date(yesterday.setHours(23, 59, 59, 999));

        let replacements: any = {
            FirstDay: FirstDay,
            LastDay: LastDay,
        };

        console.log('Replacements:', replacements);

        let spName = 'SMScolletion(:FirstDay, :LastDay)';
        try {
            // Execute the stored procedure
            let result = await this.ExecuteStoredProcedure(spName, { replacements });
            console.log('Stored procedure result:', result);
            const getAmountByStoreId = (id: number) => {
                const store = result.find((item:any) => item.StoreMasterId === id);
                return store ? store.Amount : 'No collection';
            };
            let store1 = getAmountByStoreId(1);
            let store2 = getAmountByStoreId(3);
            let store3 = getAmountByStoreId(4);
            let store4 = getAmountByStoreId(5);
            let store5 = getAmountByStoreId(6);
            let store6 = getAmountByStoreId(7);
            let store7 = getAmountByStoreId(59);
            // let Total = getAmountByStoreId(10000);
            let collectionDate = moment(yesterday).format('YYYY-MM-DD');
            console.log('Filtered Datas: Store 1: ' + store1 + ', Store 2: ' + store2 + ', Store 3: ' + store3 +
                 ', Store 4: ' + store4 + ', Store 5: ' + store5 + ', Store 6: ' + store6 + ', Store 7: '
                  + store7 + ', Collection Date: ' + collectionDate);
            if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'JSS') {
                let mobile = ['1234567890', '0987654321'];
                let promises: any = [];
                mobile.forEach(async (number) => {
                    let data = {
                        TemplateName: 'ssmdc',
                        mobile: number,
                        BodyParameter: [collectionDate, store1, store2, store3, store4, store5, store7, store6],
                    };
                    const whatsApp = new WhatsappNotificationService();
                    let msgRes = await whatsApp.sendMessage(data);
                    promises.push(msgRes);
                });
                Promise.all(promises)
                    .then((results) => {
                        console.log(results, 'here are the Collection Summary');
                    })
                    .catch((error) => {
                        console.log('Error sendingmessages:', error);
                    });
            }
        } catch (error) {
            console.error('Error in CollectionSummaryWhatsapp:', error);
        }

        console.log('Completed job at ' + new Date());
    }
}

const whatsAppInstance = new WhatsAPPAutomation();

let isCronScheduled = false;

export const scheduleWhatsappAutomation = () => {
    if (isCronScheduled) {
        console.log('Cron job is already scheduled.');
        return;
    }
    if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'JSS') {
        cron.schedule('0 1 * * *', async () => {
            console.log('Triggering WhatsappAutomation at -', new Date());

            try {
                await whatsAppInstance.CollectionSummaryWhatsapp();
                console.log('WhatsappAutomation executed successfully.');
            } catch (error) {
                console.error('Error in scheduled task:', error);
            }
        });
        isCronScheduled = true;
        console.log('WhatsApp automation scheduled successfully.');
    } else {
        console.log('WhatsApp automation not scheduled for this Provider');
    }
};

// Start the scheduled task
scheduleWhatsappAutomation();
