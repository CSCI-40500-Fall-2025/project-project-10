export const validateName = (name: string): { valid: boolean; error?: string } => {
    // Check length
    if (name.length < 2 || name.length > 40) {
      return { valid: false, error: 'Name must be between 2 and 40 characters' }
    }
  
    // Can only have these
    const namePattern = /^[a-zA-Z][a-zA-Z'-]{1,39}$/
    
    if (!namePattern.test(name)) {
      return { 
        valid: false, 
        error: 'Name must start with a letter and contain only letters, hyphens, or apostrophes' 
      }
    }
  
    // Invalud cases
    if (name.includes("'") && /'.*'/.test(name)) {
      return { valid: false, error: 'Quoted strings are not allowed in names' }
    }
    if (name.includes('--')) {
      return { valid: false, error: 'Consecutive hyphens are not allowed' }
    }
  
    return { valid: true }
  }
  
  export const validateAge = (age: string | number): { valid: boolean; error?: string } => {
    const ageNum = typeof age === 'string' ? parseInt(age, 10) : age
  
    if (isNaN(ageNum)) {
      return { valid: false, error: 'Age must be a valid number' }
    }
  
    const MIN_AGE = 18
    const MAX_AGE = 120
  
    if (ageNum < MIN_AGE) {
      return { valid: false, error: `You must be at least ${MIN_AGE} years old` }
    }
  
    if (ageNum > MAX_AGE) {
      return { valid: false, error: `Please enter a realistic age (max ${MAX_AGE})` }
    }
  
    return { valid: true }
  }
  
  export const validateEmail = (email: string): { valid: boolean; error?: string } => {
    if (!email || email.length === 0) {
      return { valid: false, error: 'Email is required' }
    }
  
    // Email pattern
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    
    if (!emailPattern.test(email)) {
      return { valid: false, error: 'Please enter a valid email address' }
    }
  
    if (email.length > 254) {
      return { valid: false, error: 'Email address is too long' }
    }
  
    return { valid: true }
  }
  
  export const validatePhoneNumber = (phone: string): { valid: boolean; error?: string } => {
    if (!phone || phone.length === 0) {
      return { valid: false, error: 'Phone number is required' }
    }
  
    // Check if only digits 
    if (!/^\d+$/.test(phone)) {
      return { valid: false, error: 'Phone number must contain only digits (no spaces, dashes, or parentheses)' }
    }

    if (phone.length !== 10) {
      return { valid: false, error: 'Phone number must be exactly 10 digits' }
    }
  
    return { valid: true }
  }
  
  // Minimum 8 characters, at least one uppercase letter, at least one lowercase letter, at least one digit, at least one special character
  export const validatePasswordComplexity = (password: string): { valid: boolean; error?: string } => {
    if (!password || password.length === 0) {
      return { valid: false, error: 'Password is required' }
    }
  
    // Length check
    if (password.length < 8) {
      return { valid: false, error: 'Password must be at least 8 characters long' }
    }
    if (password.length > 128) {
      return { valid: false, error: 'Password is too long (max 128 characters)' }
    }
  
    // Secuirty measures for password
    if (!/[A-Z]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one uppercase letter' }
    }

    if (!/[a-z]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one lowercase letter' }
    }
  
    if (!/\d/.test(password)) {
      return { valid: false, error: 'Password must contain at least one digit' }
    }
  
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one special character' }
    }
  
    return { valid: true }
  }
  

  export const validateEmployer = (employer: string): { valid: boolean; error?: string } => {
    if (!employer || employer.length === 0) {
      return { valid: false, error: 'Employer is required' }
    }
  
    if (employer.length < 2 || employer.length > 100) {
      return { valid: false, error: 'Employer name must be between 2 and 100 characters' }
    }
  
    const employerPattern = /^[a-zA-Z0-9\s\-&.,()]+$/
    
    if (!employerPattern.test(employer)) {
      return { 
        valid: false, 
        error: 'Employer name contains invalid characters' 
      }
    }
  
    return { valid: true }
  }
  
  export const validateUsername = (username: string): { valid: boolean; error?: string } => {
    if (!username || username.length === 0) {
      return { valid: false, error: 'Username is required' }
    }
  
    if (username.length < 3 || username.length > 20) {
      return { valid: false, error: 'Username must be between 3 and 20 characters' }
    }
  
    // Start with letter, contain only letters, numbers, underscores
    const usernamePattern = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/
    
    if (!usernamePattern.test(username)) {
      return { 
        valid: false, 
        error: 'Username must start with a letter and contain only letters, numbers, and underscores' 
      }
    }
  
    if (username.includes('__')) {
      return { valid: false, error: 'Username cannot contain consecutive underscores' }
    }
  
    return { valid: true }
  }
  
  export const validateSignupForm = (form: {
    name: string
    age?: string | number
    employer: string
    password: string
    email?: string
    phone?: string
  }): { valid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {}
  
    const nameValidation = validateName(form.name)
    if (!nameValidation.valid) {
      errors.name = nameValidation.error!
    }
  
    if (form.age) {
      const ageValidation = validateAge(form.age)
      if (!ageValidation.valid) {
        errors.age = ageValidation.error!
      }
    }
  
    const employerValidation = validateEmployer(form.employer)
    if (!employerValidation.valid) {
      errors.employer = employerValidation.error!
    }
  
    const passwordValidation = validatePasswordComplexity(form.password)
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.error!
    }
  
    if (form.email) {
      const emailValidation = validateEmail(form.email)
      if (!emailValidation.valid) {
        errors.email = emailValidation.error!
      }
    }
  
    if (form.phone) {
      const phoneValidation = validatePhoneNumber(form.phone)
      if (!phoneValidation.valid) {
        errors.phone = phoneValidation.error!
      }
    }
  
    return {
      valid: Object.keys(errors).length === 0,
      errors
    }
  }
