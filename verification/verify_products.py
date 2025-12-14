
from playwright.sync_api import Page, expect, sync_playwright

def verify_products_page(page: Page):
  """
  Navigates to the products page and takes a screenshot.
  """
  # 1. Arrange: Go to the products page.
  page.goto("http://localhost:3000/products.html")

  # 2. Assert: Check for the presence of the product grid.
  # This is a basic check to ensure the page has loaded.
  expect(page.locator("#product-grid")).to_be_visible()

  # 3. Screenshot: Capture the final result for visual verification.
  page.screenshot(path="verification/products-page.png")

if __name__ == "__main__":
  with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    try:
      verify_products_page(page)
    finally:
      browser.close()
