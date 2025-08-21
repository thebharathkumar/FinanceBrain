import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ExpenseCategorizationResult {
  category: string;
  subcategory?: string;
  confidence: number;
  reasoning: string;
}

export interface ReceiptAnalysisResult {
  merchant: string;
  amount: number;
  date: string;
  items: Array<{
    name: string;
    price: number;
    quantity?: number;
  }>;
  category: string;
  subcategory?: string;
  confidence: number;
}

export interface SpendingInsight {
  type: 'spending_alert' | 'savings_opportunity' | 'investment_advice';
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  metadata?: any;
}

export async function categorizeExpense(
  description: string,
  merchant?: string,
  amount?: number
): Promise<ExpenseCategorizationResult> {
  try {
    const prompt = `Analyze this transaction and categorize it appropriately. 
    Description: ${description}
    ${merchant ? `Merchant: ${merchant}` : ''}
    ${amount ? `Amount: $${amount}` : ''}
    
    Categorize this transaction into one of these main categories:
    - Food & Dining
    - Transportation
    - Shopping
    - Bills & Utilities
    - Entertainment
    - Healthcare
    - Travel
    - Education
    - Income
    - Other
    
    Provide a subcategory if applicable, confidence score (0-1), and reasoning.
    Respond with JSON in this format: 
    {
      "category": "string",
      "subcategory": "string (optional)",
      "confidence": number,
      "reasoning": "string"
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a financial categorization expert. Analyze transactions and provide accurate categorization with confidence scores."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      category: result.category || 'Other',
      subcategory: result.subcategory,
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      reasoning: result.reasoning || 'Auto-categorized by AI'
    };
  } catch (error) {
    console.error('Failed to categorize expense:', error);
    return {
      category: 'Other',
      confidence: 0,
      reasoning: 'Failed to categorize automatically'
    };
  }
}

export async function analyzeReceipt(base64Image: string): Promise<ReceiptAnalysisResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this receipt image and extract the following information:
              - Merchant name
              - Total amount
              - Date of purchase
              - Individual items with prices and quantities
              - Appropriate expense category
              
              Respond with JSON in this format:
              {
                "merchant": "string",
                "amount": number,
                "date": "YYYY-MM-DD",
                "items": [{"name": "string", "price": number, "quantity": number}],
                "category": "string",
                "subcategory": "string (optional)",
                "confidence": number
              }`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      merchant: result.merchant || 'Unknown Merchant',
      amount: result.amount || 0,
      date: result.date || new Date().toISOString().split('T')[0],
      items: result.items || [],
      category: result.category || 'Other',
      subcategory: result.subcategory,
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5))
    };
  } catch (error) {
    console.error('Failed to analyze receipt:', error);
    throw new Error('Failed to analyze receipt: ' + (error as Error).message);
  }
}

export async function generateSpendingInsights(
  transactions: any[],
  budgets: any[],
  userProfile: any
): Promise<SpendingInsight[]> {
  try {
    const prompt = `Analyze this user's financial data and provide actionable insights:
    
    Recent Transactions: ${JSON.stringify(transactions.slice(0, 50))}
    Budgets: ${JSON.stringify(budgets)}
    User Profile: ${JSON.stringify(userProfile)}
    
    Generate 2-3 personalized financial insights focusing on:
    - Spending pattern alerts
    - Savings opportunities
    - Budget recommendations
    
    Respond with JSON array in this format:
    [
      {
        "type": "spending_alert|savings_opportunity|investment_advice",
        "title": "string",
        "content": "string",
        "priority": "low|medium|high",
        "metadata": {}
      }
    ]`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a personal finance advisor. Provide actionable, personalized financial insights based on user data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"insights": []}');
    
    return result.insights || result || [];
  } catch (error) {
    console.error('Failed to generate insights:', error);
    return [];
  }
}
