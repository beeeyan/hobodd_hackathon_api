-- ことわざのデータを365日分作成する --
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


-- roomテーブルのデータ
INSERT INTO room (room_id, name, created_at, updated_at) VALUES
('room1', 'Meeting Room A', '2024-01-01 10:00:00', '2024-01-01 10:00:00'),
('room2', 'Conference Room B', '2024-01-02 11:00:00', '2024-01-02 11:00:00'),
('room3', 'Team Space C', '2024-01-03 12:00:00', '2024-01-03 12:00:00'),
('room4', 'Project Room D', '2024-01-04 13:00:00', '2024-01-04 13:00:00'),
('room5', 'Collaboration Space E', '2024-01-05 14:00:00', '2024-01-05 14:00:00'),
('room6', 'Workshop Room F', '2024-01-06 15:00:00', '2024-01-06 15:00:00'),
('room7', 'Study Room G', '2024-01-07 16:00:00', '2024-01-07 16:00:00'),
('room8', 'Discussion Room H', '2024-01-08 17:00:00', '2024-01-08 17:00:00'),
('room9', 'Creative Space I', '2024-01-09 18:00:00', '2024-01-09 18:00:00'),
('room10', 'Innovation Lab J', '2024-01-10 19:00:00', '2024-01-10 19:00:00');

-- usersテーブルのデータ
INSERT INTO users (username, room_id, created_at, updated_at) VALUES
('user1', 'room1', '2024-01-01 09:00:00', '2024-01-01 09:00:00'),
('user2', 'room1', '2024-01-02 09:00:00', '2024-01-02 09:00:00'),
('user3', 'room2', '2024-01-03 09:00:00', '2024-01-03 09:00:00'),
('user4', 'room2', '2024-01-04 09:00:00', '2024-01-04 09:00:00'),
('user5', 'room3', '2024-01-05 09:00:00', '2024-01-05 09:00:00'),
('user6', 'room3', '2024-01-06 09:00:00', '2024-01-06 09:00:00'),
('user7', 'room4', '2024-01-07 09:00:00', '2024-01-07 09:00:00'),
('user8', 'room4', '2024-01-08 09:00:00', '2024-01-08 09:00:00'),
('user9', 'room5', '2024-01-09 09:00:00', '2024-01-09 09:00:00'),
('user10', 'room5', '2024-01-10 09:00:00', '2024-01-10 09:00:00');

-- logsテーブルのデータ
INSERT INTO logs (clicked_at, user_id, sticker, body, created_at) VALUES
('2024-01-01 10:30:00', 1, '👍', 'Great job!', '2024-01-01 10:30:00'),
('2024-01-02 11:30:00', 1, '❤️', 'Awesome!', '2024-01-02 11:30:00'),
('2024-01-03 12:30:00', 2, '😊', 'Nice work!', '2024-01-03 12:30:00'),
('2024-01-04 13:30:00', 2, '🎉', 'Congratulations!', '2024-01-04 13:30:00'),
('2024-01-05 14:30:00', 3, '⭐', 'Well done!', '2024-01-05 14:30:00'),
('2024-01-06 15:30:00', 3, '🌟', 'Brilliant!', '2024-01-06 15:30:00'),
('2024-01-07 16:30:00', 4, '🎈', 'Happy day!', '2024-01-07 16:30:00'),
('2024-01-08 17:30:00', 4, '🎨', 'Creative!', '2024-01-08 17:30:00'),
('2024-01-09 18:30:00', 5, '📚', 'Learning time!', '2024-01-09 18:30:00'),
('2024-01-10 19:30:00', 5, '💡', 'Great idea!', '2024-01-10 19:30:00');

-- room_anniversaryテーブルのデータ
INSERT INTO room_anniversary (room_id, name, message, date, created_at, updated_at) VALUES
('room1', 'Team Birthday', 'Happy Birthday to our team!', '2024-02-01', '2024-01-01 10:00:00', '2024-01-01 10:00:00'),
('room1', 'Project Launch', 'Celebrating our project launch!', '2024-03-01', '2024-01-02 10:00:00', '2024-01-02 10:00:00'),
('room2', 'Company Anniversary', 'One year together!', '2024-04-01', '2024-01-03 10:00:00', '2024-01-03 10:00:00'),
('room2', 'Team Building Day', 'Let''s build stronger bonds!', '2024-05-01', '2024-01-04 10:00:00', '2024-01-04 10:00:00'),
('room3', 'Innovation Day', 'Celebrating creativity!', '2024-06-01', '2024-01-05 10:00:00', '2024-01-05 10:00:00'),
('room3', 'Summer Party', 'Time for summer fun!', '2024-07-01', '2024-01-06 10:00:00', '2024-01-06 10:00:00'),
('room4', 'Achievement Day', 'Celebrating our success!', '2024-08-01', '2024-01-07 10:00:00', '2024-01-07 10:00:00'),
('room4', 'Wellness Day', 'Taking care of ourselves!', '2024-09-01', '2024-01-08 10:00:00', '2024-01-08 10:00:00'),
('room5', 'Tech Summit', 'Learning and growing together!', '2024-10-01', '2024-01-09 10:00:00', '2024-01-09 10:00:00'),
('room5', 'Year End Party', 'Celebrating our achievements!', '2024-12-01', '2024-01-10 10:00:00', '2024-01-10 10:00:00');