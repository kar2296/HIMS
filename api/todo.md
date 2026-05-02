src
    Client
        ...ALL client side stuff
        index.html
    Docs
        index.html
    Config
        BaseConfig
        AppConfig
        CacheConfig
        DbConfig
        SqlLogConfig
    Server
        Common
            Request
            Response
            Context
        Core
            Webserver (Coponent)
            Wrapper
            Caching 
            Logger
            Middleware
                Authorization
                Authentication
                Intrumentation
            Database.ts - > Repository.ts
            Router.ts - >I hope this is Wrong place. 
        Modules
            Base
                Routes
                Service
                Business
                Models
                    Interfaces
                        AclAttribute.ts
                    Acl.ts
                SearchEnums
                Index.ts
            Admin
                Routes
                Service
                Business
                Models
                SearchEnums
                Index.ts
            Appointment
            Reporting
        Router.ts
    Bootstrap.ts
    Index.ts
        
        
Server side Reporting- PDF -  http://www.feedhenry.com/server-side-pdf-generation-node-js/
ACL Development 
EMail - 
Excel Import and Export

passport-local-example - https://github.com/DevMountain/passport-local-example/blob/master/app.js
ExpressJS and PassportJS Sessions Deep Dive - https://www.airpair.com/express/posts/expressjs-and-passportjs-sessions-deep-dive
