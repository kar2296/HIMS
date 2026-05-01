/*
 * JavaScript client-side example using jsrsasign
 */

// #########################################################
// #             WARNING   WARNING   WARNING               #
// #########################################################
// #                                                       #
// # This file is intended for demonstration purposes      #
// # only.                                                 #
// #                                                       #
// # It is the SOLE responsibility of YOU, the programmer  #
// # to prevent against unauthorized access to any signing #
// # functions.                                            #
// #                                                       #
// # Organizations that do not protect against un-         #
// # authorized signing will be black-listed to prevent    #
// # software piracy.                                      #
// #                                                       #
// # -QZ Industries, LLC                                   #
// #                                                       #
// #########################################################

/**
 * Depends:
 *     - jsrsasign-latest-all-min.js
 *     - qz-tray.js
 *
 * Steps:
 *
 *     1. Include jsrsasign 8.0.4 into your web page
 *        <script src="https://cdn.rawgit.com/kjur/jsrsasign/c057d3447b194fa0a3fdcea110579454898e093d/jsrsasign-all-min.js"></script>
 *
 *     2. Update the privateKey below with contents from private-key.pem
 *
 *     3. Include this script into your web page
 *        <script src="path/to/sign-message.js"></script>
 *
 *     4. Remove or comment out any other references to "setSignaturePromise"
 */
	
var privateKey = "-----BEGIN RSA PRIVATE KEY-----\n"+
	"MIIEpAIBAAKCAQEApjp8+oDBbBEe71pJdZSa3lBDvwtY+y2g/ozPEhAxPNawGJYV\n" +
	"kbA9jMlawxS2tyIA3DeM3+/icWu+ImLxCQ+YOI6i4VMj3FaaG+brY6syloAq1eoN\n" +
	"or5Ma+voukXcukkm3B2priGxy4Ae4TBISPQD+aCqoKsi0FYZhbU+By7G3L+vi8kQ\n" +
	"ANUigJSIjlNbc8rQLrCL6oX0Jpjsd13h+b++T+QLpR65otqLihrDBrIn1NJ5EoY4\n" +
	"31WsRsJIDMw6QUC4hVp/E/B7SYxgmYs3rtTew0YkPsgmpKNsQ/SY44ZToq96MTVB\n" +
	"zaEWh5f+qgZJdxiqxBEcE85xdteEz1dVEESHYQIDAQABAoIBABWDv8X4a5BzeCqI\n" +
	"krYaNsqMCZ4CIlEtlbHR7cHWa1kG0cyiLZvT+2jBGEiO4hs6gRv/lfHXWC/6lFBa\n" +
	"YqdxPPAiXf3bRz/vIYvM9oMe7FxDAx2kE9cQLvn6PalQ/ixKPYet0IFjhmHiwkcT\n" +
	"0GHzhfQwPFqxQRSaoDuzD+/ZY7m8YYfHoRxfyhFSekzQ+sMySP5HytFjdBSywww4\n" +
	"Cq9U1IgWpFN0MbaNbWPrwQOSxQ+1iPMcZnG/PN3w2xGDvGpx+dbknOBCa7n8KoqV\n" +
	"HoZAHtmBvuMPTM7SLq0ZKvTSlbH+dHBmFCbmU1sDUtT2mnk+9O0bxKiQEYt7kgI9\n" +
	"+BLQmQUCgYEA0Ow/Ajx+zfPvkClNxTmk87uzJ//Ywk7l1VRlmG2WcMyUc/jCpJ2e\n" +
	"05DDCFhBTA/0y/W3olKGGwcfn8vXgETDqCBc1o83j+W/CqcrAti+ShXOYHjOpJPs\n" +
	"hPWD7utQv5/TkhA18z8zmr+RwofuRhEi+7d+lyjGVHCloaALqK1GUBsCgYEAy69o\n" +
	"ycpi6YbDTYtxbIhdKn0WKljjF7314I0Kh3n3lvwG9LdrkdWA+WonD3AqRxDfTmMT\n" +
	"kt+nzSGQYLHoKdwF0qY/TrxV9/FUx4h+QLTFDO1uqJOeOfsYdjEjwKzxdy53EjRq\n" +
	"9rjYzBdWh4kED5h/tBjqT5blpOZUux71aImk1jMCgYEApCfcYj9ySxTOOPGbP8pJ\n" +
	"R5FF9bnbcOFZSUOlCB2jRUIZqv3cwkdu0kE+XUIrHD61U8Tf4tUAth/kw0QBMbHW\n" +
	"IjY7fALP32rfrtkmvHfdHI0BuV9yznHEN7xJS+LtcYN9U5kVKumP/JllR/pSSA+S\n" +
	"80F8X/0TyKkyG0qLnp93Td0CgYBPsaAEZCVzTYEY1Bha6LfbKfoEM6cW4QJVC5o1\n" +
	"C6mt74ohMarq8mh2Lex+g9pm19knaGh+LPgQsLM2wiUeS7ITi2x1uAbC7i/HqkYL\n" +
	"ty7qMfP8DVX5RZ96jxt4BbKseQepnczEH+rjX7ZBbYCjQX2lz6HN5jKP5Hb+h8xp\n" +
	"TIGsNQKBgQCl742q8oW+gfq41I4s3nluCtv/y7jRxXC1k6G0w99KCZvgQGCiDRDi\n" +
	"lBW19G+adXUBddPwvIioBXvsxAPn3UJZdcTWdAJwU7xUgM2NmGT20V36zujMW8bF\n" +
	"BCFNchudiMyOwFdyLzt7UPbrlqLry8dcycmUUy6hFnQiLu0uVCXMjg==\n" +
	"-----END RSA PRIVATE KEY-----\n";

qz.security.setSignaturePromise(function(toSign) {
    return function(resolve, reject) {
        try {
            var pk = KEYUTIL.getKey(privateKey);
            var sig = new KJUR.crypto.Signature({"alg": "SHA1withRSA"});
            sig.init(pk); 
            sig.updateString(toSign);
            var hex = sig.sign();
            //console.log("DEBUG: \n\n" + stob64(hextorstr(hex)));
            resolve(stob64(hextorstr(hex)));
        } catch (err) {
            console.error(err);
            reject(err);
        }
    };
});
