// Code wrapper service - Wraps user DSA functions with input parsing
// Supports Python, JavaScript, Java, C++
// Handles both standalone functions AND LeetCode-style class Solution

interface WrapperResult {
  wrappedCode: string;
  language: string;
}

// Extract function name from problem title
function getFunctionName(title: string): string {
  // Convert "Two Sum" -> "twoSum", "Valid Parentheses" -> "validParentheses"
  const words = title.split(/\s+/);
  return words.map((word, i) => {
    const clean = word.replace(/[^a-zA-Z0-9]/g, '');
    return i === 0 ? clean.toLowerCase() : clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
  }).join('');
}

// Python wrapper that parses DSA input format and calls user function/class
function getPythonWrapper(userCode: string, functionName: string): string {
  return `import sys
import json
from typing import List, Optional, Dict, Set, Tuple
from collections import Counter, defaultdict, deque, OrderedDict
import heapq
import math
import bisect
import itertools
import functools
import re
from functools import lru_cache
try:
    from functools import cache
except ImportError:
    cache = lru_cache(maxsize=None)

# ========== LEETCODE DATA STRUCTURES ==========
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
    def __repr__(self):
        return f"ListNode({self.val})"

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
    def __repr__(self):
        return f"TreeNode({self.val})"

class Node:
    """For graph problems (Clone Graph, etc.)"""
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors else []

# ========== CONVERSION HELPERS ==========
def list_to_linked_list(arr):
    """[1,2,3] -> 1->2->3"""
    if not arr:
        return None
    head = ListNode(arr[0])
    curr = head
    for val in arr[1:]:
        curr.next = ListNode(val)
        curr = curr.next
    return head

def linked_list_to_list(head):
    """1->2->3 -> [1,2,3]"""
    result = []
    while head:
        result.append(head.val)
        head = head.next
    return result

def list_to_tree(arr):
    """[3,1,4,null,2] -> TreeNode (level order)"""
    if not arr or arr[0] is None:
        return None
    root = TreeNode(arr[0])
    queue = deque([root])
    i = 1
    while queue and i < len(arr):
        node = queue.popleft()
        if i < len(arr) and arr[i] is not None:
            node.left = TreeNode(arr[i])
            queue.append(node.left)
        i += 1
        if i < len(arr) and arr[i] is not None:
            node.right = TreeNode(arr[i])
            queue.append(node.right)
        i += 1
    return root

def tree_to_list(root):
    """TreeNode -> [3,1,4,null,2] (level order)"""
    if not root:
        return []
    result = []
    queue = deque([root])
    while queue:
        node = queue.popleft()
        if node:
            result.append(node.val)
            queue.append(node.left)
            queue.append(node.right)
        else:
            result.append(None)
    while result and result[-1] is None:
        result.pop()
    return result

def build_graph(n, edges):
    """Build adjacency list from edge list"""
    graph = defaultdict(list)
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)
    return graph

# ========== INPUT PARSING ==========
def parse_value(val_str):
    val_str = val_str.strip()
    if val_str.lower() in ['null', 'none']:
        return None
    if val_str.lower() == 'true':
        return True
    if val_str.lower() == 'false':
        return False
    if (val_str.startswith('"') and val_str.endswith('"')) or (val_str.startswith("'") and val_str.endswith("'")):
        return val_str[1:-1]
    try:
        return json.loads(val_str.replace("'", '"'))
    except:
        pass
    try:
        if '.' in val_str:
            return float(val_str)
        return int(val_str)
    except:
        pass
    return val_str

def parse_input_line(line):
    params = {}
    line = line.strip()
    if '=' not in line:
        return {'input': parse_value(line)}
    parts = []
    current = ""
    depth = 0
    in_string = False
    string_char = None
    for char in line:
        if char in '"\\'':
            if not in_string:
                in_string = True
                string_char = char
            elif char == string_char:
                in_string = False
                string_char = None
        elif char in '[{(' and not in_string:
            depth += 1
        elif char in ']})' and not in_string:
            depth -= 1
        if char == ',' and depth == 0 and not in_string:
            parts.append(current.strip())
            current = ""
        else:
            current += char
    if current.strip():
        parts.append(current.strip())
    for part in parts:
        if '=' in part:
            name, value = part.split('=', 1)
            params[name.strip()] = parse_value(value.strip())
    return params

def format_output(result):
    if result is None:
        return "null"
    if isinstance(result, bool):
        return "true" if result else "false"
    if isinstance(result, ListNode):
        return json.dumps(linked_list_to_list(result), separators=(',', ':'))
    if isinstance(result, TreeNode):
        return json.dumps(tree_to_list(result), separators=(',', ':'))
    if isinstance(result, (list, dict)):
        return json.dumps(result, separators=(',', ':'))
    return str(result)

# ========== USER SOLUTION ==========
${userCode}
# ========== END USER SOLUTION ==========

# Main execution - read all stdin lines
lines = []
try:
    while True:
        lines.append(input())
except EOFError:
    pass
input_str = '\\n'.join(lines).strip()
params = parse_input_line(input_str)

import inspect

def convert_param(name, value):
    """Convert array to TreeNode/ListNode based on param name"""
    if isinstance(value, list):
        # TreeNode params
        if name in ['root', 'tree', 'p', 'q', 'node', 'subRoot', 't1', 't2']:
            return list_to_tree(value)
        # ListNode params
        if name in ['head', 'l1', 'l2', 'list1', 'list2', 'node', 'linked']:
            return list_to_linked_list(value)
    return value

def call_function_smart(func, params):
    """Call function with params, matching by name or position, with auto type conversion"""
    try:
        sig = inspect.signature(func)
        param_names = [p.name for p in sig.parameters.values() if p.name != 'self']
    except:
        param_names = []

    # Convert params based on names (TreeNode, ListNode detection)
    converted_params = {}
    if param_names:
        for i, name in enumerate(param_names):
            if name in params:
                converted_params[name] = convert_param(name, params[name])
            elif i < len(params):
                # Positional match
                val = list(params.values())[i]
                converted_params[name] = convert_param(name, val)

    # Call with converted params
    if converted_params and len(converted_params) == len(param_names):
        return func(**converted_params)

    # Fallback - try positional with conversion
    args = []
    values = list(params.values())
    for i, val in enumerate(values):
        name = param_names[i] if i < len(param_names) else f'arg{i}'
        args.append(convert_param(name, val))

    if len(args) == 1:
        return func(args[0])
    return func(*args)

# Try to find and call the solution
result = None
try:
    # List of helper function names to skip (built-in helpers + common user helpers)
    SKIP_FUNCTIONS = {
        # Built-in wrapper functions
        'parse_value', 'parse_input_line', 'format_output', 'call_function_smart',
        'convert_param', 'list_to_linked_list', 'linked_list_to_list',
        'list_to_tree', 'tree_to_list', 'build_graph',
        # Common user helper names (DFS, Backtracking, etc.)
        'helper', 'dfs', 'bfs', 'merge', 'partition', 'swap', 'heapify',
        'backtrack', 'recurse', 'dp', 'check', 'valid', 'search',
        'traverse', 'preorder', 'inorder', 'postorder', 'sortArray'
    }

    # Check if Solution class exists (LeetCode style)
    if 'Solution' in globals():
        sol = Solution()
        # Get all callable methods from Solution class (exclude builtins)
        methods = [m for m in dir(sol) if not m.startswith('_') and callable(getattr(sol, m))]

        # Use the ONLY real method the user defined (there's usually just one)
        method = None
        if len(methods) == 1:
            method = getattr(sol, methods[0])
        elif len(methods) > 1:
            # Pick first non-helper method
            for m in methods:
                if m not in SKIP_FUNCTIONS:
                    method = getattr(sol, m)
                    break

        if method:
            result = call_function_smart(method, params)

    # Try standalone functions
    if result is None:
        # Get snapshot of globals to avoid iteration issues
        all_globals = list(globals().items())
        for name, obj in all_globals:
            if (callable(obj) and
                not name.startswith('_') and
                name not in SKIP_FUNCTIONS and
                not name.startswith('parse') and
                hasattr(obj, '__code__')):  # Only user-defined functions have __code__
                try:
                    result = call_function_smart(obj, params)
                    break
                except TypeError:
                    continue

    print(format_output(result))
except Exception as e:
    import traceback
    import sys
    print(f"Error: {e}", file=sys.stderr)
    traceback.print_exc(file=sys.stderr)
    print(f"Error: {e}")
`;
}

// JavaScript wrapper
function getJavaScriptWrapper(userCode: string, functionName: string): string {
  return `
// ========== USER SOLUTION ==========
${userCode}
// ========== END USER SOLUTION ==========

function parseValue(valStr) {
  valStr = valStr.trim();

  if (valStr.toLowerCase() === 'null') return null;
  if (valStr.toLowerCase() === 'true') return true;
  if (valStr.toLowerCase() === 'false') return false;

  if ((valStr.startsWith('"') && valStr.endsWith('"')) ||
      (valStr.startsWith("'") && valStr.endsWith("'"))) {
    return valStr.slice(1, -1);
  }

  try {
    return JSON.parse(valStr.replace(/'/g, '"'));
  } catch {}

  const num = Number(valStr);
  if (!isNaN(num)) return num;

  return valStr;
}

function parseInputLine(line) {
  const params = {};
  line = line.trim();

  if (!line.includes('=')) {
    return { input: parseValue(line) };
  }

  const parts = [];
  let current = "";
  let depth = 0;
  let inString = false;
  let stringChar = null;

  for (const char of line) {
    if ((char === '"' || char === "'") && !inString) {
      inString = true;
      stringChar = char;
    } else if (char === stringChar && inString) {
      inString = false;
      stringChar = null;
    } else if ('[{('.includes(char) && !inString) {
      depth++;
    } else if (']})'.includes(char) && !inString) {
      depth--;
    }

    if (char === ',' && depth === 0 && !inString) {
      parts.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  if (current.trim()) parts.push(current.trim());

  for (const part of parts) {
    if (part.includes('=')) {
      const [name, ...rest] = part.split('=');
      params[name.trim()] = parseValue(rest.join('=').trim());
    }
  }

  return params;
}

function formatOutput(result) {
  if (result === null) return "null";
  if (typeof result === 'boolean') return result ? "true" : "false";
  if (Array.isArray(result) || typeof result === 'object') {
    return JSON.stringify(result);
  }
  return String(result);
}

function getCallable() {
  // Check if Solution class exists
  if (typeof Solution !== 'undefined') {
    const sol = new Solution();
    // Try exact method name first
    if (typeof sol['${functionName}'] === 'function') {
      return sol['${functionName}'].bind(sol);
    }
    // Try lowercase
    if (typeof sol['${functionName.toLowerCase()}'] === 'function') {
      return sol['${functionName.toLowerCase()}'].bind(sol);
    }
    // Find any method
    for (const key in sol) {
      if (typeof sol[key] === 'function' && !key.startsWith('_')) {
        return sol[key].bind(sol);
      }
    }
  }

  // Try standalone function
  if (typeof ${functionName} === 'function') {
    return ${functionName};
  }

  throw new Error('Could not find function ${functionName} or class Solution');
}

// Read stdin
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
let inputLines = [];

rl.on('line', (line) => inputLines.push(line));
rl.on('close', () => {
  try {
    const inputStr = inputLines.join('\\n').trim();
    const params = parseInputLine(inputStr);

    const func = getCallable();
    let result;

    if (Object.keys(params).length === 1 && 'input' in params) {
      result = func(params.input);
    } else {
      result = func(...Object.values(params));
    }

    console.log(formatOutput(result));
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
});
`;
}

// Java wrapper with main class
function getJavaWrapper(userCode: string, functionName: string, className: string = 'Solution'): string {
  return `
import java.util.*;
import java.util.regex.*;
import org.json.*;

// ========== USER SOLUTION ==========
${userCode}
// ========== END USER SOLUTION ==========

class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        StringBuilder input = new StringBuilder();
        while (scanner.hasNextLine()) {
            input.append(scanner.nextLine());
        }

        try {
            String inputStr = input.toString().trim();
            ${className} solution = new ${className}();

            // Parse input and call solution
            // This is a simplified wrapper - complex parsing needed for production
            System.out.println(solution.${functionName}(parseArray(inputStr)));
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            System.exit(1);
        }
    }

    static int[] parseArray(String str) {
        // Simple array parser
        str = str.replaceAll("[\\\\[\\\\]\\\\s]", "");
        if (str.isEmpty()) return new int[0];
        String[] parts = str.split(",");
        int[] result = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            result[i] = Integer.parseInt(parts[i].trim());
        }
        return result;
    }
}
`;
}

// C++ wrapper
function getCppWrapper(userCode: string, functionName: string): string {
  return `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
using namespace std;

// ========== USER SOLUTION ==========
${userCode}
// ========== END USER SOLUTION ==========

vector<int> parseArray(const string& str) {
    vector<int> result;
    string cleaned = str;
    cleaned.erase(remove(cleaned.begin(), cleaned.end(), '['), cleaned.end());
    cleaned.erase(remove(cleaned.begin(), cleaned.end(), ']'), cleaned.end());
    cleaned.erase(remove(cleaned.begin(), cleaned.end(), ' '), cleaned.end());

    stringstream ss(cleaned);
    string item;
    while (getline(ss, item, ',')) {
        if (!item.empty()) {
            result.push_back(stoi(item));
        }
    }
    return result;
}

void printVector(const vector<int>& v) {
    cout << "[";
    for (int i = 0; i < v.size(); i++) {
        if (i > 0) cout << ",";
        cout << v[i];
    }
    cout << "]" << endl;
}

int main() {
    string line;
    getline(cin, line);

    // Parse input - this is simplified
    // For production, need more robust parsing

    Solution sol;
    // Call user function - need to adapt based on problem
    // This is a template that needs customization

    return 0;
}
`;
}

// Main wrapper function
export function wrapCode(
  userCode: string,
  language: string,
  problemTitle: string = 'solution'
): WrapperResult {
  const functionName = getFunctionName(problemTitle);
  const lang = language.toLowerCase();

  // Check if code already has main/stdin handling
  const hasMainPython = userCode.includes('if __name__') || userCode.includes('input()') || userCode.includes('sys.stdin');
  const hasMainJS = userCode.includes('readline') || userCode.includes('process.stdin');
  const hasMainJava = userCode.includes('public static void main');
  const hasMainCpp = userCode.includes('int main(');

  // If user code already handles input, don't wrap
  if ((lang === 'python' && hasMainPython) ||
      (lang === 'javascript' && hasMainJS) ||
      (lang === 'java' && hasMainJava) ||
      ((lang === 'cpp' || lang === 'c++') && hasMainCpp)) {
    return { wrappedCode: userCode, language };
  }

  switch (lang) {
    case 'python':
    case 'python3':
      return { wrappedCode: getPythonWrapper(userCode, functionName), language: 'python' };

    case 'javascript':
    case 'js':
      return { wrappedCode: getJavaScriptWrapper(userCode, functionName), language: 'javascript' };

    case 'java':
      return { wrappedCode: getJavaWrapper(userCode, functionName), language: 'java' };

    case 'cpp':
    case 'c++':
      return { wrappedCode: getCppWrapper(userCode, functionName), language: 'cpp' };

    default:
      // Return unwrapped for unsupported languages
      return { wrappedCode: userCode, language };
  }
}

// Generate starter code template for a problem
export function getStarterCode(language: string, problemTitle: string, params: string[] = []): string {
  const functionName = getFunctionName(problemTitle);
  const lang = language.toLowerCase();

  // Default params if not provided
  const paramList = params.length > 0 ? params : ['nums', 'target'];

  switch (lang) {
    case 'python':
    case 'python3':
      return `def ${functionName}(${paramList.join(', ')}):
    # Write your solution here
    pass
`;

    case 'javascript':
    case 'js':
      return `function ${functionName}(${paramList.join(', ')}) {
    // Write your solution here

}
`;

    case 'java':
      return `class Solution {
    public int[] ${functionName}(int[] ${paramList[0] || 'nums'}, int ${paramList[1] || 'target'}) {
        // Write your solution here
        return new int[]{};
    }
}
`;

    case 'cpp':
    case 'c++':
      return `class Solution {
public:
    vector<int> ${functionName}(vector<int>& ${paramList[0] || 'nums'}, int ${paramList[1] || 'target'}) {
        // Write your solution here
        return {};
    }
};
`;

    default:
      return `// Write your ${functionName} solution here\n`;
  }
}

export default { wrapCode, getStarterCode, getFunctionName };
