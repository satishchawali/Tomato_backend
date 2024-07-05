import mongoose from "mongoose";

export const connectDB = async () =>{
    await mongoose.connect('mongodb+srv://satishchawali:724893@cluster0.dqjxjvx.mongodb.net/food-del').then(()=>console.log("DB Connected"));

}