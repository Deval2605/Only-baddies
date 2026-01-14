import connectDB from "../../../lib/db";
import User from "../../../models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const { action, id, password } = await req.json();

    // --- 1. SECURITY CHECK ---
    // Compare the password sent from UI with the one in your .env file
    if (password !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ success: false, error: "Access Denied: Wrong Password" });
    }

    // --- 2. ACTION: GET STATS ---
    if (action === "stats") {
        const userCount = await User.countDocuments();
        const baddieCount = await User.countDocuments({ isBaddie: true });
        
        // Get database storage size (MongoDB command)
        let storageSize = "0 KB";
        try {
            const stats = await User.db.db.command({ collStats: "users" }); 
            storageSize = (stats.storageSize / 1024).toFixed(2) + " KB";
        } catch (e) {
            // Fallback if permission denied on free tier
            storageSize = "Unknown (Free Tier)";
        }

        return NextResponse.json({ 
            success: true, 
            data: { userCount, baddieCount, storageSize } 
        });
    }

    // --- 3. ACTION: DELETE USER ---
    if (action === "delete" && id) {
        await User.findByIdAndDelete(id);
        return NextResponse.json({ success: true, message: "User deleted successfully" });
    }

    return NextResponse.json({ success: false, error: "Invalid Action" });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}