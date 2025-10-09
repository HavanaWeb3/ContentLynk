"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/auth/[...nextauth]/route";
exports.ids = ["app/api/auth/[...nextauth]/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fdavidsime%2Fhvna-ecosystem%2Fcontentlynk%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fdavidsime%2Fhvna-ecosystem%2Fcontentlynk&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fdavidsime%2Fhvna-ecosystem%2Fcontentlynk%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fdavidsime%2Fhvna-ecosystem%2Fcontentlynk&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_davidsime_hvna_ecosystem_contentlynk_src_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/auth/[...nextauth]/route.ts */ \"(rsc)/./src/app/api/auth/[...nextauth]/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/[...nextauth]/route\",\n        pathname: \"/api/auth/[...nextauth]\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/[...nextauth]/route\"\n    },\n    resolvedPagePath: \"/Users/davidsime/hvna-ecosystem/contentlynk/src/app/api/auth/[...nextauth]/route.ts\",\n    nextConfigOutput,\n    userland: _Users_davidsime_hvna_ecosystem_contentlynk_src_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/auth/[...nextauth]/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGJTVCLi4ubmV4dGF1dGglNUQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRmRhdmlkc2ltZSUyRmh2bmEtZWNvc3lzdGVtJTJGY29udGVudGx5bmslMkZzcmMlMkZhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPSUyRlVzZXJzJTJGZGF2aWRzaW1lJTJGaHZuYS1lY29zeXN0ZW0lMkZjb250ZW50bHluayZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQXNHO0FBQ3ZDO0FBQ2M7QUFDbUM7QUFDaEg7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdIQUFtQjtBQUMzQztBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxpRUFBaUU7QUFDekU7QUFDQTtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUN1SDs7QUFFdkgiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jb250ZW50bHluay8/YzA0MiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIvVXNlcnMvZGF2aWRzaW1lL2h2bmEtZWNvc3lzdGVtL2NvbnRlbnRseW5rL3NyYy9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCIvVXNlcnMvZGF2aWRzaW1lL2h2bmEtZWNvc3lzdGVtL2NvbnRlbnRseW5rL3NyYy9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIG9yaWdpbmFsUGF0aG5hbWUsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fdavidsime%2Fhvna-ecosystem%2Fcontentlynk%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fdavidsime%2Fhvna-ecosystem%2Fcontentlynk&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./src/app/api/auth/[...nextauth]/route.ts":
/*!*************************************************!*\
  !*** ./src/app/api/auth/[...nextauth]/route.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ handler),\n/* harmony export */   POST: () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./src/lib/auth.ts\");\n\n\nconst handler = next_auth__WEBPACK_IMPORTED_MODULE_0___default()(_lib_auth__WEBPACK_IMPORTED_MODULE_1__.authOptions);\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBZ0M7QUFDUTtBQUV4QyxNQUFNRSxVQUFVRixnREFBUUEsQ0FBQ0Msa0RBQVdBO0FBRU0iLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jb250ZW50bHluay8uL3NyYy9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50cz8wMDk4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBOZXh0QXV0aCBmcm9tICduZXh0LWF1dGgnXG5pbXBvcnQgeyBhdXRoT3B0aW9ucyB9IGZyb20gJ0AvbGliL2F1dGgnXG5cbmNvbnN0IGhhbmRsZXIgPSBOZXh0QXV0aChhdXRoT3B0aW9ucylcblxuZXhwb3J0IHsgaGFuZGxlciBhcyBHRVQsIGhhbmRsZXIgYXMgUE9TVCB9Il0sIm5hbWVzIjpbIk5leHRBdXRoIiwiYXV0aE9wdGlvbnMiLCJoYW5kbGVyIiwiR0VUIiwiUE9TVCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/auth/[...nextauth]/route.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/auth.ts":
/*!*************************!*\
  !*** ./src/lib/auth.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var _next_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @next-auth/prisma-adapter */ \"(rsc)/./node_modules/@next-auth/prisma-adapter/dist/index.js\");\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var _lib_db__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/db */ \"(rsc)/./src/lib/db.ts\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(bcryptjs__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var zod__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! zod */ \"(rsc)/./node_modules/zod/v3/types.js\");\n\n\n\n\n\n// Validation schemas\nconst loginSchema = zod__WEBPACK_IMPORTED_MODULE_4__.object({\n    email: zod__WEBPACK_IMPORTED_MODULE_4__.string().email(),\n    password: zod__WEBPACK_IMPORTED_MODULE_4__.string().min(6)\n});\nconst registerSchema = zod__WEBPACK_IMPORTED_MODULE_4__.object({\n    email: zod__WEBPACK_IMPORTED_MODULE_4__.string().email(),\n    username: zod__WEBPACK_IMPORTED_MODULE_4__.string().min(3).max(20).regex(/^[a-zA-Z0-9_-]+$/, \"Username can only contain letters, numbers, underscores, and hyphens\"),\n    password: zod__WEBPACK_IMPORTED_MODULE_4__.string().min(6),\n    displayName: zod__WEBPACK_IMPORTED_MODULE_4__.string().optional()\n});\nconst authOptions = {\n    adapter: (0,_next_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_0__.PrismaAdapter)(_lib_db__WEBPACK_IMPORTED_MODULE_2__.prisma),\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__[\"default\"])({\n            name: \"credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"email\"\n                },\n                password: {\n                    label: \"Password\",\n                    type: \"password\"\n                },\n                username: {\n                    label: \"Username\",\n                    type: \"text\"\n                },\n                displayName: {\n                    label: \"Display Name\",\n                    type: \"text\"\n                },\n                isRegister: {\n                    label: \"Is Register\",\n                    type: \"text\"\n                }\n            },\n            async authorize (credentials) {\n                if (!credentials?.email || !credentials?.password) {\n                    return null;\n                }\n                try {\n                    // Check if this is a registration attempt\n                    if (credentials.isRegister === \"true\") {\n                        console.log(\"Registration attempt:\", {\n                            email: credentials.email,\n                            username: credentials.username,\n                            displayName: credentials.displayName\n                        });\n                        const validatedData = registerSchema.parse({\n                            email: credentials.email,\n                            username: credentials.username,\n                            password: credentials.password,\n                            displayName: credentials.displayName\n                        });\n                        console.log(\"Validation passed:\", validatedData);\n                        // Check if user already exists\n                        const existingUser = await _lib_db__WEBPACK_IMPORTED_MODULE_2__.prisma.user.findFirst({\n                            where: {\n                                OR: [\n                                    {\n                                        email: validatedData.email\n                                    },\n                                    {\n                                        username: validatedData.username\n                                    }\n                                ]\n                            }\n                        });\n                        console.log(\"Existing user check:\", existingUser);\n                        if (existingUser) {\n                            console.log(\"User already exists:\", existingUser.email, existingUser.username);\n                            throw new Error(\"User already exists with this email or username\");\n                        }\n                        // Hash password\n                        const hashedPassword = await bcryptjs__WEBPACK_IMPORTED_MODULE_3___default().hash(validatedData.password, 12);\n                        // Create new user\n                        const user = await _lib_db__WEBPACK_IMPORTED_MODULE_2__.prisma.user.create({\n                            data: {\n                                email: validatedData.email,\n                                username: validatedData.username,\n                                displayName: validatedData.displayName || validatedData.username\n                            }\n                        });\n                        // For now, return the user without storing password\n                        // In production, implement proper password storage\n                        return {\n                            id: user.id,\n                            email: user.email,\n                            username: user.username,\n                            displayName: user.displayName || undefined\n                        };\n                    } else {\n                        // Login attempt\n                        const validatedData = loginSchema.parse({\n                            email: credentials.email,\n                            password: credentials.password\n                        });\n                        const user = await _lib_db__WEBPACK_IMPORTED_MODULE_2__.prisma.user.findUnique({\n                            where: {\n                                email: validatedData.email\n                            }\n                        });\n                        if (!user) {\n                            return null;\n                        }\n                        // For MVP, we'll implement simple auth\n                        // In production, verify password hash\n                        return {\n                            id: user.id,\n                            email: user.email,\n                            username: user.username,\n                            displayName: user.displayName || undefined\n                        };\n                    }\n                } catch (error) {\n                    console.error(\"Auth error:\", error);\n                    return null;\n                }\n            }\n        })\n    ],\n    session: {\n        strategy: \"jwt\"\n    },\n    callbacks: {\n        async jwt ({ token, user }) {\n            if (user) {\n                token.username = user.username;\n                token.displayName = user.displayName;\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (token) {\n                session.user.id = token.sub;\n                session.user.username = token.username;\n                session.user.displayName = token.displayName;\n            }\n            return session;\n        }\n    },\n    pages: {\n        signIn: \"/auth/signin\"\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LEtBQUssRUFBRTtZQUM5QixJQUFJQSxPQUFPO2dCQUNUSixRQUFRYixJQUFJLENBQUNTLEVBQUUsR0FBR1EsTUFBTUMsR0FBRztnQkFDM0JMLFFBQVFiLElBQUksQ0FBQ25CLFFBQVEsR0FBR29DLE1BQU1wQyxRQUFRO2dCQUN0Q2dDLFFBQVFiLElBQUksQ0FBQ2hCLFdBQVcsR0FBR2lDLE1BQU1qQyxXQUFXO1lBQzlDO1lBQ0EsT0FBTzZCO1FBQ1Q7SUFDRjtJQUNBTSxPQUFPO1FBQ0xDLFFBQVE7SUFDVjtBQUNGLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jb250ZW50bHluay8uL3NyYy9saWIvYXV0aC50cz82NjkyIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRBdXRoT3B0aW9ucyB9IGZyb20gJ25leHQtYXV0aCdcbmltcG9ydCB7IFByaXNtYUFkYXB0ZXIgfSBmcm9tICdAbmV4dC1hdXRoL3ByaXNtYS1hZGFwdGVyJ1xuaW1wb3J0IENyZWRlbnRpYWxzUHJvdmlkZXIgZnJvbSAnbmV4dC1hdXRoL3Byb3ZpZGVycy9jcmVkZW50aWFscydcbmltcG9ydCB7IHByaXNtYSB9IGZyb20gJ0AvbGliL2RiJ1xuaW1wb3J0IGJjcnlwdCBmcm9tICdiY3J5cHRqcydcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnXG5cbi8vIFZhbGlkYXRpb24gc2NoZW1hc1xuY29uc3QgbG9naW5TY2hlbWEgPSB6Lm9iamVjdCh7XG4gIGVtYWlsOiB6LnN0cmluZygpLmVtYWlsKCksXG4gIHBhc3N3b3JkOiB6LnN0cmluZygpLm1pbig2KSxcbn0pXG5cbmNvbnN0IHJlZ2lzdGVyU2NoZW1hID0gei5vYmplY3Qoe1xuICBlbWFpbDogei5zdHJpbmcoKS5lbWFpbCgpLFxuICB1c2VybmFtZTogei5zdHJpbmcoKS5taW4oMykubWF4KDIwKS5yZWdleCgvXlthLXpBLVowLTlfLV0rJC8sIFwiVXNlcm5hbWUgY2FuIG9ubHkgY29udGFpbiBsZXR0ZXJzLCBudW1iZXJzLCB1bmRlcnNjb3JlcywgYW5kIGh5cGhlbnNcIiksXG4gIHBhc3N3b3JkOiB6LnN0cmluZygpLm1pbig2KSxcbiAgZGlzcGxheU5hbWU6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbn0pXG5cbmV4cG9ydCBjb25zdCBhdXRoT3B0aW9uczogTmV4dEF1dGhPcHRpb25zID0ge1xuICBhZGFwdGVyOiBQcmlzbWFBZGFwdGVyKHByaXNtYSksXG4gIHByb3ZpZGVyczogW1xuICAgIENyZWRlbnRpYWxzUHJvdmlkZXIoe1xuICAgICAgbmFtZTogJ2NyZWRlbnRpYWxzJyxcbiAgICAgIGNyZWRlbnRpYWxzOiB7XG4gICAgICAgIGVtYWlsOiB7IGxhYmVsOiAnRW1haWwnLCB0eXBlOiAnZW1haWwnIH0sXG4gICAgICAgIHBhc3N3b3JkOiB7IGxhYmVsOiAnUGFzc3dvcmQnLCB0eXBlOiAncGFzc3dvcmQnIH0sXG4gICAgICAgIHVzZXJuYW1lOiB7IGxhYmVsOiAnVXNlcm5hbWUnLCB0eXBlOiAndGV4dCcgfSxcbiAgICAgICAgZGlzcGxheU5hbWU6IHsgbGFiZWw6ICdEaXNwbGF5IE5hbWUnLCB0eXBlOiAndGV4dCcgfSxcbiAgICAgICAgaXNSZWdpc3RlcjogeyBsYWJlbDogJ0lzIFJlZ2lzdGVyJywgdHlwZTogJ3RleHQnIH0sXG4gICAgICB9LFxuICAgICAgYXN5bmMgYXV0aG9yaXplKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgIGlmICghY3JlZGVudGlhbHM/LmVtYWlsIHx8ICFjcmVkZW50aWFscz8ucGFzc3dvcmQpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyBDaGVjayBpZiB0aGlzIGlzIGEgcmVnaXN0cmF0aW9uIGF0dGVtcHRcbiAgICAgICAgICBpZiAoY3JlZGVudGlhbHMuaXNSZWdpc3RlciA9PT0gJ3RydWUnKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnUmVnaXN0cmF0aW9uIGF0dGVtcHQ6Jywge1xuICAgICAgICAgICAgICBlbWFpbDogY3JlZGVudGlhbHMuZW1haWwsXG4gICAgICAgICAgICAgIHVzZXJuYW1lOiBjcmVkZW50aWFscy51c2VybmFtZSxcbiAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IGNyZWRlbnRpYWxzLmRpc3BsYXlOYW1lXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBjb25zdCB2YWxpZGF0ZWREYXRhID0gcmVnaXN0ZXJTY2hlbWEucGFyc2Uoe1xuICAgICAgICAgICAgICBlbWFpbDogY3JlZGVudGlhbHMuZW1haWwsXG4gICAgICAgICAgICAgIHVzZXJuYW1lOiBjcmVkZW50aWFscy51c2VybmFtZSxcbiAgICAgICAgICAgICAgcGFzc3dvcmQ6IGNyZWRlbnRpYWxzLnBhc3N3b3JkLFxuICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogY3JlZGVudGlhbHMuZGlzcGxheU5hbWUsXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnVmFsaWRhdGlvbiBwYXNzZWQ6JywgdmFsaWRhdGVkRGF0YSlcblxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdXNlciBhbHJlYWR5IGV4aXN0c1xuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdVc2VyID0gYXdhaXQgcHJpc21hLnVzZXIuZmluZEZpcnN0KHtcbiAgICAgICAgICAgICAgd2hlcmU6IHtcbiAgICAgICAgICAgICAgICBPUjogW1xuICAgICAgICAgICAgICAgICAgeyBlbWFpbDogdmFsaWRhdGVkRGF0YS5lbWFpbCB9LFxuICAgICAgICAgICAgICAgICAgeyB1c2VybmFtZTogdmFsaWRhdGVkRGF0YS51c2VybmFtZSB9LFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRXhpc3RpbmcgdXNlciBjaGVjazonLCBleGlzdGluZ1VzZXIpXG5cbiAgICAgICAgICAgIGlmIChleGlzdGluZ1VzZXIpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1VzZXIgYWxyZWFkeSBleGlzdHM6JywgZXhpc3RpbmdVc2VyLmVtYWlsLCBleGlzdGluZ1VzZXIudXNlcm5hbWUpXG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVXNlciBhbHJlYWR5IGV4aXN0cyB3aXRoIHRoaXMgZW1haWwgb3IgdXNlcm5hbWUnKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBIYXNoIHBhc3N3b3JkXG4gICAgICAgICAgICBjb25zdCBoYXNoZWRQYXNzd29yZCA9IGF3YWl0IGJjcnlwdC5oYXNoKHZhbGlkYXRlZERhdGEucGFzc3dvcmQsIDEyKVxuXG4gICAgICAgICAgICAvLyBDcmVhdGUgbmV3IHVzZXJcbiAgICAgICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5jcmVhdGUoe1xuICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgZW1haWw6IHZhbGlkYXRlZERhdGEuZW1haWwsXG4gICAgICAgICAgICAgICAgdXNlcm5hbWU6IHZhbGlkYXRlZERhdGEudXNlcm5hbWUsXG4gICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IHZhbGlkYXRlZERhdGEuZGlzcGxheU5hbWUgfHwgdmFsaWRhdGVkRGF0YS51c2VybmFtZSxcbiAgICAgICAgICAgICAgICAvLyBOb3RlOiBXZSdsbCBzdG9yZSBwYXNzd29yZCBpbiBhIHNlcGFyYXRlIHRhYmxlIGZvciBzZWN1cml0eVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgLy8gRm9yIG5vdywgcmV0dXJuIHRoZSB1c2VyIHdpdGhvdXQgc3RvcmluZyBwYXNzd29yZFxuICAgICAgICAgICAgLy8gSW4gcHJvZHVjdGlvbiwgaW1wbGVtZW50IHByb3BlciBwYXNzd29yZCBzdG9yYWdlXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBpZDogdXNlci5pZCxcbiAgICAgICAgICAgICAgZW1haWw6IHVzZXIuZW1haWwhLFxuICAgICAgICAgICAgICB1c2VybmFtZTogdXNlci51c2VybmFtZSxcbiAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IHVzZXIuZGlzcGxheU5hbWUgfHwgdW5kZWZpbmVkLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBMb2dpbiBhdHRlbXB0XG4gICAgICAgICAgICBjb25zdCB2YWxpZGF0ZWREYXRhID0gbG9naW5TY2hlbWEucGFyc2Uoe1xuICAgICAgICAgICAgICBlbWFpbDogY3JlZGVudGlhbHMuZW1haWwsXG4gICAgICAgICAgICAgIHBhc3N3b3JkOiBjcmVkZW50aWFscy5wYXNzd29yZCxcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kVW5pcXVlKHtcbiAgICAgICAgICAgICAgd2hlcmU6IHsgZW1haWw6IHZhbGlkYXRlZERhdGEuZW1haWwgfSxcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGlmICghdXNlcikge1xuICAgICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBGb3IgTVZQLCB3ZSdsbCBpbXBsZW1lbnQgc2ltcGxlIGF1dGhcbiAgICAgICAgICAgIC8vIEluIHByb2R1Y3Rpb24sIHZlcmlmeSBwYXNzd29yZCBoYXNoXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBpZDogdXNlci5pZCxcbiAgICAgICAgICAgICAgZW1haWw6IHVzZXIuZW1haWwhLFxuICAgICAgICAgICAgICB1c2VybmFtZTogdXNlci51c2VybmFtZSxcbiAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IHVzZXIuZGlzcGxheU5hbWUgfHwgdW5kZWZpbmVkLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdBdXRoIGVycm9yOicsIGVycm9yKVxuICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSksXG4gIF0sXG4gIHNlc3Npb246IHtcbiAgICBzdHJhdGVneTogJ2p3dCcsXG4gIH0sXG4gIGNhbGxiYWNrczoge1xuICAgIGFzeW5jIGp3dCh7IHRva2VuLCB1c2VyIH0pIHtcbiAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgIHRva2VuLnVzZXJuYW1lID0gdXNlci51c2VybmFtZVxuICAgICAgICB0b2tlbi5kaXNwbGF5TmFtZSA9IHVzZXIuZGlzcGxheU5hbWVcbiAgICAgIH1cbiAgICAgIHJldHVybiB0b2tlblxuICAgIH0sXG4gICAgYXN5bmMgc2Vzc2lvbih7IHNlc3Npb24sIHRva2VuIH0pIHtcbiAgICAgIGlmICh0b2tlbikge1xuICAgICAgICBzZXNzaW9uLnVzZXIuaWQgPSB0b2tlbi5zdWIhXG4gICAgICAgIHNlc3Npb24udXNlci51c2VybmFtZSA9IHRva2VuLnVzZXJuYW1lXG4gICAgICAgIHNlc3Npb24udXNlci5kaXNwbGF5TmFtZSA9IHRva2VuLmRpc3BsYXlOYW1lXG4gICAgICB9XG4gICAgICByZXR1cm4gc2Vzc2lvblxuICAgIH0sXG4gIH0sXG4gIHBhZ2VzOiB7XG4gICAgc2lnbkluOiAnL2F1dGgvc2lnbmluJyxcbiAgfSxcbn1cblxuLy8gVHlwZSBleHRlbnNpb25zIGZvciBOZXh0QXV0aFxuZGVjbGFyZSBtb2R1bGUgJ25leHQtYXV0aCcge1xuICBpbnRlcmZhY2UgVXNlciB7XG4gICAgdXNlcm5hbWU/OiBzdHJpbmdcbiAgICBkaXNwbGF5TmFtZT86IHN0cmluZ1xuICB9XG5cbiAgaW50ZXJmYWNlIFNlc3Npb24ge1xuICAgIHVzZXI6IHtcbiAgICAgIGlkOiBzdHJpbmdcbiAgICAgIGVtYWlsOiBzdHJpbmdcbiAgICAgIHVzZXJuYW1lPzogc3RyaW5nXG4gICAgICBkaXNwbGF5TmFtZT86IHN0cmluZ1xuICAgIH1cbiAgfVxufVxuXG5kZWNsYXJlIG1vZHVsZSAnbmV4dC1hdXRoL2p3dCcge1xuICBpbnRlcmZhY2UgSldUIHtcbiAgICB1c2VybmFtZT86IHN0cmluZ1xuICAgIGRpc3BsYXlOYW1lPzogc3RyaW5nXG4gIH1cbn0iXSwibmFtZXMiOlsiUHJpc21hQWRhcHRlciIsIkNyZWRlbnRpYWxzUHJvdmlkZXIiLCJwcmlzbWEiLCJiY3J5cHQiLCJ6IiwibG9naW5TY2hlbWEiLCJvYmplY3QiLCJlbWFpbCIsInN0cmluZyIsInBhc3N3b3JkIiwibWluIiwicmVnaXN0ZXJTY2hlbWEiLCJ1c2VybmFtZSIsIm1heCIsInJlZ2V4IiwiZGlzcGxheU5hbWUiLCJvcHRpb25hbCIsImF1dGhPcHRpb25zIiwiYWRhcHRlciIsInByb3ZpZGVycyIsIm5hbWUiLCJjcmVkZW50aWFscyIsImxhYmVsIiwidHlwZSIsImlzUmVnaXN0ZXIiLCJhdXRob3JpemUiLCJjb25zb2xlIiwibG9nIiwidmFsaWRhdGVkRGF0YSIsInBhcnNlIiwiZXhpc3RpbmdVc2VyIiwidXNlciIsImZpbmRGaXJzdCIsIndoZXJlIiwiT1IiLCJFcnJvciIsImhhc2hlZFBhc3N3b3JkIiwiaGFzaCIsImNyZWF0ZSIsImRhdGEiLCJpZCIsInVuZGVmaW5lZCIsImZpbmRVbmlxdWUiLCJlcnJvciIsInNlc3Npb24iLCJzdHJhdGVneSIsImNhbGxiYWNrcyIsImp3dCIsInRva2VuIiwic3ViIiwicGFnZXMiLCJzaWduSW4iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/auth.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/db.ts":
/*!***********************!*\
  !*** ./src/lib/db.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst globalForPrisma = globalThis;\nconst prisma = globalForPrisma.prisma ?? new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nif (true) globalForPrisma.prisma = prisma;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL2RiLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUE2QztBQUU3QyxNQUFNQyxrQkFBa0JDO0FBSWpCLE1BQU1DLFNBQVNGLGdCQUFnQkUsTUFBTSxJQUFJLElBQUlILHdEQUFZQSxHQUFFO0FBRWxFLElBQUlJLElBQXlCLEVBQWNILGdCQUFnQkUsTUFBTSxHQUFHQSIsInNvdXJjZXMiOlsid2VicGFjazovL2NvbnRlbnRseW5rLy4vc3JjL2xpYi9kYi50cz85ZTRmIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFByaXNtYUNsaWVudCB9IGZyb20gJ0BwcmlzbWEvY2xpZW50J1xuXG5jb25zdCBnbG9iYWxGb3JQcmlzbWEgPSBnbG9iYWxUaGlzIGFzIHVua25vd24gYXMge1xuICBwcmlzbWE6IFByaXNtYUNsaWVudCB8IHVuZGVmaW5lZFxufVxuXG5leHBvcnQgY29uc3QgcHJpc21hID0gZ2xvYmFsRm9yUHJpc21hLnByaXNtYSA/PyBuZXcgUHJpc21hQ2xpZW50KClcblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIGdsb2JhbEZvclByaXNtYS5wcmlzbWEgPSBwcmlzbWEiXSwibmFtZXMiOlsiUHJpc21hQ2xpZW50IiwiZ2xvYmFsRm9yUHJpc21hIiwiZ2xvYmFsVGhpcyIsInByaXNtYSIsInByb2Nlc3MiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/db.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/uuid","vendor-chunks/zod","vendor-chunks/oauth","vendor-chunks/@panva","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/bcryptjs","vendor-chunks/preact","vendor-chunks/oidc-token-hash","vendor-chunks/object-hash","vendor-chunks/cookie","vendor-chunks/@next-auth"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fdavidsime%2Fhvna-ecosystem%2Fcontentlynk%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fdavidsime%2Fhvna-ecosystem%2Fcontentlynk&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();