WITH RECURSIVE dates(date) AS (
  SELECT '2024-01-01'
  UNION ALL
  SELECT date(date, '+1 day')
  FROM dates
  WHERE date < '2024-12-31'
),
proverbs(id, proverb_title, proverb_description) AS (
  VALUES
    (1, '石の上にも三年', '辛抱強く続ければ成果が出ること'),
    (2, '明日は明日の風が吹く', 'くよくよせずに明日を待つこと'),
    (3, '猿も木から落ちる', '誰でも失敗することがある'),
    (4, '二兎を追う者は一兎をも得ず', '欲張るとどちらも失うことになる'),
    (5, '急がば回れ', '急ぐときほど安全な方法を取るべきである'),
    (6, '笑う門には福来る', '笑顔でいると幸運が訪れる'),
    (7, '思い立ったが吉日', '思い立ったらすぐに行動すべきである'),
    (8, '百聞は一見に如かず', '何度も聞くより一度見た方が理解しやすい'),
    (9, '時は金なり', '時間は貴重であることを忘れずに過ごす'),
    (10, '塵も積もれば山となる', '小さな努力でも続ければ大きな成果につながる'),
    (11, '後悔先に立たず', '後から悔やんでも取り返しがつかないこと'),
    (12, '風が吹けば桶屋が儲かる', '一つの出来事が思わぬところに影響を及ぼすこと')
)
INSERT INTO proverb (id, proverb_title, proverb_description, date)
SELECT
  ROW_NUMBER() OVER (ORDER BY dates.date) as id,
  proverb_title,
  proverb_description,
  dates.date
FROM dates
JOIN proverbs ON ((julianday(dates.date) - julianday('2024-01-01')) % 12) + 1 = proverbs.id;