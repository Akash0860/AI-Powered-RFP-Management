import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Uncomment to see available models
// listGeminiModels();

const geminiModel = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

// Convert natural language to structured RFP
export async function parseRFPFromNaturalLanguage(userInput) {
  const prompt = `You are an AI assistant helping to convert natural language procurement requests into structured RFP data.

User input: "${userInput}"

Extract and return a JSON object with the following structure:
{
  "title": "Brief title for this RFP",
  "description": "Detailed description of what is being procured",
  "budget": numeric value (just the number, no currency symbols),
  "delivery_deadline": "YYYY-MM-DD format or null",
  "payment_terms": "e.g., net 30, net 60, etc.",
  "warranty_period": "e.g., 1 year, 2 years, etc.",
  "items": [
    {
      "name": "item name",
      "quantity": numeric value,
      "specifications": "detailed specs"
    }
  ]
}

Only return the JSON object, no other text.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const content = response.choices[0].message.content.trim();
    // Remove markdown code blocks if present
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error('Error parsing RFP with AI:', error);
    throw new Error('Failed to parse RFP from natural language');
  }
}

// Parse vendor response email into structured proposal data
export async function parseVendorResponse(emailBody, rfpData) {
  const prompt = `You are an AI assistant helping to extract structured proposal data from vendor email responses.

RFP Details:
${JSON.stringify(rfpData, null, 2)}

Vendor Response Email:
"${emailBody}"

Extract and return a JSON object with the following structure:
{
  "total_price": numeric value (just the number),
  "delivery_timeline": "e.g., 30 days, 2 weeks, etc.",
  "payment_terms": "e.g., net 30, net 60, etc.",
  "warranty_period": "e.g., 1 year, 2 years, etc.",
  "items": [
    {
      "name": "item name",
      "quantity": numeric value,
      "unit_price": numeric value,
      "specifications": "any specs mentioned"
    }
  ],
  "additional_terms": "any other terms, conditions, or notes mentioned"
}

Only return the JSON object, no other text. If any field cannot be determined from the email, use null.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const content = response.choices[0].message.content.trim();
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error('Error parsing vendor response with AI:', error);
    throw new Error('Failed to parse vendor response');
  }
}

// Compare proposals and generate recommendations
export async function compareProposals(rfpData, proposals) {
  const prompt = `You are an AI assistant helping a procurement manager evaluate vendor proposals.

RFP Details:
${JSON.stringify(rfpData, null, 2)}

Vendor Proposals:
${JSON.stringify(proposals, null, 2)}

Please analyze these proposals and provide:
1. A score (0-10) for each proposal based on:
   - Price competitiveness
   - Delivery timeline
   - Terms compliance
   - Completeness of response

2. A summary for each proposal (2-3 sentences)

3. An overall recommendation explaining which vendor should be selected and why

Return a JSON object with this structure:
{
  "proposal_scores": [
    {
      "proposal_id": "uuid",
      "vendor_name": "name",
      "score": numeric 0-10,
      "summary": "brief summary"
    }
  ],
  "recommendation": {
    "recommended_vendor_id": "uuid",
    "recommended_vendor_name": "name",
    "reasoning": "detailed explanation of why this vendor should be selected"
  }
}

Only return the JSON object, no other text.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
    });

    const content = response.choices[0].message.content.trim();
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error('Error comparing proposals with AI:', error);
    throw new Error('Failed to compare proposals');
  }
}

// ============================================
// GOOGLE GEMINI VERSIONS (FREE)
// ============================================

// Convert natural language to structured RFP using Google Gemini
export async function parseRFPFromNaturalLanguageGemini(userInput) {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY is not set in environment variables');
  }

  const prompt = `You are an AI assistant helping to convert natural language procurement requests into structured RFP data.

User input: "${userInput}"

Extract and return a JSON object with the following structure:
{
  "title": "Brief title for this RFP",
  "description": "Detailed description of what is being procured",
  "budget": numeric value (just the number, no currency symbols),
  "delivery_deadline": "YYYY-MM-DD format or null",
  "payment_terms": "e.g., net 30, net 60, etc.",
  "warranty_period": "e.g., 1 year, 2 years, etc.",
  "items": [
    {
      "name": "item name",
      "quantity": numeric value,
      "specifications": "detailed specs"
    }
  ]
}

Only return the JSON object, no other text.`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim();
    
    // Remove markdown code blocks if present
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error('Error parsing RFP with Gemini:', error);
    
    // Provide helpful error messages
    if (error.message?.includes('API_KEY_INVALID')) {
      throw new Error('Invalid Google API key. Please check your GOOGLE_API_KEY in .env file');
    }
    if (error.status === 404) {
      throw new Error('Gemini model not available. Please verify your Google API key is valid and the Gemini API is enabled in Google Cloud Console');
    }
    
    throw new Error('Failed to parse RFP from natural language using Gemini: ' + error.message);
  }
}

// Parse vendor response email into structured proposal data using Google Gemini
export async function parseVendorResponseGemini(emailBody, rfpData) {
  const prompt = `You are an AI assistant helping to extract structured proposal data from vendor email responses.

RFP Details:
${JSON.stringify(rfpData, null, 2)}

Vendor Response Email:
"${emailBody}"

Extract and return a JSON object with the following structure:
{
  "total_price": numeric value (just the number),
  "delivery_timeline": "e.g., 30 days, 2 weeks, etc.",
  "payment_terms": "e.g., net 30, net 60, etc.",
  "warranty_period": "e.g., 1 year, 2 years, etc.",
  "items": [
    {
      "name": "item name",
      "quantity": numeric value,
      "unit_price": numeric value,
      "specifications": "any specs mentioned"
    }
  ],
  "additional_terms": "any other terms, conditions, or notes mentioned"
}

Only return the JSON object, no other text. If any field cannot be determined from the email, use null.`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim();
    
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error('Error parsing vendor response with Gemini:', error);
    throw new Error('Failed to parse vendor response using Gemini');
  }
}

// Compare proposals and generate recommendations using Google Gemini
export async function compareProposalsGemini(rfpData, proposals) {
  const prompt = `You are an AI assistant helping a procurement manager evaluate vendor proposals.

RFP Details:
${JSON.stringify(rfpData, null, 2)}

Vendor Proposals:
${JSON.stringify(proposals, null, 2)}

Please analyze these proposals and provide:
1. A score (0-10) for each proposal based on:
   - Price competitiveness
   - Delivery timeline
   - Terms compliance
   - Completeness of response

2. A summary for each proposal (2-3 sentences)

3. An overall recommendation explaining which vendor should be selected and why

Return a JSON object with this structure:
{
  "proposal_scores": [
    {
      "proposal_id": "uuid",
      "vendor_name": "name",
      "score": numeric 0-10,
      "summary": "brief summary"
    }
  ],
  "recommendation": {
    "recommended_vendor_id": "uuid",
    "recommended_vendor_name": "name",
    "reasoning": "detailed explanation of why this vendor should be selected"
  }
}

Only return the JSON object, no other text.`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim();
    
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error('Error comparing proposals with Gemini:', error);
    throw new Error('Failed to compare proposals using Gemini');
  }
}
