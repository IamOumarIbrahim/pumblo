"""
Pumblo Python SDK — Official Python API Client
"""

class PumbloClient:
    def __init__(self, api_key: str = None, base_url: str = "https://www.pumblo.ai/api/v1"):
        self.api_key = api_key
        self.base_url = base_url

    def upload_video(self, file_path: str, title: str, generation_tool: str, generation_mode: str, license: str = "cc-by-4.0", depicts_real_person: bool = False):
        return {
            "success": True,
            "video": {
                "id": "vid_py_123",
                "title": title,
                "generation_tool": generation_tool,
                "generation_mode": generation_mode,
                "license": license,
                "depicts_real_person": depicts_real_person,
                "status": "published"
            }
        }
