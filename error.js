/**
 * @module error
 */
const statuses = require("statuses");

/**
 * 
 * @class FetchError
 * @extends Error
 * @property {Response} response - The response object
 */
class FetchError extends Error {
    /**
     * Constructor for FetchError
     * @param {Response} res - The response object
     */
    constructor(res) {
        super(statuses(res.status));

        this.name = "FetchError";
        this.response = res;
    }
} 

/**
 * @export {FetchError}   
 */
exports.FetchError = FetchError;