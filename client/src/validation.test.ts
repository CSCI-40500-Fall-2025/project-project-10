import {
  validateName,
  validateAge,
  validateEmail,
  validatePhoneNumber,
  validatePasswordComplexity,
  validateEmployer,
  validateUsername,
  validateSignupForm,
} from './validation'

import { describe, expect, test } from 'vitest'

describe('validation functions', () => {
  test('validateName - valid name', () => {
    const res = validateName('Alice');
    expect(res.valid).toBe(true)
  })

  test('validateName - too short', () => {
    const res = validateName('A');
    expect(res.valid).toBe(false)
    expect(res.error).toMatch(/between 2 and 40/)
  })

  test('validateAge - valid and invalid', () => {
    expect(validateAge('25').valid).toBe(true)
    expect(validateAge(17).valid).toBe(false)
    expect(validateAge('not-a-number').valid).toBe(false)
  })

  test('validateEmail - common cases', () => {
    expect(validateEmail('test@example.com').valid).toBe(true)
    expect(validateEmail('bad-email').valid).toBe(false)
  })

  test('validatePhoneNumber - digits only and length', () => {
    expect(validatePhoneNumber('1234567890').valid).toBe(true)
    expect(validatePhoneNumber('123-456-7890').valid).toBe(false)
    expect(validatePhoneNumber('123456').valid).toBe(false)
  })

  test('validatePasswordComplexity - requirements', () => {
    expect(validatePasswordComplexity('Aa1!aaaa').valid).toBe(true)
    expect(validatePasswordComplexity('short1!').valid).toBe(false)
    expect(validatePasswordComplexity('NoNumber!').valid).toBe(false)
  })

  test('validateEmployer - basic checks', () => {
    expect(validateEmployer('Acme, Inc.').valid).toBe(true)
    expect(validateEmployer('').valid).toBe(false)
    expect(validateEmployer('X').valid).toBe(false)
  })

  test('validateUsername - pattern and consecutive underscores', () => {
    expect(validateUsername('user_1').valid).toBe(true)
    expect(validateUsername('1startsWithDigit').valid).toBe(false)
    expect(validateUsername('bad__name').valid).toBe(false)
  })

  test('validateSignupForm - aggregates errors', () => {
    const { valid, errors } = validateSignupForm({
      name: 'A',
      age: 16,
      employer: '',
      password: 'weak',
      email: 'not-an-email',
      phone: '123',
    })

    expect(valid).toBe(false)
    // should have errors for each provided field
    expect(Object.keys(errors).length).toBeGreaterThanOrEqual(4)
    expect(errors).toHaveProperty('name')
    expect(errors).toHaveProperty('age')
    expect(errors).toHaveProperty('employer')
    expect(errors).toHaveProperty('password')
  })
})
