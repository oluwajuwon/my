export const describeAuthError=(error:unknown,fallback="Something went wrong. Please try again."):string=>{
 const message=error instanceof Error?error.message:String(error??"");const value=message.toLowerCase();
 if(value.includes("invalid login")||value.includes("invalid credentials"))return "That email and password combination wasn’t recognised.";
 if(value.includes("email not confirmed"))return "Confirm your email using the link we sent, then try again.";
 if(value.includes("already registered")||value.includes("already exists"))return "An account already exists for that email. Try signing in instead.";
 if(value.includes("password")&&(value.includes("short")||value.includes("least")))return "Use at least 8 characters for your password.";
 if(value.includes("rate")||value.includes("too many"))return "Too many attempts. Wait a moment, then try again.";
 if(value.includes("fetch")||value.includes("network")||value.includes("load failed"))return "Vela couldn’t reach the server. Check your connection and try again.";
 return fallback;
};
