import sys, os

# Add the project root to the path so all sibling .py modules can be found
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
