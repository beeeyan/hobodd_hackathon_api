// 現在日時を文字列で返す
export const getCurrentTimestamp = () => new Date().toISOString();

// 現在日付をyyyy-mm-ddで返す
export const getFormattedDate = (): string => {
  const date = new Date();
  // 日本時間に変換
  const jstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000)); // UTC+9時間
  return jstDate.toISOString().split('T')[0];
};
