"""
Capture terminal output to identify issues
"""
import subprocess
import sys
import time

print("=" * 70)
print("CAPTURING TERMINAL OUTPUT")
print("=" * 70)
print()

# Run the app and capture output
try:
    print("Starting main_tkinter_free.py...")
    print("-" * 70)
    
    # Run with timeout to capture initial output
    process = subprocess.Popen(
        [sys.executable, "main_tkinter_free.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    
    # Read output for a few seconds
    output_lines = []
    start_time = time.time()
    timeout = 5  # 5 seconds
    
    while time.time() - start_time < timeout:
        if process.poll() is not None:
            # Process ended
            remaining_output = process.stdout.read()
            if remaining_output:
                output_lines.append(remaining_output)
            break
        
        # Try to read a line
        try:
            line = process.stdout.readline()
            if line:
                output_lines.append(line.rstrip())
                print(line.rstrip())
        except:
            break
    
    # Kill process if still running
    if process.poll() is None:
        process.terminate()
        try:
            process.wait(timeout=2)
        except:
            process.kill()
    
    print("-" * 70)
    print(f"\nCaptured {len(output_lines)} lines of output")
    print("=" * 70)
    
    # Check for errors
    error_keywords = ['error', 'Error', 'ERROR', 'exception', 'Exception', 'Traceback', 'failed', 'Failed']
    errors_found = []
    for i, line in enumerate(output_lines):
        for keyword in error_keywords:
            if keyword in line:
                errors_found.append((i+1, line))
                break
    
    if errors_found:
        print("\n[WARN] Potential errors found:")
        for line_num, line in errors_found[:10]:  # Show first 10
            print(f"  Line {line_num}: {line}")
    else:
        print("\n[OK] No obvious errors found in output")
    
except Exception as e:
    print(f"\n[ERROR] Failed to capture output: {e}")
    import traceback
    traceback.print_exc()

