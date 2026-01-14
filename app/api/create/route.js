import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "../../../lib/db";
import User from "../../../models/User";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();

    // --- 1. AGE CHECK (Server Side Security) ---
    // We expect data.dob to be sent from the frontend
    if (!data.dob) {
        return NextResponse.json({ success: false, error: "Date of Birth is required." });
    }

    const birthDate = new Date(data.dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if birthday hasn't happened yet this year
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    if (age < 18) {
        return NextResponse.json({ success: false, error: "You must be 18+ to join Only Baddies." });
    }

    // --- 2. AI ANALYSIS (Real Human + Baddie Check) ---
    const cleanBase64 = data.imageBase64.split(',')[1];
    
    // We use the specific model that works for you
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `Analyze this image for a dating app profile.
    1. STRICTLY Check: Is this a photo of a REAL HUMAN person's face? (Reject cartoons, anime, landscapes, blurry objects, masks, or group photos).
    2. If it is a Real Human: Does their style match the 'baddie' aesthetic (confident, stylish, trendy, photogenic)?
    
    Return ONLY a JSON object: 
    { 
        "isRealPerson": boolean, 
        "isBaddie": boolean, 
        "reason": "short explanation" 
    }`;

    const imagePart = { inlineData: { data: cleanBase64, mimeType: "image/jpeg" } };
    
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    const analysis = JSON.parse(responseText.replace(/```json|```/g, "").trim());

    if (!analysis.isRealPerson) {
        return NextResponse.json({ success: false, error: "AI Error: Please upload a clear photo of a real person." });
    }

    // --- 3. SAVE TO DATABASE ---
    // We use findOneAndUpdate so if they upload again, it updates their profile instead of creating a duplicate.
    const user = await User.findOneAndUpdate(
        { email: data.email }, 
        {
            name: data.name,
            bio: data.bio,
            location: data.location,
            imageUrl: data.imageBase64,
            email: data.email,
            dob: birthDate,
            age: age,
            isBaddie: analysis.isBaddie,
            aiReason: analysis.reason
        },
        { new: true, upsert: true } // Create if doesn't exist, Update if it does
    );

    return NextResponse.json({ success: true, user });

  } catch (error) {
    console.error("Create Profile Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}