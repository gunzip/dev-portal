"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The aim of this Express Web application is to automate
 * some tasks related to users management in the Digital Citizenship
 * Azure API management developer portal resource.
 *
 */
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const morgan = require("morgan");
const passport = require("passport");
const cookieSession = require("cookie-session");
/*
 * Useful for testing the web application locally.
 * 'local.env' file does not need to exists in the
 * production environment (use Application Settings instead)
 */
dotenv.config({ path: __dirname + "/../local.env" });
const config = require("./config");
const express_1 = require("italia-ts-commons/lib/express");
const request_middleware_1 = require("italia-ts-commons/lib/request_middleware");
const strings_1 = require("italia-ts-commons/lib/strings");
const bearer_strategy_1 = require("./bearer_strategy");
const cache_1 = require("./cache");
const configuration_1 = require("./controllers/configuration");
const services_1 = require("./controllers/services");
const subscriptions_1 = require("./controllers/subscriptions");
const user_1 = require("./controllers/user");
const express_2 = require("./express");
const logger_1 = require("./logger");
const api_client_1 = require("./middlewares/api_client");
const extract_payload_1 = require("./middlewares/extract_payload");
const optional_param_1 = require("./middlewares/optional_param");
const required_param_1 = require("./middlewares/required_param");
const user_2 = require("./middlewares/user");
const new_subscription_1 = require("./new_subscription");
process.on("unhandledRejection", e => logger_1.logger.error(JSON.stringify(e)));
if (process.env.NODE_ENV === "debug") {
    cache_1.initCacheStats();
}
/**
 * Setup an authentication strategy (oauth) for express endpoints.
 */
bearer_strategy_1.setupBearerStrategy(passport, config.creds, (userId, profile) => __awaiter(this, void 0, void 0, function* () {
    // executed when the user is logged in
    // userId === profile.oid
    // req.user === profile
    logger_1.logger.debug("setupBearerStrategy %s %s", userId, JSON.stringify(profile));
}));
const app = express();
express_2.secureExpressApp(app);
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(morgan("combined"));
// Avoid stateful in-memory sessions
app.use(cookieSession({
    keys: [config.creds.cookieEncryptionKeys[0].key],
    name: "session"
}));
/**
 * Express middleware that check oauth token.
 */
const ouathVerifier = (req, res, next) => {
    // adds policyName in case none is provided
    // tslint:disable-next-line:no-object-mutation
    req.query.p = config.policyName;
    passport.authenticate("oauth-bearer", {
        response: res,
        session: false
    })(req, res, next);
};
app.get("/logout", (req, res) => {
    req.logout();
    res.json("OK");
});
app.get(["/subscriptions", "/subscriptions/:email"], ouathVerifier, request_middleware_1.wrapRequestHandler(request_middleware_1.withRequestMiddlewares(api_client_1.getApiClientMiddleware(), user_2.getUserFromRequestMiddleware(), optional_param_1.OptionalParamMiddleware("email", strings_1.EmailString))(subscriptions_1.getSubscriptions)));
app.post(["/subscriptions", "/subscriptions/:email"], ouathVerifier, request_middleware_1.wrapRequestHandler(request_middleware_1.withRequestMiddlewares(api_client_1.getApiClientMiddleware(), user_2.getUserFromRequestMiddleware(), extract_payload_1.ExtractFromPayloadMiddleware(new_subscription_1.SubscriptionData), optional_param_1.OptionalParamMiddleware("email", strings_1.EmailString))(subscriptions_1.postSubscriptions)));
app.put("/subscriptions/:subscriptionId/:keyType", ouathVerifier, request_middleware_1.wrapRequestHandler(request_middleware_1.withRequestMiddlewares(api_client_1.getApiClientMiddleware(), user_2.getUserFromRequestMiddleware(), required_param_1.RequiredParamMiddleware("subscriptionId", strings_1.NonEmptyString), required_param_1.RequiredParamMiddleware("keyType", strings_1.NonEmptyString))(subscriptions_1.putSubscriptionKey)));
app.get("/services/:serviceId", ouathVerifier, request_middleware_1.wrapRequestHandler(request_middleware_1.withRequestMiddlewares(api_client_1.getApiClientMiddleware(), user_2.getUserFromRequestMiddleware(), required_param_1.RequiredParamMiddleware("serviceId", strings_1.NonEmptyString))(services_1.getService)));
app.put("/services/:serviceId", ouathVerifier, request_middleware_1.wrapRequestHandler(request_middleware_1.withRequestMiddlewares(api_client_1.getApiClientMiddleware(), user_2.getUserFromRequestMiddleware(), required_param_1.RequiredParamMiddleware("serviceId", strings_1.NonEmptyString), extract_payload_1.ExtractFromPayloadMiddleware(services_1.ServicePayload))(services_1.putService)));
app.get(["/user", "/user/:email"], ouathVerifier, request_middleware_1.wrapRequestHandler(request_middleware_1.withRequestMiddlewares(api_client_1.getApiClientMiddleware(), user_2.getUserFromRequestMiddleware(), optional_param_1.OptionalParamMiddleware("email", strings_1.EmailString))(user_1.getUser)));
app.get("/users", ouathVerifier, request_middleware_1.wrapRequestHandler(request_middleware_1.withRequestMiddlewares(api_client_1.getApiClientMiddleware(), user_2.getUserFromRequestMiddleware())(user_1.getUsers)));
app.get("/configuration", express_1.toExpressHandler(configuration_1.getConfiguration));
const port = config.port || 3000;
app.listen(port);
logger_1.logger.debug("Listening on port %s", port.toString());
//# sourceMappingURL=app.js.map