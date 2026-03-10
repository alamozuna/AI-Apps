import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = "AIzaSyCM2vv6rTzCl0aSIXJOu1kKr-O8FvLFSiA";
const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
  try {
    // Actually the SDK might not expose listModels directly on the main class in some versions,
    // let's just do a direct fetch request using standard Node.js fetch
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error fetching models:", error);
  }
}

listModels();
