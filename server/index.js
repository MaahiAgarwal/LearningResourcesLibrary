import { dbConnect } from "./src/config/db.js";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

dbConnect()
.then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((error) => {
    console.log("Database connection error: ",error);
    process.exit(1);
})