import json

questions = []
q_index = 1

categories = ['loops', 'arrays', 'strings', 'dsa', 'sql']
difficulties = ['easy', 'medium', 'hard']
q_per_category = 200  # 1000 / 5 = 200 per category

templates = {
    'loops': [
        {'t': 'Print Numbers', 'd': 'Print numbers 1 to N', 'h': 'Use loop'},
        {'t': 'Sum Numbers', 'd': 'Sum numbers 1 to N', 'h': 'Add in loop'},
        {'t': 'Count Even', 'd': 'Count even numbers to N', 'h': 'Check modulo'},
        {'t': 'Fibonacci', 'd': 'Generate Fibonacci', 'h': 'Two variables'},
        {'t': 'Prime Check', 'd': 'Check if prime', 'h': 'Test divisibility'},
        {'t': 'Factorial', 'd': 'Calculate factorial', 'h': 'Multiply in loop'},
        {'t': 'Palindrome', 'd': 'Check palindrome number', 'h': 'Reverse and compare'},
        {'t': 'Power', 'd': 'Calculate power', 'h': 'Multiply repeatedly'},
        {'t': 'GCD', 'd': 'Find GCD of numbers', 'h': 'Euclidean algorithm'},
        {'t': 'LCM', 'd': 'Find LCM of numbers', 'h': 'Use GCD formula'},
    ],
    'arrays': [
        {'t': 'Array Sum', 'd': 'Sum array elements', 'h': 'Add each element'},
        {'t': 'Find Max', 'd': 'Find maximum element', 'h': 'Compare all'},
        {'t': 'Find Min', 'd': 'Find minimum element', 'h': 'Compare all'},
        {'t': 'Search', 'd': 'Search for element', 'h': 'Linear search'},
        {'t': 'Reverse', 'd': 'Reverse array order', 'h': 'Two pointers'},
        {'t': 'Sort', 'd': 'Sort array', 'h': 'Sorting algorithm'},
        {'t': 'Duplicates', 'd': 'Find duplicates', 'h': 'Hash set'},
        {'t': 'Intersection', 'd': 'Find common elements', 'h': 'Two pointers'},
        {'t': 'Merge', 'd': 'Merge two arrays', 'h': 'Two pointers'},
        {'t': 'Rotate', 'd': 'Rotate array', 'h': 'Reversal method'},
    ],
    'strings': [
        {'t': 'Length', 'd': 'Find string length', 'h': 'Count chars'},
        {'t': 'Reverse', 'd': 'Reverse string', 'h': 'Backwards loop'},
        {'t': 'Palindrome', 'd': 'Check palindrome', 'h': 'Compare reverse'},
        {'t': 'Vowels', 'd': 'Count vowels', 'h': 'Check each char'},
        {'t': 'Uppercase', 'd': 'Convert uppercase', 'h': 'ASCII change'},
        {'t': 'Lowercase', 'd': 'Convert lowercase', 'h': 'ASCII change'},
        {'t': 'Anagram', 'd': 'Check anagram', 'h': 'Sort compare'},
        {'t': 'Substring', 'd': 'Find substring', 'h': 'Pattern match'},
        {'t': 'Words', 'd': 'Count words', 'h': 'Split by space'},
        {'t': 'First Unique', 'd': 'First unique char', 'h': 'Hash map'},
    ],
    'dsa': [
        {'t': 'Binary Search', 'd': 'Search sorted array', 'h': 'Divide conquer'},
        {'t': 'Merge Sort', 'd': 'Merge sort algorithm', 'h': 'Divide merge'},
        {'t': 'Quick Sort', 'd': 'Quick sort algorithm', 'h': 'Partition'},
        {'t': 'Two Sum', 'd': 'Find two sum', 'h': 'Hash map'},
        {'t': 'BFS', 'd': 'Breadth search', 'h': 'Use queue'},
        {'t': 'DFS', 'd': 'Depth search', 'h': 'Use stack'},
        {'t': 'LIS', 'd': 'Longest increasing', 'h': 'Dynamic program'},
        {'t': 'Edit Distance', 'd': 'Levenshtein distance', 'h': 'Dynamic program'},
        {'t': 'Topological', 'd': 'Topological sort', 'h': 'DFS/Kahn'},
        {'t': 'Dijkstra', 'd': 'Shortest path', 'h': 'Priority queue'},
    ],
    'sql': [
        {'t': 'SELECT', 'd': 'Basic select query', 'h': 'SELECT clause'},
        {'t': 'WHERE', 'd': 'Filter with WHERE', 'h': 'WHERE condition'},
        {'t': 'COUNT', 'd': 'Count rows', 'h': 'COUNT aggregate'},
        {'t': 'GROUP BY', 'd': 'Group results', 'h': 'GROUP BY clause'},
        {'t': 'HAVING', 'd': 'Filter groups', 'h': 'HAVING clause'},
        {'t': 'JOIN', 'd': 'Join tables', 'h': 'INNER JOIN'},
        {'t': 'LEFT JOIN', 'd': 'Left join', 'h': 'LEFT JOIN'},
        {'t': 'DISTINCT', 'd': 'Unique values', 'h': 'DISTINCT'},
        {'t': 'ORDER BY', 'd': 'Sort results', 'h': 'ORDER BY'},
        {'t': 'LIMIT', 'd': 'Limit rows', 'h': 'LIMIT clause'},
    ]
}

# Generate questions
for cat in categories:
    cat_templates = templates[cat]
    cat_short = cat[:3].upper()
    
    for i in range(q_per_category):
        template = cat_templates[i % len(cat_templates)]
        diff = difficulties[i % 3]
        coins = 10 if diff == 'easy' else 25 if diff == 'medium' else 50
        diff_char = 'E' if diff == 'easy' else 'M' if diff == 'medium' else 'H'
        
        questions.append({
            'id': f'{cat_short}_{diff_char}_{q_index:04d}',
            'title': template['t'] + f' {i}',
            'description': template['d'] + f' - Problem {i}',
            'category': cat,
            'difficulty': diff,
            'coins': coins,
            'constraints': '1 ≤ N ≤ 100000',
            'solution_hint': template['h'],
            'test_cases': [
                {'input': '5', 'expected_output': '5'},
                {'input': '10', 'expected_output': '10'},
                {'input': '1', 'expected_output': '1'}
            ]
        })
        q_index += 1

# Save to file
with open('questions_1000.json', 'w') as f:
    json.dump(questions, f, indent=2)

print(f'Successfully generated {len(questions)} questions!')
