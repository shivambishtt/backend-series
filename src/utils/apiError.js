class apiError extends Error {
    constructor(errStatus, errName = [], errMessage = "Something went wrong", stack = "") {
        super(errMessage)
        this.errStatus = errStatus
        this.data = null
        this.errMessage = errMessage
        this.success = false
        this.errName = errName

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }

}
export {apiError}