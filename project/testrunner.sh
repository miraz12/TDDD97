#!/bin/bash

sqlite3 database.db "DELETE FROM messages WHERE receiver='email@hotmail.com' AND message='Test Message!'"
sqlite3 database.db "DELETE FROM accounts WHERE email='email@hotmail.com'"


python selenium/selenium_test.py 

