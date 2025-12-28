// Input validation and sanitization middleware

export interface CodeSubmission {
  code: string;
  language: string;
  challengeId?: string;
  battleId?: string;
}

export interface BattleRequest {
  difficulty: 'easy' | 'medium' | 'hard';
  entryFee: number;
}

// Code validation rules
const CODE_VALIDATION_RULES = {
  MAX_CODE_LENGTH: 50000, // 50KB max
  MIN_CODE_LENGTH: 10,
  ALLOWED_LANGUAGES: ['python', 'javascript', 'cpp', 'java', 'c', 'go', 'rust'],
  BLOCKED_PATTERNS: [
    /import\s+os/gi,
    /import\s+subprocess/gi,
    /import\s+sys/gi,
    /exec\s*\(/gi,
    /eval\s*\(/gi,
    /system\s*\(/gi,
    /__import__/gi,
    /open\s*\(/gi,
    /file\s*\(/gi,
    /socket/gi,
    /urllib/gi,
    /requests/gi,
    /http/gi,
    /net/gi,
    /process/gi,
    /runtime/gi,
  ],
  SUSPICIOUS_KEYWORDS: [
    'rm -rf', 'del /s', 'format c:', 'sudo', 'chmod 777',
    'while(true)', 'for(;;)', 'while True:', 'infinite',
    'fork()', 'thread', 'async', 'await'
  ]
};

export class SecurityError extends Error {
  public code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.name = 'SecurityError';
    this.code = code;
  }
}

export class ValidationError extends Error {
  public field: string;
  
  constructor(message: string, field: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

// Simple sanitization function
const sanitizeCode = (code: string): string => {
  // Remove HTML tags and potentially dangerous characters
  return code
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[^;]+;/g, '') // Remove HTML entities
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .trim();
};

// Sanitize and validate code submission
export const validateCodeSubmission = (submission: CodeSubmission): CodeSubmission => {
  const { code, language, challengeId, battleId } = submission;

  // Validate language
  if (!CODE_VALIDATION_RULES.ALLOWED_LANGUAGES.includes(language)) {
    throw new ValidationError(`Unsupported programming language: ${language}`, 'language');
  }

  // Validate code length
  if (!code || code.length < CODE_VALIDATION_RULES.MIN_CODE_LENGTH) {
    throw new ValidationError('Code is too short', 'code');
  }

  if (code.length > CODE_VALIDATION_RULES.MAX_CODE_LENGTH) {
    throw new ValidationError('Code exceeds maximum length (50KB)', 'code');
  }

  // Check for blocked patterns
  for (const pattern of CODE_VALIDATION_RULES.BLOCKED_PATTERNS) {
    if (pattern.test(code)) {
      throw new SecurityError('Code contains prohibited functions or imports', 'BLOCKED_CODE');
    }
  }

  // Check for suspicious keywords
  const lowerCode = code.toLowerCase();
  for (const keyword of CODE_VALIDATION_RULES.SUSPICIOUS_KEYWORDS) {
    if (lowerCode.includes(keyword.toLowerCase())) {
      throw new SecurityError(`Code contains suspicious keyword: ${keyword}`, 'SUSPICIOUS_CODE');
    }
  }

  // Sanitize code
  const sanitizedCode = sanitizeCode(code);

  // Validate IDs if provided
  if (challengeId && !/^[a-zA-Z0-9_-]+$/.test(challengeId)) {
    throw new ValidationError('Invalid challenge ID format', 'challengeId');
  }

  if (battleId && !/^[a-zA-Z0-9_-]+$/.test(battleId)) {
    throw new ValidationError('Invalid battle ID format', 'battleId');
  }

  return {
    code: sanitizedCode,
    language,
    challengeId,
    battleId
  };
};

// Validate battle request
export const validateBattleRequest = (request: BattleRequest): BattleRequest => {
  const { difficulty, entryFee } = request;

  // Validate difficulty
  if (!['easy', 'medium', 'hard'].includes(difficulty)) {
    throw new ValidationError('Invalid difficulty level', 'difficulty');
  }

  // Validate entry fee
  const allowedFees = [5, 10, 20, 50];
  if (!allowedFees.includes(entryFee)) {
    throw new ValidationError('Invalid entry fee amount', 'entryFee');
  }

  return { difficulty, entryFee };
};

// Rate limiting utility
export class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier);

    if (!userRequests || now > userRequests.resetTime) {
      this.requests.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (userRequests.count >= this.maxRequests) {
      return false;
    }

    userRequests.count++;
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const userRequests = this.requests.get(identifier);
    if (!userRequests || Date.now() > userRequests.resetTime) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - userRequests.count);
  }
}

// Create rate limiters for different operations
export const codeSubmissionLimiter = new RateLimiter(5, 60000); // 5 submissions per minute
export const battleJoinLimiter = new RateLimiter(10, 60000); // 10 battle joins per minute
export const challengeAttemptLimiter = new RateLimiter(20, 60000); // 20 challenge attempts per minute