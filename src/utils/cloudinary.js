import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"


// (async function (filepath) {
//     cloudinary.config({
//         cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//         api_key: process.env.CLOUDINARY_API_KEY,
//         api_secret: process.env.CLOUDINARY_API_SECRET// Click 'View API Keys' above to copy your API secret
//     })
//     const uploadResult = await cloudinary.uploader.upload(
//         filepath, {
//         resource_type: auto,
//     }
//     )
//         .catch((error) => {
//             fs.unlinkSync(filepath)
//             throw new Error(error)
//         });

//     console.log(uploadResult);
// })("/img");

// Cloudinary file upload
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET// Click 'View API Keys' above to copy your API secret
})
const uploadResult = async (filepath) => {
    try {
        if (!filepath) return null;// throw new Error("Filepath not found !!")
        const response = await cloudinary.uploader.upload(filepath, {
            resource_type: "auto"
        })
        // console.log(response.url, "File has been uploaded to the cloudinary");
        fs.unlinkSync(filepath)
        return response;
    }
    catch (error) {
        fs.unlinkSync(filepath) //remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}
export default uploadResult