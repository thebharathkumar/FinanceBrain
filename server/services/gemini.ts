import * as fs from "fs";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ExpenseCategory {
  category: string;
  subcategory: string | null;
  confidence: number;
  isIncome: boolean;
}

export interface ReceiptData {
  merchant: string;
  amount: number;
  date: string;
  category: string;
  description: string;
  items?: Array<{
    name: string;
    price: number;
    quantity?: number;
  }>;
}

export interface SpendingInsight {
  type: 'warning' | 'tip' | 'trend';
  title: string;
  description: string;
  category?: string;
  amount?: number;
  priority: 'high' | 'medium' | 'low';
}

export async function categorizeExpense(description: string, amount: number): Promise<ExpenseCategory> {
  try {
    const prompt = `Analyze this transaction and categorize it:
Description: "${description}"
Amount: $${amount}

Categorize this expense and determine if it's income or an expense. 
Respond with JSON in this exact format:
{
  "category": "category_name",
  "subcategory": "subcategory_name_or_null",
  "confidence": 0.95,
  "isIncome": false
}

Use these main categories: Food & Dining, Shopping, Transportation, Bills & Utilities, Entertainment, Health & Fitness, Travel, Education, Business, Income, Other

For subcategories, be specific but concise (e.g., "Groceries", "Gas", "Salary", "Freelance", etc.)`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            category: { type: "string" },
            subcategory: { type: "string" },
            confidence: { type: "number" },
            isIncome: { type: "boolean" },
          },
          required: ["category", "confidence", "isIncome"],
        },
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      const data: ExpenseCategory = JSON.parse(rawJson);
      return {
        category: data.category,
        subcategory: data.subcategory || null,
        confidence: Math.max(0, Math.min(1, data.confidence)),
        isIncome: data.isIncome,
      };
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Failed to categorize expense:", error);
    return {
      category: "Other",
      subcategory: null,
      confidence: 0.1,
      isIncome: amount > 0,
    };
  }
}

export async function analyzeReceipt(imagePath: string): Promise<ReceiptData> {
  try {
    const imageBytes = fs.readFileSync(imagePath);

    const contents = [
      {
        inlineData: {
          data: imageBytes.toString("base64"),
          mimeType: "image/jpeg",
        },
      },
      `Analyze this receipt image and extract the transaction information.
      
      Respond with JSON in this exact format:
      {
        "merchant": "Store/Restaurant Name",
        "amount": 29.99,
        "date": "2024-01-15",
        "category": "Food & Dining",
        "description": "Brief description of purchase",
        "items": [
          {
            "name": "Item name",
            "price": 12.99,
            "quantity": 1
          }
        ]
      }
      
      Extract all visible items with their prices. Use YYYY-MM-DD format for dates.
      Categories should match: Food & Dining, Shopping, Transportation, Bills & Utilities, Entertainment, Health & Fitness, Travel, Education, Business, Other`,
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            merchant: { type: "string" },
            amount: { type: "number" },
            date: { type: "string" },
            category: { type: "string" },
            description: { type: "string" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  price: { type: "number" },
                  quantity: { type: "number" },
                },
                required: ["name", "price"],
              },
            },
          },
          required: ["merchant", "amount", "date", "category", "description"],
        },
      },
    });

    const rawJson = response.text;
    if (rawJson) {
      const data: ReceiptData = JSON.parse(rawJson);
      return data;
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Failed to analyze receipt:", error);
    throw new Error(`Failed to analyze receipt: ${error}`);
  }
}

export async function generateSpendingInsights(
  transactions: Array<{ amount: string; category: string; date: Date; description: string }>,
  budgets: Array<{ category: string; amount: string }>,
): Promise<SpendingInsight[]> {
  try {
    const prompt = `Analyze this financial data and provide 3-5 actionable spending insights:

TRANSACTIONS (Last 30 days):
${transactions.map(t => `- ${t.description}: $${t.amount} (${t.category}) on ${t.date.toISOString().split('T')[0]}`).join('\n')}

BUDGETS:
${budgets.map(b => `- ${b.category}: $${b.amount}/month`).join('\n')}

Provide insights about spending patterns, budget adherence, potential savings, and financial recommendations.

Respond with JSON array in this exact format:
[
  {
    "type": "warning",
    "title": "Budget Alert",
    "description": "You've exceeded your dining budget by $150 this month",
    "category": "Food & Dining",
    "amount": 150,
    "priority": "high"
  },
  {
    "type": "tip",
    "title": "Savings Opportunity",
    "description": "Consider switching to a meal planning app to reduce dining costs",
    "priority": "medium"
  }
]

Types: "warning" (budget alerts, overspending), "tip" (savings advice, recommendations), "trend" (spending patterns)
Priorities: "high" (urgent action needed), "medium" (should consider), "low" (nice to know)`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["warning", "tip", "trend"] },
              title: { type: "string" },
              description: { type: "string" },
              category: { type: "string" },
              amount: { type: "number" },
              priority: { type: "string", enum: ["high", "medium", "low"] },
            },
            required: ["type", "title", "description", "priority"],
          },
        },
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      const insights: SpendingInsight[] = JSON.parse(rawJson);
      return insights.slice(0, 5); // Limit to 5 insights
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Failed to generate spending insights:", error);
    return [];
  }
}