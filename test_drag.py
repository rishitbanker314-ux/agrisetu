from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.on("console", lambda msg: print(f"Browser console: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Browser error: {err}"))
        
        print("Navigating...")
        page.goto("http://localhost:3000/en/fields")
        page.wait_for_selector(".lucide-settings")
        print("Clicking settings...")
        page.click(".lucide-settings")
        
        # wait for map to load
        time.sleep(2)
        print("Clicking Draw Custom Boundary...")
        page.click("text=Draw Custom Boundary")
        
        time.sleep(1)
        print("Clicking on map...")
        # click to add points
        page.mouse.click(500, 300)
        time.sleep(0.5)
        page.mouse.click(600, 300)
        time.sleep(0.5)
        page.mouse.click(600, 400)
        time.sleep(0.5)
        page.mouse.click(500, 400)
        time.sleep(0.5)
        
        print("Done. Check logs above.")
        browser.close()

run()
