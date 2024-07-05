const mongoose = require('mongoose');
const connectDB = process.env.DATABASE_URL;
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });


export default connectDB