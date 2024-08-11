class apiResponse {
    constructor(resMessage = "Success", resStatus, resData) {
        this.resMessage = resMessage,
            this.resStatus = resStatus,
            this.resData = resData,
            this.success = resStatus < 400
    }
}
export { apiResponse }