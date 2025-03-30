import { GoogleGenerativeAI } from "@google/generative-ai";
import express from "express";

const genAI = new GoogleGenerativeAI("AIzaSyDcB8q3jVebPH5oGyzYq4EoBP1qPRAhuPA");

async function generateSQL(naturalLanguageQuery) {
    const prompt = `Generate only the SQL query for the following natural language request without any explanation:\n\nQuery: "${naturalLanguageQuery}"`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const response = await model.generateContent(prompt);

    if (response.response && response.response.candidates.length > 0) {
        let sqlQuery = response.response.candidates[0].content.parts[0].text;
        sqlQuery = sqlQuery.replace(/```sql|```/g, "").trim(); // Remove Markdown SQL formatting
        return sqlQuery;
    }

    return "SQL query generation failed.";
}

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies

app.get("/", (req, res) => {
    res.send("Welcome to the SQL Query Generator API!");
})

app.post("/query", async (req, res) => {
    const naturalLanguageQuery = req.body.query;

    if (!naturalLanguageQuery) {
        return res.status(400).json({ error: "Query is required" });
    }

    const sqlQuery = await generateSQL(naturalLanguageQuery);
    console.log(sqlQuery);

    res.json({ sql_query : sqlQuery });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
