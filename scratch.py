import json
log_path = r"C:\Users\Lenovo\.gemini\antigravity\brain\ac2c4d73-1d58-45db-8b02-3c2fc9f79255\.system_generated\logs\overview.txt"
with open(log_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            if ":" not in line: continue
            line_content = line.split(":", 1)[1]
            data = json.loads(line_content)
            if "tool_calls" in data:
                for call in data["tool_calls"]:
                    if call["name"] == "replace_file_content":
                        args = call.get("args", {})
                        target = args.get("TargetFile", "")
                        tc = args.get("TargetContent", "")
                        if "WhyChooseUs.js" in target and "IMPECCABLE" in tc:
                            with open("old_code.js", "w", encoding="utf-8") as out:
                                out.write(tc)
                            print("Found in replace_file_content TargetContent!")
                            exit(0)
        except Exception as e:
            pass
