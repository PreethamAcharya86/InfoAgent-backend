import express from 'express'
import User from '../models/user.js'
import { compareSync, hashSync } from 'bcrypt';
import jwt from 'jsonwebtoken'
import passport from '../utils/passport.js';
const router = express.Router();

router.post("/login", async(req,res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({ email: email });
        if(!user) {
            return res.status(401).send({ error: "User not found!" });
        }
        if(!compareSync(password, user.password)) {
            return res.status(404).send({ error: "Incurrect password!"});
        }

        const payload = {
            username: user.username,
            id: user._id
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn : "7d"});
        res.send({
            user : {
                id : user._id,
                email: user.email,
                username : user.username
            },
            message: "Login successfull",
            token: `Bearer ${token}`
        })
    }catch(err) {
        console.log(err)
        res.status(500).json({ error: "Something went wrong please try again later." });
    }
    
});

router.post("/signup", async(req,res) => {
    let {email, username, password} = req.body;
    try {
        const user = new User({
            email,
            username, 
            password: hashSync(password, 10)
        });
        await user.save();

        const payload = {
            username: user.username,
            id: user._id
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn : "7d"});
        res.send({
            user : {
                id : user._id,
                email: user.email,
                username : user.username
            },
            message: "Login successfull",
            token: `Bearer ${token}`
        })
    }catch(err) {
        res.status(500).json({ error: "Some parameters missing" })
    }
})

router.get("/logout", async (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.json({ message: "Logged out successfully" });
  });
});


router.delete("/user/del", async(req,res) => {
    try {
        const delUser = await User.deleteMany({}) 
        res.send("All deleted successfully.")
    }catch(err) {
        console.log(err)
        res.status(500).json({ error: "Something went wrong please try again later." })
    }
})

export default router