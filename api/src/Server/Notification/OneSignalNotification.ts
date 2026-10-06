export class NotificationService {

    public async sendNotification(message: any, playerIds: any, param: any = null) {
        var content = false;
        var bodyItem = {};
        if (param) {
            bodyItem = param;
        }


        var data = {
            // app_id: '0844ea4c-7099-4b35-b2eb-7d0f9b2ec932', // ap03
            // app_id: 'e88fbf4d-190f-4fa3-9ca3-c651e5b28c00', // ap02
            app_id: '3e618b3b-d600-47c8-8203-1a933abe861d', //doctornotification
            contents: { 'en': message },
            include_player_ids: playerIds,
            content_available: content,
            data: bodyItem,
        };

        var headers = {
            'Content-Type': 'application/json; charset=utf-8',
            // 'Authorization': 'Basic ' + 'ZTU4NjNhMTQtZWY5NS00ZGRmLTg1Y2QtYjgwYWRmNGEzZjM2'// ap02
            'Authorization': 'Basic ' + 'MTkxMWRiZGYtNzQyNy00OTM0LWI2MmYtZjdjM2VmM2U3NjMz' // people tree
        };

        var options = {
            host: 'onesignal.com',
            port: 443,
            path: '/api/v1/notifications',
            method: 'POST',
            headers: headers,
        };
        var https = require('https');

        var req = https.request(options, function (res: any) {
            res.on('data', function (data: any) {
                console.log('Response:');
                console.log(JSON.parse(data));
            });
        });

        req.on('error', function (e: any) {
            console.log('ERROR:');
            console.log(e);
        });

        req.write(JSON.stringify(data));
        req.end();

        return true;
    }
}
