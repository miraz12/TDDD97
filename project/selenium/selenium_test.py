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

    def test3WriteOnWall(self):
        self.test2Login()
        post_message = 'Test Message!'

        self.browser.find_element_by_id('postInput').send_keys(post_message)
        self.browser.find_element_by_id('submit_home').click()

        #Should be able to save object and use it here but didnt work?
        self.browser.find_element_by_id('postInput').clear()

        self.assertIn(post_message, self.browser.page_source)

    def test4SearchUser(self):
        self.test2Login()
        self.browser.execute_script('browsePressed()')

        email = 'email@hotmail.com'

        self.browser.find_element_by_id('userSearch').send_keys(email)
        self.browser.find_element_by_id('userSearchButton').click()

        self.browser.find_element_by_id('userSearch').clear()

        self.assertIn(email, self.browser.page_source)

    def test5Logout(self):

        self.test2Login()

        self.browser.execute_script('accountPressed()')

        self.assertIn('Logout', self.browser.page_source)

        time.sleep(1)

        self.browser.find_element_by_id("logoutButton").click()

        time.sleep(1)

        self.assertIn('Login', self.browser.page_source)


if __name__ == '__main__':
    unittest.main(verbosity=2)