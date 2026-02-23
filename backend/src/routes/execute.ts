import axios from 'axios';
import { Response, Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Judge0 CE public instance (FREE, no API key needed!)
const JUDGE0_CE_URL = 'https://ce.judge0.com/submissions?base64_encoded=false&wait=true';

// Language ID mapping for Judge0
const languageMap: { [key: number]: number } = {
  71: 71,  // Python 3.8.1
  63: 63,  // JavaScript (Node.js 12.14.0)
  62: 62,  // Java (OpenJDK 13.0.1)
  54: 54,  // C++ (GCC 9.2.0)
  50: 50   // C (GCC 9.2.0)
};

// Execute code using Judge0 CE (free, no API key)
async function executeWithJudge0CE(source_code: string, language_id: number, stdin: string) {
  const response = await axios.post(JUDGE0_CE_URL, {
    source_code,
    language_id,
    stdin
  }, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000
  });

  return response.data;
}

// Execute code securely
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { source_code, language_id, stdin } = req.body;

    if (!source_code || !language_id) {
      res.status(400).json({ error: 'source_code and language_id are required' });
      return;
    }

    // Execute with Judge0 CE
    const j0Result = await executeWithJudge0CE(source_code, languageMap[language_id] || 71, stdin || '');

    const result = {
      output: j0Result.stdout || '',
      status: j0Result.status?.id === 3 ? 'success' : 'error',
      time: j0Result.time || '0',
      memory: j0Result.memory?.toString() || '0',
      stderr: j0Result.stderr || j0Result.compile_output || null,
      compile_output: j0Result.compile_output || null,
      status_description: j0Result.status?.description || 'Unknown'
    };

    res.json(result);
  } catch (error: any) {
    console.error('Code execution error:', error);
    res.status(500).json({
      error: 'Execution failed',
      message: error.message
    });
  }
});

export default router;
