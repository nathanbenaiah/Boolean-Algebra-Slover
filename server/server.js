import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import our Boolean algebra utilities
import { parseExpression } from './utils/booleanParser.js';
import { simplifyExpression } from './utils/booleanSimplifier.js';
import { generateTruthTable } from './utils/truthTableGenerator.js';
import { generateKarnaughMap } from './utils/karnaughMapGenerator.js';
import { generateLogicCircuit } from './utils/circuitGenerator.js';
import { solveSAT } from './utils/satSolver.js';
import { convertSopPos } from './utils/sopPosConverter.js';
import { advancedMinimization } from './utils/advancedMinimizer.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security and performance middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Main Boolean algebra processing endpoint
app.post('/api/process-expression', async (req, res) => {
  try {
    const { expression, options = {} } = req.body;
    
    if (!expression || typeof expression !== 'string') {
      return res.status(400).json({
        error: 'Invalid expression provided',
        message: 'Expression must be a non-empty string'
      });
    }

    // Parse and validate expression
    const parsed = await parseExpression(expression);
    
    // Process expression with all available tools
    const results = {
      original: expression,
      parsed,
      simplified: await simplifyExpression(parsed, options),
      truthTable: await generateTruthTable(parsed),
      karnaughMap: await generateKarnaughMap(parsed),
      logicCircuit: await generateLogicCircuit(parsed),
      advancedMinimization: await advancedMinimization(parsed),
      sopPosConversion: await convertSopPos(parsed),
      metadata: {
        variableCount: parsed.variables?.length || 0,
        complexity: calculateComplexity(parsed),
        processingTime: Date.now()
      }
    };

    res.json(results);
  } catch (error) {
    console.error('Expression processing error:', error);
    res.status(500).json({
      error: 'Failed to process expression',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Simplification endpoint
app.post('/api/simplify', async (req, res) => {
  try {
    const { expression, method = 'auto' } = req.body;
    
    const parsed = await parseExpression(expression);
    const simplified = await simplifyExpression(parsed, { method });
    
    res.json({
      original: expression,
      simplified: simplified.simplifiedExpression || simplified.expression,
      steps: simplified.steps || [],
      rules: simplified.rulesApplied || [],
      method: simplified.method || 'auto',
      metadata: simplified.metadata || {}
    });
  } catch (error) {
    res.status(500).json({
      error: 'Simplification failed',
      message: error.message
    });
  }
});

// Truth table generation endpoint
app.post('/api/truth-table', async (req, res) => {
  try {
    const { expression } = req.body;
    
    const parsed = await parseExpression(expression);
    const truthTable = await generateTruthTable(parsed);
    
    res.json({
      expression,
      variables: parsed.variables || [],
      table: truthTable.rows || [],
      minterms: truthTable.minterms || [],
      maxterms: truthTable.maxterms || [],
      analysis: truthTable.analysis || {}
    });
  } catch (error) {
    res.status(500).json({
      error: 'Truth table generation failed',
      message: error.message
    });
  }
});

// Karnaugh Map generation endpoint
app.post('/api/karnaugh-map', async (req, res) => {
  try {
    const { expression } = req.body;
    
    const parsed = await parseExpression(expression);
    const kMap = await generateKarnaughMap(parsed);
    
    res.json({
      expression,
      karnaughMap: kMap,
      simplifiedSOP: kMap.simplifiedSOP || '',
      simplifiedPOS: kMap.simplifiedPOS || '',
      essentialPrimeImplicants: kMap.groups?.filter(g => g.isEssential) || []
    });
  } catch (error) {
    res.status(500).json({
      error: 'Karnaugh map generation failed',
      message: error.message
    });
  }
});

// Logic circuit generation endpoint
app.post('/api/logic-circuit', async (req, res) => {
  try {
    const { expression } = req.body;
    
    const parsed = await parseExpression(expression);
    const circuit = await generateLogicCircuit(parsed);
    
    res.json({
      expression,
      circuit: {
        gates: circuit.gates,
        connections: circuit.connections,
        optimization: circuit.optimization,
        bounds: circuit.bounds
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Logic circuit generation failed',
      message: error.message
    });
  }
});

// SAT Solver endpoint
app.post('/api/sat-solve', async (req, res) => {
  try {
    const { expression, constraints = [] } = req.body;
    
    const parsed = await parseExpression(expression);
    const satResult = await solveSAT(parsed, constraints);
    
    res.json({
      expression,
      satisfiable: satResult.satisfiable,
      solution: satResult.solution,
      allSolutions: satResult.allSolutions,
      constraints
    });
  } catch (error) {
    res.status(500).json({
      error: 'SAT solving failed',
      message: error.message
    });
  }
});

// SOP/POS conversion endpoint
app.post('/api/convert', async (req, res) => {
  try {
    const { expression, targetForm } = req.body; // 'sop' or 'pos'
    
    const parsed = await parseExpression(expression);
    const converted = await convertSopPos(parsed, targetForm);
    
    res.json({
      original: expression,
      converted: converted.expression,
      form: converted.form,
      steps: converted.steps
    });
  } catch (error) {
    res.status(500).json({
      error: 'Conversion failed',
      message: error.message
    });
  }
});

// Advanced minimization endpoint with multiple algorithms
app.post('/api/minimize-advanced', async (req, res) => {
  try {
    const { expression, algorithms = ['quine-mccluskey', 'petrick', 'espresso'] } = req.body;
    
    const parsed = await parseExpression(expression);
    const results = await advancedMinimization(parsed, algorithms);
    
    res.json({
      original: expression,
      results: results.map(result => ({
        algorithm: result.algorithm,
        minimized: result.expression,
        gateCount: result.metadata?.gateCount || 0,
        depth: result.metadata?.depth || 0,
        performance: result.metadata?.performance || 0,
        reductionPercentage: result.metadata?.reductionPercentage || 0
      })),
      recommended: results[0] || null // Best result
    });
  } catch (error) {
    res.status(500).json({
      error: 'Advanced minimization failed',
      message: error.message
    });
  }
});

// Batch processing endpoint
app.post('/api/batch-process', async (req, res) => {
  try {
    const { expressions, operations = ['simplify', 'truthTable'] } = req.body;
    
    if (!Array.isArray(expressions) || expressions.length === 0) {
      return res.status(400).json({
        error: 'Invalid expressions array provided'
      });
    }

    const results = await Promise.all(
      expressions.map(async (expr, index) => {
        try {
          const parsed = await parseExpression(expr);
          const result = { expression: expr, index };

          if (operations.includes('simplify')) {
            result.simplified = await simplifyExpression(parsed);
          }
          if (operations.includes('truthTable')) {
            result.truthTable = await generateTruthTable(parsed);
          }
          if (operations.includes('karnaughMap')) {
            result.karnaughMap = await generateKarnaughMap(parsed);
          }

          return result;
        } catch (error) {
          return {
            expression: expr,
            index,
            error: error.message
          };
        }
      })
    );

    res.json({ results });
  } catch (error) {
    res.status(500).json({
      error: 'Batch processing failed',
      message: error.message
    });
  }
});

// Utility function to calculate expression complexity
function calculateComplexity(parsed) {
  const variableCount = parsed.variables?.length || 0;
  const operatorCount = parsed.operatorCount || 0;
  const depth = parsed.depth || 0;

  if (variableCount <= 2 && operatorCount <= 3) return 'Basic';
  if (variableCount <= 4 && operatorCount <= 8) return 'Intermediate';
  return 'Advanced';
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Boolean Algebra Solver Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🛡️  Security: Helmet, CORS, Rate Limiting enabled`);
  console.log(`📈 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app; 