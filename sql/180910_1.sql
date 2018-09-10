CREATE TABLE tbl_users (
  username VARCHAR(60) PRIMARY KEY,
  password VARCHAR(60) NOT NULL,
  fullName VARCHAR(100),
  email VARCHAR(100),
  photos TEXT
)