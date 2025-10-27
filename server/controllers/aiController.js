import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import {v2 as cloudinary} from 'cloudinary';
import axios from "axios";
import fs from 'fs'
import pdf from 'pdf-parse-fork'
import FormData from "form-data";
//import cloudinary from "../configs/cloudinary.js"


const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export const generateArticle =async (req,res)=> {
    try {
        const {userId} =req.auth();
        const {prompt,length} =req.body;
        const plan =req.plan;
        const free_usage=req.free_usage;

        if(plan !== 'Premium' && free_usage >=10){
            return res.json({success: false , message:"Limit exceeded .Upgrade to continue"})
                
        }

        const response = await AI.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
        {
            role: "user",
            content: prompt,
        },
    ],
    temperature:0.7,
    max_tokens:length,
});
const content =response.choices[0].message.content

await sql`INSERT INTO creations(user_id,prompt,content,type) 
VALUES(${userId},${prompt},${content}, 'article')`;

if(plan !== 'Premium'){
    await clerkClient.users.updateUserMetadata(userId,{
        privateMetadata:{
            free_usage:free_usage+1
        }
    })
}
res.json({success:true,content})
    }
    
        catch (error){
       console.log(error.message)
       res.json({success:false,message:error.message})
        }

    }
    

    export const generateBlogTitle =async (req,res)=> {
    try {
        const {userId} =req.auth();
        const {prompt} =req.body;
        const plan =req.plan;
        const free_usage=req.free_usage;

        if(plan !== 'Premium' && free_usage >=10){
            return res.json({success: false , message:"Limit exceeded .Upgrade to continue"})
                
        }

        const response = await AI.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
        {
            role: "user",
            content: prompt,
        },
    ],
    temperature:0.7,
    max_tokens:100,
});
const content =response.choices[0].message.content

await sql`INSERT INTO creations(user_id,prompt,content,type) 
VALUES(${userId},${prompt},${content}, 'blog-title')`;

if(plan !== 'Premium'){
    await clerkClient.users.updateUserMetadata(userId,{
        privateMetadata:{
            free_usage:free_usage+1
        }
    })
}
res.json({success:true,content})
    }
    
        catch (error){
       console.log(error.message)
       res.json({success:false,message:error.message})
        }

    }





export const generateImage = async (req, res) => {
  try {
    console.log("generate-image route hit ✅");
    console.log("User Plan:", req.plan);

    const { userId } = req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "Premium") {
      return res.json({
        success: false,
        message: "This feature is only valid for premium subscription.",
      });
    }

    const formData = new FormData();
    formData.append("prompt", prompt);

    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "x-api-key": process.env.CLIPDROP_API_KEY,
        },
        responseType: "arraybuffer",
      }
    );

    // Convert binary → base64
    const base64Image = `data:image/png;base64,${Buffer.from(data, "binary").toString("base64")}`;

    const uploadResult = await cloudinary.uploader.upload(base64Image);

    await sql`
      INSERT INTO creations(user_id, prompt, content, type, publish)
      VALUES(${userId}, ${prompt}, ${uploadResult.secure_url}, 'image', ${publish ?? false})
    `;

    res.json({ success: true, content: uploadResult.secure_url });
  } catch (error) {
    console.error("Error in generateImage:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.error || error.message,
    });
  }
};


    export const removeImageBackground =async (req,res)=> {
    try {
        const {userId} =req.auth();
        const image =req.file;
        const plan =req.plan;
        

        if(plan !== 'Premium' ){
            return res.json({success: false , message:"This feature only valid for premium subscription"})
                
        }

        

const {secure_url}=await cloudinary.uploader.upload(image.path,{
    transformation:[
        {
            effect:'background_removal',
            background_removal:'remove the background'
        }
    ]
})

await sql`INSERT INTO creations(user_id,prompt,content,type) 
VALUES(${userId},'Remove background from the image',${secure_url}, 'image')`;


res.json({success:true,content:secure_url})
    }
    
        catch (error){
       console.log(error.message)
       res.json({success:false,message:error.message})
        }

    }




    export const removeImageObject =async (req,res)=> {
    try {
        const {userId} =req.auth();
        const {object} =req.body;
        const image =req.file;
        const plan =req.plan;
        //const free_usage=req.free_usage;

        if(plan !== 'Premium' ){
            return res.json({success: false , message:"This feature only valid for premium subscription"})
                
        }

        

const {public_id}=await cloudinary.uploader.upload(image.path)

const imageUrl=cloudinary.url(public_id,{
    transformation:[{effect:`gen_remove:${object}`}],
    resource_type:'image'
})

await sql`INSERT INTO creations(user_id,prompt,content,type) 
VALUES(${userId},${`Remove ${object} from image`},${imageUrl}, 'image')`;


res.json({success:true,content:imageUrl})
    }
    
        catch (error){
       console.log(error.message)
       res.json({success:false,message:error.message})
        }

    }



    export const resumeReview =async (req,res)=> {
    try {
        const {userId} =req.auth();
        const resume =req.file;
        const plan =req.plan;
        //const free_usage=req.free_usage;

        if(plan !== 'Premium' ){
            return res.json({success: false , message:"This feature only valid for premium subscription"})
                
        }
        if(resume.size>5*1024*1024){
            return res.json({success:false,message:"Resume size exceeds allowed size(5mb)"})
        }
        const dataBuffer =fs.readFileSync(resume.path);
        const pdfData  =await pdf(dataBuffer)

        const prompt=`Review the following resume and provide constructive 
        feedback on its strength,weakness,and areas for improvement.Resume
        content:\n\n${pdfData.text}`

         const response = await AI.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
        {
            role: "user",
            content: prompt,
        },
    ],
    temperature:0.7,
    max_tokens:1000,
});
const content =response.choices[0].message.content
        

await sql`
INSERT INTO creations(user_id,prompt,content,type) 
VALUES(${userId},${'Review the uploaded resume'},${content}, 'resume-review')
`;


res.json({success:true,content:content})
    }
    
        catch (error){
       console.log(error.message)
       res.json({success:false,message:error.message})
        }

    }
    