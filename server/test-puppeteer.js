"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var puppeteer_1 = __importDefault(require("puppeteer"));
var testPuppeteerScraping = function () { return __awaiter(void 0, void 0, void 0, function () {
    var browser, page, forumUrl, topics, keywords_1, matches_1, html, fs, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('🚀 Запуск браузера...\n');
                return [4 /*yield*/, puppeteer_1.default.launch({
                        headless: true,
                        args: ['--no-sandbox', '--disable-setuid-sandbox']
                    })];
            case 1:
                browser = _a.sent();
                return [4 /*yield*/, browser.newPage()];
            case 2:
                page = _a.sent();
                _a.label = 3;
            case 3:
                _a.trys.push([3, 12, 13, 15]);
                forumUrl = 'https://dota2.ru/forum/forums/obmen-predmetami-dota-2.910/';
                console.log("\uD83D\uDCE5 \u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B: ".concat(forumUrl, "\n"));
                return [4 /*yield*/, page.goto(forumUrl, {
                        waitUntil: 'networkidle2',
                        timeout: 30000
                    })];
            case 4:
                _a.sent();
                console.log('✅ Страница загружена\n');
                // Ждём загрузки контента
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
            case 5:
                // Ждём загрузки контента
                _a.sent();
                return [4 /*yield*/, page.evaluate(function () {
                        var results = [];
                        // Пробуем разные селекторы
                        var selectors = [
                            '.forum__block-topic-title',
                            'div[class*="forum__block"]',
                            'a[href*="topic"]',
                            '.component-block__block'
                        ];
                        for (var _i = 0, selectors_1 = selectors; _i < selectors_1.length; _i++) {
                            var selector = selectors_1[_i];
                            var elements = document.querySelectorAll(selector);
                            if (elements.length > 0) {
                                console.log("\u041D\u0430\u0439\u0434\u0435\u043D\u043E ".concat(elements.length, " \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432 \u0441 \u0441\u0435\u043B\u0435\u043A\u0442\u043E\u0440\u043E\u043C: ").concat(selector));
                                elements.forEach(function (el) {
                                    var _a;
                                    // Ищем ссылку внутри или рядом
                                    var link = el.querySelector('a') || el.closest('a');
                                    var title = ((_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
                                    var href = (link === null || link === void 0 ? void 0 : link.getAttribute('href')) || el.getAttribute('data-url');
                                    if (title && href && !results.find(function (r) { return r.url === href; })) {
                                        results.push({ title: title, url: href });
                                    }
                                });
                                if (results.length > 0)
                                    break;
                            }
                        }
                        return results;
                    })];
            case 6:
                topics = _a.sent();
                console.log("\n\uD83D\uDCCB \u041D\u0430\u0439\u0434\u0435\u043D\u043E \u0442\u043E\u043F\u0438\u043A\u043E\u0432: ".concat(topics.length, "\n"));
                if (!(topics.length > 0)) return [3 /*break*/, 7];
                console.log('Первые 10 топиков:\n');
                topics.slice(0, 10).forEach(function (topic, i) {
                    console.log("".concat(i + 1, ". \"").concat(topic.title.substring(0, 60)).concat(topic.title.length > 60 ? '...' : '', "\""));
                    console.log("   URL: ".concat(topic.url, "\n"));
                });
                keywords_1 = ['продам', 'куплю', 'обмен', 'cache'];
                console.log('\n🔑 Поиск совпадений с ключевыми словами:\n');
                matches_1 = 0;
                topics.forEach(function (topic) {
                    var titleLower = topic.title.toLowerCase();
                    for (var _i = 0, keywords_2 = keywords_1; _i < keywords_2.length; _i++) {
                        var keyword = keywords_2[_i];
                        if (titleLower.includes(keyword.toLowerCase())) {
                            matches_1++;
                            console.log("\u2705 \"".concat(topic.title, "\""));
                            console.log("   \u041A\u043B\u044E\u0447\u0435\u0432\u043E\u0435 \u0441\u043B\u043E\u0432\u043E: \"".concat(keyword, "\""));
                            console.log("   URL: ".concat(topic.url, "\n"));
                            break;
                        }
                    }
                });
                console.log("\n\uD83D\uDCCA \u0412\u0441\u0435\u0433\u043E \u0441\u043E\u0432\u043F\u0430\u0434\u0435\u043D\u0438\u0439: ".concat(matches_1));
                return [3 /*break*/, 11];
            case 7:
                console.log('❌ Топики не найдены. Сохраняю скриншот и HTML...\n');
                return [4 /*yield*/, page.screenshot({ path: 'debug-screenshot.png', fullPage: true })];
            case 8:
                _a.sent();
                return [4 /*yield*/, page.content()];
            case 9:
                html = _a.sent();
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('fs')); })];
            case 10:
                fs = _a.sent();
                fs.writeFileSync('debug-page.html', html);
                console.log('✅ Сохранены: debug-screenshot.png, debug-page.html');
                _a.label = 11;
            case 11: return [3 /*break*/, 15];
            case 12:
                error_1 = _a.sent();
                console.error('❌ Ошибка:', error_1);
                return [3 /*break*/, 15];
            case 13: return [4 /*yield*/, browser.close()];
            case 14:
                _a.sent();
                console.log('\n🔚 Браузер закрыт');
                return [7 /*endfinally*/];
            case 15: return [2 /*return*/];
        }
    });
}); };
testPuppeteerScraping();
