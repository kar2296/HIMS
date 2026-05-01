import * as admin from 'firebase-admin';
// import * as serviceAccount from './google-services.json';
// const serviceAccount = require('./google-services.json');
const serviceAccount: any = {
    'type': 'service_account',
    'project_id': 'swostha-33deb',
    'private_key_id': '9ca44663930182d6f751f5f51f6a428d91e93c6e',
     // tslint:disable-next-line:max-line-length
    'private_key': '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC2028+oFw2f0HQ\nEaev7kEQVyXdnCspD4Sj1kSOUifti6BNjcbrjB9iJjmFL3bB5+80VUHOleq5ZUdV\nLjg4G3L8TqVr1p6jJeaH3iZES9LRB02dBt4IceWqywhpjP8urM+TnYLQ96vs1nYr\nV1pPXzMflr8YKKn9XIWBVwMtBhjjVp2ws8H63WfpT7Olhi+rY7ExSwran4LDUjr1\nifccTcp8nHz+bQIDXgrqSqKrSHCOOUyhgXhoY/UsYJUbigJpX+inAuFyWHG8o6Qh\n1q78sxBPfB7ZPfljZxCkz3d4ouVa7OGfgdNTIJZBO1jMLbtnvN4Ua80O0WcrOLkQ\ndV0ZRfnpAgMBAAECggEAAiQ4LE/4cvEq9IfRNd19uLYgnPfDkw7muZZcrE/lJLvr\nAOvzqmL0VvPskah0hM4IuzO/DW9FnG4Ft7p1HgXtfJ8wm/KbxJYnNpLnhVf5bFZG\n0AHnPDEwJL/aK+xWH9yWPA8ozvXog/tsgmwnqpoKas9Bkt2eq7eEXwQfJvOblOwa\nRA8xnfd3PEPIwyyoJrtRyhJutwGom0PPuRAK6WPvtWkIgHXGAJJmmXnsNao/q4qs\n++6u/xMESuOQPV2eOKcX5Ke6LkiySdSDbmecODTgd8IfCzyVwK0sOCB2LU2CGoFV\nxEzAoRK7cWE2GGv0B9EzKaW8ERMobvsXkNYICYXgtQKBgQDuDdUKPanCi+54GbVz\nN+WR1ZDL49dohdg5sQHvEtvV/xYkhw+DRioCMxui6IECTpyS6o+OHFjAm/WFKgN3\ndPFU5lXciCwdEETe5jxd2yO/y8rJjtTltjBGb5OaFteYHLv6D8WvnwGzLyCvvUBv\nmxBMxdKTbzQgdUf6o7GKrv6N/QKBgQDEm8N2kpJFj5idjfoDVlbQcR0DEt61XqK+\nh31zqISuOeFIcc3kZ1RszVpbW0/7Lr0/kqwsggfZIyIRyNq8SXuEi9QKqeKBnkej\nseBOsOjhazOs2DcoXZYAWXTsQCrGxvUJXYFvtojc/0+TfMtL6M9j4yI/34kH5wmf\nfBbrMRCJXQKBgHchavTWCQd3+Z4W14xSc8t4gh7W5azEFoJAh8Q5vtQn9M/Q2z2J\ntmolY3YyPqWF66tGQRMQMoYpRkQe019LoZ4oKt3TM6hTxPN7ashZa1mHRfN6TCas\n9xm4qrgZKElST+wDSp3px/MA6a2o2v8/LXgOI6RuqTp5Fs1ib+4ERxWNAoGBALZi\nuQS6G68j8rPWDWQjKA3doMhFLQybaeXN0vcEEXF+iBqoWBPWN19ncLbnEl81kKH0\n8nundJheGzDcXu3kTQ08mcv6pQERT+vvCuJ1AtR6mklxmll717cjRXAUZppX3uB9\nOaHkdzpsLenoDr+wjRNglVkjiP8nuKmWd7xem7SRAoGBANz2qitkNkBEe8NyB5vk\nMq6ePhXyIasRN8grnI4pqTqTcN1GCQWhcI3MjQ+vD2eVHVC+myzXZmmnxAnbeoR7\nNKLhwtH6EhiQfkFiqXfsemo5pdh8KobGO1yzKYlAvW3x/7RwgCVCMeirrdI2Ge5M\nRwRrVJwFcXsq/vWkntVuBTjc\n-----END PRIVATE KEY-----\n',
    'client_email': 'firebase-adminsdk-wq755@swostha-33deb.iam.gserviceaccount.com',
    'client_id': '116754336769050814169',
    'auth_uri': 'https://accounts.google.com/o/oauth2/auth',
    'token_uri': 'https://oauth2.googleapis.com/token',
    'auth_provider_x509_cert_url': 'https://www.googleapis.com/oauth2/v1/certs',
     // tslint:disable-next-line:max-line-length
    'client_x509_cert_url': 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-wq755%40swostha-33deb.iam.gserviceaccount.com'
};

export const notify = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://docis-f1ad3.firebaseio.com'
});
