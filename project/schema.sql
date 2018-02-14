CREATE TABLE if NOT EXISTS accounts(
  email text primary key,
  password text,
  firstname text,
  familyname text,
  gender text,
  city text,
  country text,
  salt text
);

CREATE TABLE IF NOT EXISTS messages(
  sender text,
  receiver text,
  message text
);