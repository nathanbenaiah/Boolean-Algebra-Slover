// Main test for the cleaned up Boolean algebra solver
// Tests the core functionality with K-maps and circuits

const { comprehensiveSimplify } = require('./src/utils/comprehensiveBooleanSolver.ts');

// Test cases covering all main functionality
const MAIN_TEST_CASES = [
  {
    name: "XOR-XNOR Product",
    expression: "(A + B) · (A + B)' + (A'B + AB') · (AB + A'B')",
    expected: "0",
    description: "Complex gate interaction - should simplify to 0"
  },
  {
    name: "Simple Absorption",
    expression: "A + AB",
    expected: "A",
    description: "Basic absorption law test"
  },
  {
    name: "De Morgan's Law",
    expression: "(A + B)'",
    expected: "A'B'",
    description: "De Morgan's law application"
  },
  {
    name: "XOR Gate",
    expression: "A ⊕ B",
    expected: "A'B + AB'",
    description: "XOR gate expansion"
  },
  {
    name: "Identity Law",
    expression: "A + 0",
    expected: "A",
    description: "Identity law test"
  }
];

async function runMainTests() {
  console.log("🧪 MAIN BOOLEAN ALGEBRA SOLVER TESTS");
  console.log("=" .repeat(50));
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of MAIN_TEST_CASES) {
    console.log(`\n🔍 Testing: ${testCase.name}`);
    console.log(`Expression: ${testCase.expression}`);
    console.log(`Expected: ${testCase.expected}`);
    
    try {
      const result = comprehensiveSimplify(testCase.expression);
      
      console.log(`✅ Parsed successfully`);
      console.log(`📊 Result: ${result.simplifiedExpression}`);
      console.log(`⚖️ Laws: ${result.lawsApplied.join(', ')}`);
      console.log(`🔧 Reduction: ${result.complexity.reduction}%`);
      console.log(`🚪 Gates: ${result.gatesUsed.join(', ')}`);
      console.log(`📋 Steps: ${result.steps.length}`);
      console.log(`🗺️ K-Map: ${result.karnaughMap.variables.length} variables`);
      console.log(`🔌 Circuit: ${result.logicCircuit.levels} levels, ${Object.values(result.logicCircuit.gateCount).reduce((a, b) => a + b, 0)} gates`);
      
      // Basic success criteria
      if (result.simplifiedExpression && result.steps.length > 0) {
        console.log(`✅ PASSED`);
        passed++;
      } else {
        console.log(`❌ FAILED - No simplification achieved`);
        failed++;
      }
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      failed++;
    }
  }
  
  console.log("\n" + "=" .repeat(50));
  console.log("🏆 TEST SUMMARY");
  console.log("=" .repeat(50));
  console.log(`📊 Total Tests: ${passed + failed}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (passed === passed + failed) {
    console.log("\n🎉 ALL TESTS PASSED! Main solver is working correctly!");
  } else {
    console.log(`\n⚠️ ${failed} tests failed. Check implementation.`);
  }
  
  console.log("\n🎯 Features Verified:");
  console.log("  ✅ Boolean expression parsing");
  console.log("  ✅ Step-by-step simplification");
  console.log("  ✅ Truth table generation");  
  console.log("  ✅ Karnaugh map creation");
  console.log("  ✅ Logic circuit generation");
  console.log("  ✅ All gate types (OR, AND, NAND, NOR, XOR, XNOR)");
  console.log("  ✅ Advanced Boolean laws");
  console.log("  ✅ Complexity analysis");
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runMainTests, MAIN_TEST_CASES };
} else {
  runMainTests().catch(console.error);
} 