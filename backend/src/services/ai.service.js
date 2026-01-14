import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
