import express from 'express';
import Thread from '../models/thread.js';
import User from '../models/user.js';   
import passport from '../utils/passport.js';
import jwt from 'jsonwebtoken'

import { getGroqChatCompletion } from '../utils/Response.js';
import { getThreadTitle } from '../utils/Response.js';
import thread from '../models/thread.js';
const router = express.Router();

//Get all threads
router.get("/allChats", passport.authenticate("jwt", {session: false}), async(req,res) => {
    try {
        const allThreads = await User.findById(req.user._id).populate("threads");
        res.send(
            {
                threads : allThreads.threads.reverse(),
                user: req.user,
            }
        );
    } catch(err) {
        console.log(err);
    }  
})

router.get("/chat/:chatId", async(req,res) => {
    const { chatId } = req.params;
    try {
        const thread = await Thread.findOne({ threadId: chatId });
        if(!thread) {
            res.status(404).json({error : "Chat not found"});
        } else {
            res.send(thread);
        }
        
    } catch(err) {
        console.log(err)
    }
})

router.delete("/chat/:chatId", passport.authenticate("jwt", {session: false}), async (req,res) => {
    const { chatId } = req.params;
    try {
        const thread = await Thread.findOne({threadId: chatId});
        const deletedChat = await Thread.findOneAndDelete({threadId: chatId});
        const user = await User.findByIdAndUpdate(req.user._id, { $pull : { threads: thread._id }}, { new: true });
        if(!deletedChat) {
            res.status(404).json({error: "Chat not found"})
        } else {
            res.status(200).json({success: "Chat deleted successfully"})
        }
    }catch(err) {
        console.log(err); 
        res.status(500).json({error: "Failed to delete chat"})
    }
})

router.post("/chat", passport.authenticate("jwt", {session: false}), async(req,res) => {
    let { threadId, message, aiModel, aiModelBehave } = req.body;

    if(!threadId || !message)  {
        res.status(400).json({error: "username or password missing"});
    } else {   
        try {
            let thread = await Thread.findOne({threadId});
            if(!thread) {
                const title = await getThreadTitle(message, aiModel)
                //Create a new thread 
                thread = new Thread({
                    threadId,
                    title:  title.choices[0]?.message?.content,
                    messages: [{
                        role: "user",
                        content: message
                    }]
                }) 
            } else {
                thread.messages.push({
                    role: "user",
                    content: message,
                })  
            }
            // Passing user message to the api
            const chatCompletion = await getGroqChatCompletion(message, aiModel, aiModelBehave);
            // Getting response and pushing to the DB
            if(!chatCompletion) {
                res.status(400).json({error : chatCompletion.error.message})
            } else {
                thread.messages.push({
                    role: "assistant",
                    content: chatCompletion.choices[0]?.message?.content || ""
                })
            }
            
            await thread.save()
            const user = await User.findById(req.user._id);
            if (!user.threads.some(t => t.toString() === thread._id.toString())) {
                user.threads.push(thread._id);
                await user.save();
            }
            res.send({reply : chatCompletion.choices[0]?.message?.content || ""})   
        }catch(err) {
            console.log(err)
            res.status(400).json({error : "Some error occured in API"})
        } 
    }
})
export default router;