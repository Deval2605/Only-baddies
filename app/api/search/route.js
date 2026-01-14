import { GoogleGenerativeAI } from "@google/generative-ai";
// We use relative paths (../../../) to ensure the system finds the files
import connectDB from "../../../lib/db";
import User from "../../../models/User";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function POST(req) {
  try {
    await connectDB();
    const { query } = await req.json();

    // If search is empty, return recent users
    if (!query) {
      const users = await User.find({}).limit(20);
      return NextResponse.json({ users });
    }

    // AI Translation Layer: English -> MongoDB Query
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });    
    const prompt = `You are a MongoDB query translator.
    User Schema: { name: String, bio: String, location: String, isBaddie: Boolean }
    
    Translate: "${query}" into a MongoDB find query JSON.
    Example: "Find baddies in NYC" -> { "location": { "$regex": "NYC", "$options": "i" }, "isBaddie": true }
    
    Return ONLY the JSON string.`;

    const result = await model.generateContent(prompt);
    const mongoQueryString = result.response.text().replace(/```json|```/g, "").trim();
    
    const mongoQuery = JSON.parse(mongoQueryString);

    const users = await User.find(mongoQuery).limit(20);
    return NextResponse.json({ users });

  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}