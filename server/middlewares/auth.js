import { clerkClient } from "@clerk/express";

//Middleware to check userId and hasPreemium Plan

export const auth =async (req,res,next) => {
       try {
        const{userId,has}=await req.auth();
        const hasPremium=await has({plan:'premium'});
        const user=await clerkClient.users.getUser(userId);

        if(!hasPremiumPlan && user.privateMetadatafree_usage){
            req.free_usage=user.privateMetadata.free_usage
        }
        else {
            await clerkClient.users.updateUserMetadata(userId,{
                privateMetaData: {
                    free_usage:0
                }
            })
           
            req.free_usage=0;
        } 
        req.plan=hasPremium ? 'premium' :'free';
        next()
    } catch (error) {
        res.json({success :false,message:error.message})

        }
       }


    