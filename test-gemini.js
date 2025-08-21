import { categorizeExpense } from './server/services/gemini.ts';

async function testGemini() {
  console.log('Testing Gemini AI integration...');
  
  try {
    // Test expense categorization
    const result = await categorizeExpense('Target Store Purchase', 45.67);
    console.log('✓ Categorization result:', JSON.stringify(result, null, 2));
    
    const result2 = await categorizeExpense('McDonald\'s Drive Thru', 12.50);
    console.log('✓ Second categorization:', JSON.stringify(result2, null, 2));
    
  } catch (error) {
    console.error('✗ Test failed:', error.message);
  }
}

testGemini();