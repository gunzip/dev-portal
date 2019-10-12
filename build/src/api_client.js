"use strict";
/**
 * REST client for Notification / Preference APIs.
 * See spec here: https://teamdigitale.github.io/digital-citizenship/api/public.html
 */
Object.defineProperty(exports, "__esModule", { value: true });
const t = require("io-ts");
// A basic response type that also include 401
const Either_1 = require("fp-ts/lib/Either");
const requests_1 = require("italia-ts-commons/lib/requests");
const strings_1 = require("italia-ts-commons/lib/strings");
const node_fetch_1 = require("node-fetch");
const ExtendedProfile_1 = require("../generated/api/ExtendedProfile");
const LimitedProfile_1 = require("../generated/api/LimitedProfile");
const Service_1 = require("../generated/api/Service");
const ServicePublic_1 = require("../generated/api/ServicePublic");
const OcpApimSubscriptionKey = "Ocp-Apim-Subscription-Key";
// ProfileLimitedOrExtended is oneOf [LimitedProfile, ExtendedProfile]
const ProfileLimitedOrExtended = t.union([LimitedProfile_1.LimitedProfile, ExtendedProfile_1.ExtendedProfile]);
function apiResponseDecoder(type) {
    const basicResponseDecoderWith401 = requests_1.composeResponseDecoders(requests_1.basicResponseDecoder(type), requests_1.basicErrorResponseDecoder(401));
    return requests_1.composeResponseDecoders(requests_1.ioResponseDecoder(201, type), basicResponseDecoderWith401);
}
exports.apiResponseDecoder = apiResponseDecoder;
function SubscriptionKeyHeaderProducer(token) {
    return () => ({
        [OcpApimSubscriptionKey]: token
    });
}
exports.SubscriptionKeyHeaderProducer = SubscriptionKeyHeaderProducer;
function APIClient(baseUrl, token, 
// tslint:disable-next-line:no-any
fetchApi = node_fetch_1.default) {
    const options = {
        baseUrl,
        fetchApi
    };
    const tokenHeaderProducer = SubscriptionKeyHeaderProducer(token);
    const getServiceT = {
        headers: tokenHeaderProducer,
        method: "get",
        query: _ => ({}),
        response_decoder: apiResponseDecoder(Service_1.Service),
        url: params => `/adm/services/${params.id}`
    };
    const sendMessageT = {
        body: params => JSON.stringify(params.message),
        headers: requests_1.composeHeaderProducers(tokenHeaderProducer, requests_1.ApiHeaderJson),
        method: "post",
        query: _ => ({}),
        response_decoder: apiResponseDecoder(t.interface({ id: strings_1.NonEmptyString })),
        url: params => `/api/v1/messages/${params.fiscalCode}`
    };
    const createDevelopmentProfileT = {
        body: params => JSON.stringify(params.newProfile),
        headers: requests_1.composeHeaderProducers(tokenHeaderProducer, requests_1.ApiHeaderJson),
        method: "post",
        query: _ => ({}),
        response_decoder: apiResponseDecoder(ExtendedProfile_1.ExtendedProfile),
        url: params => `/adm/development-profiles/${params.fiscalCode}`
    };
    const createServiceT = {
        body: params => JSON.stringify(params.service),
        headers: requests_1.composeHeaderProducers(tokenHeaderProducer, requests_1.ApiHeaderJson),
        method: "post",
        query: _ => ({}),
        response_decoder: apiResponseDecoder(ServicePublic_1.ServicePublic),
        url: _ => `/adm/services`
    };
    const updateServiceT = {
        body: params => JSON.stringify(params.service),
        headers: requests_1.composeHeaderProducers(tokenHeaderProducer, requests_1.ApiHeaderJson),
        method: "put",
        query: _ => ({}),
        response_decoder: apiResponseDecoder(ServicePublic_1.ServicePublic),
        url: params => `/adm/services/${params.serviceId}`
    };
    return {
        createDevelopmentProfile: requests_1.createFetchRequestForApi(createDevelopmentProfileT, options),
        createService: requests_1.createFetchRequestForApi(createServiceT, options),
        getService: requests_1.createFetchRequestForApi(getServiceT, options),
        sendMessage: requests_1.createFetchRequestForApi(sendMessageT, options),
        updateService: requests_1.createFetchRequestForApi(updateServiceT, options)
    };
}
exports.APIClient = APIClient;
function toEither(res) {
    if (!res) {
        return Either_1.left(new Error("Response is empty"));
    }
    if (res.status === 200 || res.status === 201) {
        return Either_1.right(res.value);
    }
    else {
        return Either_1.left(new Error("Error parsing response: " + res.status));
    }
}
exports.toEither = toEither;
//# sourceMappingURL=api_client.js.map