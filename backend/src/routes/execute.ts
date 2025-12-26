import { Router, Response } from 'express';
import axios from 'axios';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Language ID to Piston language mapping
const languageMap: { [key: number]: string } = {
  71: 'python',
  63: 'javascript',
  62: 'java',
  54: 'cpp',
  50: 'c'
};

// Execute code securely
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { source_code, language_id, stdin } = req.body;

    if (!source_code || !language_id) {
      res.status(400).json({ error: 'source_code and language_id are required' });
      return;
    }

    // Map language ID to Piston language name
    const language = languageMap[language_id] || 'python';

    // Use Piston API for code execution
    const pistonUrl = process.env.CODE_EXECUTION_API_URL || 'https://emkc.org/api/v2/piston/execute';
    
    const response = await axios.post(pistonUrl, {
      language,
      version: '*',
      files: [{
        content: source_code
      }],
      stdin: stdin || ''
    });

    const result = response.data;

    res.json({
      output: result.run?.output || '',
      status: result.run?.code === 0 ? 'success' : 'error',
      time: result.run?.time?.toString() || '0',
      memory: result.run?.memory?.toString() || '0',
      stderr: result.run?.stderr || null,
      compile_output: result.compile?.output || null
    });
  } catch (error: any) {
    console.error('Code execution error:', error);
    res.status(500).json({ 
      error: 'Execution failed',
      message: error.message 
    });
  }
});

export default router;
