"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function errorHandler(error) {
    switch (parseInt(error)) {
        case 1:
            return { message: "No Address Provided", status: 400 };
    }
}
exports.default = errorHandler;
