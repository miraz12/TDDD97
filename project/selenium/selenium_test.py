import unittest
from selenium import webdriver

import time


class GoogleTestCase(unittest.TestCase):

    def setUp(self):
        self.browser = webdriver.Chrome()
        self.addCleanup(self.browser.quit)
        self.browser.get('http://localhost:5000')

    def test1SignUp(self):
        self.browser.find_element_by_name('Name').send_keys('Name')
        self.browser.find_element_by_name('Family').send_keys('Family')
        self.browser.find_element_by_name('Gender').send_keys('Male')
        self.browser.find_element_by_name('City').send_keys('City')
        self.browser.find_element_by_name('Country').send_keys('Country')
        self.browser.find_element_by_name('Email').send_keys('email@hotmail.com')
        self.browser.find_element_by_name('Password').send_keys('password')
        self.browser.find_element_by_name('RptPassword').send_keys('password')

        self.browser.find_element_by_name("submit-signup").click()

        time.sleep(1)
        self.assertIn('email@hotmail.com', self.browser.page_source)

    def test2Login(self):
        email = 'email@hotmail.com'
        password = 'password'

        emailF = self.browser.find_element_by_name('inputEmail')
        passF = self.browser.find_element_by_name('inputPassword')

        emailF.send_keys(email)
        passF.send_keys(password)

        self.browser.find_element_by_id("submit").click()

        time.sleep(1)
        self.assertIn(email, self.browser.page_source)

    def test3Logout(self):

        self.test2Login()

        #self.browser.find_element_by_id("homeTab").style.display = "none";
        #self.browser.find_element_by_id("browseTab").style.display = "none";
        #self.browser.find_element_by_id("accountTab").style.display = "none";

        #self.browser.find_element_by_id("homeTabButton").style.backgroundColor = "inherit";
        #self.browser.find_element_by_id("browseTabButton").style.backgroundColor = "inherit";
        #self.browser.find_element_by_id("accountTabButton").style.backgroundColor = "inherit";

        self.browser.execute_script('accountPressed()')

        self.assertIn('Logout', self.browser.page_source)

        time.sleep(1)

        self.browser.find_element_by_id("logoutButton").click()

        time.sleep(1)

        self.assertIn('Login', self.browser.page_source)


if __name__ == '__main__':
    unittest.main(verbosity=2)