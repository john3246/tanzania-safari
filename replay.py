import json
import os

log_path = r'C:\Users\john\.gemini\antigravity\brain\82ae044c-93f2-404e-ad93-332e1a683b47\.system_generated\logs\overview.txt'

success_count = 0
fail_count = 0

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
        except:
            continue
            
        if data.get('type') == 'PLANNER_RESPONSE':
            for call in data.get('tool_calls', []):
                name = call.get('name')
                if name not in ['replace_file_content', 'multi_replace_file_content']:
                    continue
                    
                args = call.get('args', {})
                target_file_raw = args.get('TargetFile', '""')
                try:
                    target_file = json.loads(target_file_raw) if target_file_raw.startswith('"') else target_file_raw
                except:
                    continue
                    
                if not target_file or '.gemini' in target_file or not os.path.exists(target_file):
                    continue
                    
                with open(target_file, 'r', encoding='utf-8') as tf:
                    content = tf.read()
                    
                changed = False
                
                if name == 'replace_file_content':
                    try:
                        target_raw = args.get('TargetContent', '""')
                        target = json.loads(target_raw) if target_raw.startswith('"') else target_raw
                        replacement_raw = args.get('ReplacementContent', '""')
                        replacement = json.loads(replacement_raw) if replacement_raw.startswith('"') else replacement_raw
                        
                        if target in content:
                            content = content.replace(target, replacement)
                            changed = True
                        else:
                            print(f"[{target_file}] replace target not found: {repr(target[:30])}...")
                            fail_count += 1
                    except Exception as e:
                        print(f"[{target_file}] exception in replace: {e}")
                        fail_count += 1
                        
                elif name == 'multi_replace_file_content':
                    try:
                        chunks_str = args.get('ReplacementChunks', '[]')
                        chunks = json.loads(chunks_str) if chunks_str.startswith('[') else json.loads(json.loads(chunks_str) if chunks_str.startswith('"') else chunks_str)
                        if isinstance(chunks, str):
                            chunks = json.loads(chunks)
                            
                        for chunk in chunks:
                            target = chunk.get('TargetContent', '')
                            replacement = chunk.get('ReplacementContent', '')
                            if target in content:
                                content = content.replace(target, replacement)
                                changed = True
                            else:
                                print(f"[{target_file}] multi target not found: {repr(target[:30])}...")
                                fail_count += 1
                    except Exception as e:
                        print(f"[{target_file}] exception in multi: {e}")
                        fail_count += 1
                        
                if changed:
                    with open(target_file, 'w', encoding='utf-8') as tf:
                        tf.write(content)
                    success_count += 1

print(f'Replay complete. Success: {success_count}, Fails: {fail_count}')
