import { config } from 'dotenv';
config();
import './Global';
import { Bootstrap } from './Bootstrap';
if (process.env.NODE_ENV !== 'production') {
    debugger;
}
let app = new Bootstrap();
app.Init().Start();
import { Sequence } from './Server/Modules/General/Common/Sequence.s';
Sequence.Init().catch(err => {
    console.error(err);
});
import { FacilityPreferenceService } from './Server/Modules/SystemSettings/Service/Index';
import { FacilityPreferenceFilters } from './Server/Modules/SystemSettings/Common/Filters.e';
import { scheduleWhatsappAutomation } from './Server/WhatsappNotification/WhatsAppAutomation';

new FacilityPreferenceService().GetFacilityPreferences({
    Id: 0,
    PageContext: { PageSize: 100, PageNumber: 1 },
    Params: [
        { Key: FacilityPreferenceFilters.Category, Value: 'SMS' }
    ]
}).then((res) => {
    res.Data.forEach(pref => {
        SmsConfig[pref.PreferenceKey] = pref.PreferenceValue;
    });
    console.log('SMS Config');
    console.log(SmsConfig);
});

new FacilityPreferenceService().GetFacilityPreferences({
    Id: 0,
    PageContext: { PageSize: 100, PageNumber: 1 },
    Params: [
        { Key: FacilityPreferenceFilters.Category, Value: 'EMAIL' }
    ]
}).then((res) => {
    res.Data.forEach(pref => {
        EmailConfig[pref.PreferenceKey] = pref.PreferenceValue;
    });
    console.log('Email Config');
    console.log(EmailConfig);
});

new FacilityPreferenceService().GetFacilityPreferences({
    Id: 0,
    PageContext: { PageSize: 100, PageNumber: 1 },
    Params: [
        { Key: FacilityPreferenceFilters.Category, Value: 'WHATSAPP' }
    ]
}).then((res) => {
    res.Data.forEach(pref => {
        WhatsAppConfig[pref.PreferenceKey] = pref.PreferenceValue;
    });
    console.log('WhatsApp Config');
    console.log(WhatsAppConfig);
    // Cron WhatsApp
    if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'JSS') {
        scheduleWhatsappAutomation();
    } else {
        console.log('WhatsApp automation not scheduled for this provider');
    }
});

new FacilityPreferenceService().GetFacilityPreferences({
    Id: 0,
    PageContext: { PageSize: 100, PageNumber: 1 },
    Params: [
        { Key: FacilityPreferenceFilters.Category, Value: 'LOCALWELL' }
    ]
}).then((res) => {
    res.Data.forEach(pref => {
        LocalWellConfig[pref.PreferenceKey] = pref.PreferenceValue;
    });
    console.log('LocalWellConfig');
    console.log(LocalWellConfig);
});
