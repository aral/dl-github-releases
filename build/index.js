"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var multi_progress_1 = __importDefault(require("multi-progress"));
var get_releases_1 = __importDefault(require("./get-releases"));
var download_1 = __importDefault(require("./download"));
var rpad_1 = __importDefault(require("./rpad"));
var extract_zip_1 = __importDefault(require("extract-zip"));
var util_1 = require("util");
var path_1 = require("path");
var fs_extra_1 = require("fs-extra");
var extract = util_1.promisify(extract_zip_1.default);
function pass() {
    return true;
}
function downloadReleases(user, repo, outputDir, filterRelease, filterAsset, unzip) {
    if (filterRelease === void 0) { filterRelease = pass; }
    if (filterAsset === void 0) { filterAsset = pass; }
    if (unzip === void 0) { unzip = false; }
    return __awaiter(this, void 0, void 0, function () {
        var bars, releases, filteredReleases;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs_extra_1.ensureDir(outputDir)];
                case 1:
                    _a.sent();
                    bars = new multi_progress_1.default(process.stdout);
                    return [4 /*yield*/, get_releases_1.default(user, repo)];
                case 2:
                    releases = _a.sent();
                    filteredReleases = releases.filter(filterRelease)
                        .map(function (release) {
                        var filteredAssets = release.assets.filter(filterAsset);
                        return __assign({}, release, { assets: filteredAssets });
                    });
                    return [4 /*yield*/, Promise.all(filteredReleases.map(function (release) {
                            if (!release) {
                                throw new Error("could not find a release for " + user + "/" + repo);
                            }
                            console.log("Downloading " + user + "/" + repo + "@" + release.tag_name + "...");
                            var promises = release.assets.map(function (asset) {
                                var width = process.stdout.columns - 36;
                                var bar = bars.newBar(rpad_1.default(asset.name, 24) + " :bar :etas", {
                                    complete: "▇",
                                    incomplete: "-",
                                    width: width,
                                    total: 100,
                                });
                                var progress = process.stdout.isTTY ? bar.update.bind(bar) : pass;
                                var destf = path_1.join(outputDir, asset.name);
                                var dest = fs_1.createWriteStream(destf);
                                return download_1.default(asset.browser_download_url, dest, progress)
                                    .then(function () {
                                    if (unzip && /\.zip$/.exec(destf)) {
                                        return extract(destf, { dir: outputDir }).then(function () { return fs_1.unlinkSync(destf); });
                                    }
                                    return null;
                                });
                            });
                            return Promise.all(promises);
                        }))];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.default = downloadReleases;
