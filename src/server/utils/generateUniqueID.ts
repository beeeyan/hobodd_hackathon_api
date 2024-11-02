// cloudflare workers では、ULIDライブラリが使えなかったので独自に実装

// カスタムID生成関数
function generateId(length = 21): string {
  const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);

  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length];
  }
  return result;
}

// ULIDライクな形式を生成する関数
export function generateULIDLike(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = generateId(12);
  return `${timestamp}${randomPart}`;
}