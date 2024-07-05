import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://satishchawali:724893@cluster0.dqjxjvx.mongodb.net/food-del', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        });
        console.log('DB Connected');
    } catch (error) {
        console.error('DB Connection Error:', error);
    }
}
