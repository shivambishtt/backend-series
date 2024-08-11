// export const asyncHandler = (fn) => {
//     async (err, req, res, next) => {
//         try {
//             await fn(req, res, next)
//         } catch (error) {
//             res.status(err.code || 500).json({
//                 success: false,
//                 message: err.message,
//             })
//             console.log("Error occured", error);

//         }
//     }
// }


const asyncHandler = (handlerFunc) => {
    (req, res, next) => {
        Promise.resolve(handlerFunc(req, res, next)).reject((err) => next(err))
    }
};


export default asyncHandler

