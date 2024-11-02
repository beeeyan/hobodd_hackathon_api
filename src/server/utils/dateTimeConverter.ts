// 現在日時を文字列で返す
export const getCurrentTimestamp = () => new Date().toISOString();

// 現在日付をyyyy-mm-ddで返す
export const getFormattedDate = (): string => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};