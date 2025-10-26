import { clerkClient } from "@clerk/express";

//Middleware to check userId and hasPremium Plan

export const auth =async (req,res,next) => {
       try {
       // const{userId,has}=await req.auth();
       const { userId } = req.auth();

        //const hasPremiumPlan=await has({plan:'Premium'});


        const user=await clerkClient.users.getUser(userId);

        const hasPremiumPlan = user.privateMetadata?.subscription === 'Premium' || 
                              user.privateMetadata?.plan === 'Premium';

        console.log("Auth middleware -> userId:", userId);
    console.log("Auth middleware -> hasPremiumPlan:", hasPremiumPlan);
    console.log("Auth middleware -> privateMetadata:", user.privateMetadata); 
    
                  

        if(!hasPremiumPlan && user.privateMetadata?.free_usage !== undefined){
            req.free_usage=user.privateMetadata.free_usage
        }
        else {
            await clerkClient.users.updateUserMetadata(userId,{
                privateMetadata: {
                    free_usage:0
                }
            })
           
            req.free_usage=0;
        } 
        req.plan=hasPremiumPlan ? 'Premium' :'free';
        next();
    } catch (error) {
        console.log(error.response?.data);
        console.error("Auth middleware error:", error.message);
        res.json({success :false,message:error.message})

        }
       }


    