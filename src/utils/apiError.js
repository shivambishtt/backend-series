class apiError extends Error {
    constructor(errStatus, errMessage = "Something went wrong", errors = [], stack = "") {
        super(errMessage)
        this.errStatus = errStatus,
            this.errMessage = errMessage,
            this.data = null,
            this.errors = errors,
            this.success = false;

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }

}
export default apiError