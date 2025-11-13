// Password strength validation utility

export interface PasswordStrength {
  score: number // 0-4
  feedback: string[]
  isValid: boolean
  requirements: {
    minLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumber: boolean
    hasSpecialChar: boolean
  }
}

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = []
  let score = 0
  
  const requirements = {
    minLength: password.length >= PASSWORD_REQUIREMENTS.minLength,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  }
  
  // Check minimum length
  if (!requirements.minLength) {
    feedback.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`)
  } else {
    score++
  }
  
  // Check uppercase
  if (PASSWORD_REQUIREMENTS.requireUppercase && !requirements.hasUppercase) {
    feedback.push('Include at least one uppercase letter')
  } else if (requirements.hasUppercase) {
    score++
  }
  
  // Check lowercase
  if (PASSWORD_REQUIREMENTS.requireLowercase && !requirements.hasLowercase) {
    feedback.push('Include at least one lowercase letter')
  } else if (requirements.hasLowercase) {
    score++
  }
  
  // Check number
  if (PASSWORD_REQUIREMENTS.requireNumber && !requirements.hasNumber) {
    feedback.push('Include at least one number')
  } else if (requirements.hasNumber) {
    score++
  }
  
  // Check special character
  if (PASSWORD_REQUIREMENTS.requireSpecialChar && !requirements.hasSpecialChar) {
    feedback.push('Include at least one special character (!@#$%^&*)')
  } else if (requirements.hasSpecialChar) {
    score++
  }
  
  // Additional strength checks
  if (password.length >= 12) {
    score = Math.min(score + 0.5, 4)
  }
  
  // Common password check (basic)
  const commonPasswords = ['password', '12345678', 'qwerty', 'abc123', 'password123']
  if (commonPasswords.includes(password.toLowerCase())) {
    feedback.push('This password is too common. Choose a unique password.')
    score = 0
  }
  
  const isValid = feedback.length === 0
  
  return {
    score: Math.floor(score),
    feedback,
    isValid,
    requirements,
  }
}

export function getPasswordStrengthLabel(score: number): {
  label: string
  color: string
} {
  switch (score) {
    case 0:
    case 1:
      return { label: 'Weak', color: 'red' }
    case 2:
      return { label: 'Fair', color: 'orange' }
    case 3:
      return { label: 'Good', color: 'yellow' }
    case 4:
      return { label: 'Strong', color: 'green' }
    default:
      return { label: 'Weak', color: 'red' }
  }
}
