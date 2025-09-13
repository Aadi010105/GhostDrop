import { clerkClient } from "@clerk/clerk-sdk-node";

async function createJwt() {
  const userId = "user_32adVCknJevFrgyMDmens4kXNfe"; // Replace with your user ID
  const jwt = await clerkClient.sessions.create({
    userId,
    attributes: { role: "OWNER" }, // optional metadata override
  });
  console.log("JWT token:", jwt.id);
}

createJwt();
