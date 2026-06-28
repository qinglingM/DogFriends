const COMMON_PASSWORDS = new Set([
  'password1',
  'password123',
  '12345678',
  '123456789',
  'qwerty123',
  'abc12345',
]);

export function validatePassword(password, phone = '') {
  if (password.length < 8 || password.length > 20) {
    return '密码需为 8–20 位';
  }
  if (/[\u3400-\u9fff]/.test(password)) {
    return '密码不能包含中文';
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return '密码需同时包含字母和数字';
  }
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return '密码过于简单，请更换';
  }

  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length >= 6 && password.endsWith(phoneDigits.slice(-6))) {
    return '密码不能以手机号后 6 位结尾';
  }

  return null;
}
