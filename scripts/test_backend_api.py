import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "backend"))

import app

def test_api():
    print("=" * 60)
    print("Testing Backend API with Deep Code Quality & Step-by-Step")
    print("=" * 60)

    client = app.app.test_client()

    # 1. Health
    res = client.get("/health")
    assert res.status_code == 200
    print("[PASS] 1. /health -> 200")

    # 2. Syntax Error Detection Test
    bad_syntax_code = "def broken_func(arr\n    return arr"
    ast_res = app.inspect_python_syntax_and_indentation(bad_syntax_code)
    print(f"2. AST Syntax Check on broken code: valid={ast_res['is_valid']}, status={ast_res['status']}")
    assert ast_res["is_valid"] is False
    print("[PASS] 2. Deterministic Syntax Error Detection Passed")

    # 3. Optimize with Step-by-Step Guide
    sample_code = """def find_unique_elements(arr):
    temp_storage = []
    for i in range(len(arr)):
        is_duplicate = False
        for j in range(len(arr)):
            if i != j and arr[i] == arr[j]:
                is_duplicate = True
                break
        if not is_duplicate:
            if arr[i] not in temp_storage:
                temp_storage.append(arr[i])
    return temp_storage"""

    opt_res = client.post("/api/v1/optimize", json={
        "code": sample_code,
        "language": "python",
        "userId": "firebase_test_user_12345",
        "editorUrl": "https://colab.research.google.com"
    })
    assert opt_res.status_code == 200
    data = opt_res.get_json().get("data", {})
    
    print("\n[PASS] 3. /api/v1/optimize -> 200")
    print(f"   Syntax Valid: {data.get('syntax_analysis', {}).get('is_valid')}")
    print(f"   Variable Hygiene: {data.get('variable_analysis', {}).get('hygiene_rating')}")
    print(f"   Indentation Proper: {data.get('indentation_analysis', {}).get('is_properly_indented')}")
    print(f"   Can Simplify: {data.get('simplification_analysis', {}).get('can_simplify')}")
    print(f"   Steps Count: {len(data.get('step_by_step_guide', []))}")
    for step in data.get('step_by_step_guide', []):
        print(f"     -> Step {step['step']}: {step['title']}")

    # 4. User Stats
    stats_res = client.get("/api/v1/user/stats?userId=firebase_test_user_12345")
    assert stats_res.status_code == 200
    print("\n[PASS] 4. /api/v1/user/stats -> 200")
    print(f"   Fixes: {stats_res.get_json().get('data', {}).get('fixes_pct')}%")

    # 5. Feedback Telemetry (Accept / Reject)
    fb_res = client.post("/api/v1/feedback", json={
        "userId": "firebase_test_user_12345",
        "action": "ACCEPT",
        "lineCode": "seen = set()",
        "reason": "Replaced O(N) list search with O(1) hash set"
    })
    assert fb_res.status_code == 200
    print("\n[PASS] 5. /api/v1/feedback (ACCEPT) -> 200")
    print(f"   Action: {fb_res.get_json().get('action')}")

    print("\n" + "=" * 60)
    print("ALL DEEP CODE QUALITY & STEP-BY-STEP TESTS PASSED!")
    print("=" * 60)

if __name__ == "__main__":
    test_api()
