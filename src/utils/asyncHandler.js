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



// basically what is happening here is our asyncHandler is a HOF it has nothing but a try catch block
const asyncHandler = (handlerFunc) => {
    return (req, res, next) => {
        Promise.resolve(handlerFunc(req, res, next)).catch((err) => next(err))
    }
};


export default asyncHandler

