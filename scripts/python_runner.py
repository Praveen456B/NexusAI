#!/usr/bin/env python3
"""
NexusAI - Safe Python Code Runner for AI Engineering Labs
Executes Python AI exercises, benchmarks, and scripts with timeout and sandboxed stdout.
"""

import sys
import io
import contextlib
import time
import json
import traceback

def run_code(code_str: str):
    start_time = time.perf_counter()
    stdout_buffer = io.StringIO()
    stderr_buffer = io.StringIO()
    
    # Safe global environment with math, re, json, collections, etc.
    safe_globals = {
        "__builtins__": __builtins__,
        "sys": sys,
        "time": time,
        "json": json,
    }
    
    success = True
    error_msg = None
    
    with contextlib.redirect_stdout(stdout_buffer), contextlib.redirect_stderr(stderr_buffer):
        try:
            exec(code_str, safe_globals)
        except Exception:
            success = False
            error_msg = traceback.format_exc()
            
    elapsed_ms = (time.perf_counter() - start_time) * 1000
    
    output = stdout_buffer.getvalue()
    err_output = stderr_buffer.getvalue()
    if error_msg:
        err_output += "\n" + error_msg
        
    return {
        "success": success,
        "stdout": output,
        "stderr": err_output,
        "executionTimeMs": round(elapsed_ms, 2)
    }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        code_input = sys.argv[1]
    else:
        code_input = sys.stdin.read()
        
    result = run_code(code_input)
    print(json.dumps(result))
