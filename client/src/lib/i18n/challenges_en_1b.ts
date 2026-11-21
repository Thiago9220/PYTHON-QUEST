import type { LocalizedChallengeFields } from './worlds_en';

export const CHALLENGES_EN_1B: Record<string, LocalizedChallengeFields> = {
  "li-01": {
    introStory: "The city's data never travels alone. In the List Nest, CorpHQ stacks millions of records into queues. Learn to organize them and you'll see patterns they don't want anyone to see.",
    "title": "Reconnaissance Buffer",
    "description": "Create a list called 'servidores' with the strings 'Nginx', 'Apache', and 'IIS', and print the list.",
    "narrative": "Your probe intercepted the names of active servers. Store them in a list for downstream processing.",
    "concept": "Creating Lists",
    "conceptExplanation": "A list is like a drawer with multiple compartments. You can store many pieces of information in a single variable, preserving the order in which they were added.",
    "hints": [
      "Lists in Python are defined using square brackets [ ].",
      "Separate items with commas.",
      "servidores = ['Nginx', 'Apache', 'IIS']\nprint(servidores)"
    ],
    "successStory": "Server inventory recorded. The buffer is ready for indexing."
  },
  "li-02": {
    "title": "Priority Target",
    "description": "Given the list 'ips', print the first and last element (one on each line).",
    "narrative": "In a target list, the first and last entries are typically the gateway and backup node. Identify them quickly.",
    "concept": "List Indexing",
    "conceptExplanation": "Each item in a list has a position (index). Python starts counting from zero. You can also count backwards from the end using negative numbers!",
    "hints": [
      "The index of the first element is 0: lista[0].",
      "The index of the last element can be -1: lista[-1].",
      "print(ips[0])\nprint(ips[-1])"
    ],
    "successStory": "Network endpoints identified. The perimeter is mapped."
  },
  "li-03": {
    "title": "Buffer Slicing",
    "description": "Given the list 'dados', print the first 3 elements using slicing.",
    "narrative": "The memory dump is too large. Extract only the header (the first 3 bytes) for rapid analysis.",
    "concept": "Slicing",
    "conceptExplanation": "Slicing allows you to 'cut' segments out of a list. If you want from the beginning up to index 3 (without including 3), use [:3].",
    "hints": [
      "Slicing uses the syntax: lista[start:end].",
      "The item at the 'end' index is excluded. Use :3 to get 0, 1, and 2.",
      "print(dados[:3])"
    ],
    "successStory": "Header extracted. File type identified as an encrypted JPEG."
  },
  "li-04": {
    "title": "Host Count",
    "description": "Given the list 'conexoes', use the len() function to print the number of active connections.",
    "narrative": "How many devices are connected to our network right now? The system needs an exact figure to allocate bandwidth.",
    "concept": "len() Function",
    "conceptExplanation": "len() is short for 'length'. Use it to determine how many items exist in any collection.",
    "hints": [
      "The len(lista) function returns the number of items.",
      "print(len(conexoes))"
    ],
    "successStory": "Network load calculated. 5 active sessions detected."
  },
  "li-05": {
    "title": "Packet Injection",
    "description": "Given the list 'blacklist', add the string '10.0.0.1' to the end of the list using append() and print the full list.",
    "narrative": "A suspicious new IP was detected attempting brute force. Append it to our blacklist immediately.",
    "concept": "append() Method",
    "conceptExplanation": "append() adds a new item to the tail of the list. It is the most common method for growing a list dynamically.",
    "hints": [
      "Use lista.append(item) to add an element to the end.",
      "Note that append() mutates the original list in-place; no '=' assignment is needed.",
      "blacklist.append('10.0.0.1')\nprint(blacklist)"
    ],
    "successStory": "IP blocked. Defense systems updated."
  },
  "li-06": {
    "title": "Log Scrubbing",
    "description": "Given the list 'logs', remove the last element using pop() and print the updated list.",
    "narrative": "The last entry in the log contains your digital footprint. Purge it before the audit system detects it.",
    "concept": "pop() Method",
    "conceptExplanation": "pop() pops the last item off the list. If you do not pass an index, it removes and returns the last item by default.",
    "hints": [
      "The lista.pop() method removes and returns the last item.",
      "logs.pop()\nprint(logs)"
    ],
    "successStory": "Evidence erased. Your presence on this thread is now a ghost."
  },
  "li-07": {
    "title": "Port Sorting",
    "description": "Given the list 'portas', sort it in ascending order using sort() and print the result.",
    "narrative": "The scanned ports are jumbled. Organize them numerically so we can coordinate a sequential exploit.",
    "concept": "sort() Method",
    "conceptExplanation": "sort() orders the list. For numbers, from lowest to highest. For strings, in alphabetical order.",
    "hints": [
      "The lista.sort() method organizes the list in-place (mutating the variable itself).",
      "portas.sort()\nprint(portas)"
    ],
    "successStory": "Attack vector aligned. Initiating sequence at the FTP port (21)."
  },
  "li-08": {
    "title": "Latency Analysis",
    "description": "Given the list 'pings', print the lowest and highest values using the min() and max() functions.",
    "narrative": "Find the fastest and slowest servers on the local network to determine where to deploy our backdoor.",
    "concept": "min() and max() Functions",
    "conceptExplanation": "These utility functions scan the entire list and return the desired extreme value in a heartbeat.",
    "hints": [
      "Use min(lista) for the lowest value and max(lista) for the highest."
    ],
    "successStory": "5ms server selected as primary host."
  },
  "li-09": {
    "title": "Total Data Payload",
    "description": "Given the list 'pacotes' (sizes in KB), print the total sum of all elements using sum().",
    "narrative": "Calculate the total size of the payload we are about to exfiltrate from CorpHQ's servers.",
    "concept": "sum() Function",
    "conceptExplanation": "Instead of adding items one by one, the sum() function handles the heavy lifting of iteration for you.",
    "hints": [
      "The sum(lista) function automatically sums all numbers in the list."
    ],
    "successStory": "960KB primed for transfer. Initiating encrypted upload."
  },
  "li-10": {
    "title": "Intruder Filter",
    "description": "Check if '192.168.1.50' is in the list 'permitidos' using the 'in' operator and print the result (True or False).",
    "narrative": "An inbound request has arrived. Verify whether the source IP is listed on our allowed whitelist.",
    "concept": "'in' Operator",
    "conceptExplanation": "The 'in' operator is the fastest way to check whether a value exists inside a collection.",
    "hints": [
      "Use the syntax: item in lista.",
      "This returns a boolean value (True or False)."
    ],
    "successStory": "Access denied. The intruder was rerouted into a honeypot."
  },
  "li-11": {
    "title": "Data Matrix",
    "description": "Given the 3x3 matrix 'grid', access and print the center element (the number 5).",
    "narrative": "The Core relies on layered matrix protection. To penetrate the core, index the center coordinate of the security grid.",
    "concept": "Nested Lists (Matrices)",
    "conceptExplanation": "A list can contain other lists! This creates 2D data structures, like spreadsheets or maps. You access the outer list first, then the inner list.",
    "hints": [
      "To access lists inside lists, use two pairs of brackets: grid[row][column].",
      "Remember: indices start at 0. The center element is at row 1, column 1.",
      "print(grid[1][1])"
    ],
    "successStory": "Core breached! The security grid was pierced dead center."
  },
  "li-12": {
    "title": "Final Challenge: Key Swap",
    "description": "Given the list 'chaves' containing two elements, swap their order (exchange the first for the second and vice versa) and print the list.",
    "narrative": "To deceive the firewall, we must invert the order of cryptographic keys in the output buffer. Move fast, time is running out!",
    "concept": "Swapping Values (Swap)",
    "conceptExplanation": "Python allows you to swap variable values or list elements gracefully: x, y = y, x. This eliminates the need for temporary variables just for the swap.",
    "hints": [
      "You can use a temporary variable or Python's multiple assignment.",
      "Multiple assignment: a, b = b, a",
      "chaves[0], chaves[1] = chaves[1], chaves[0]\nprint(chaves)"
    ],
    "successStory": "Handshake inverted! The firewall was tricked, granting you access to the batch storage sector. Stellar work, Operator."
  },
  "li-13": {
    "title": "Strategic Insertion",
    "description": "Use insert() to insert the IP '0.0.0.0' at position 0 (the beginning) of the list 'blacklist' and print the list.",
    "narrative": "A critical priority IP has been detected. It must go straight to the top of the blacklist, guaranteeing it gets checked first by the firewall.",
    "concept": "insert() Method",
    "conceptExplanation": "While append() always puts items at the end, insert() lets you specify the exact position where the new element enters. Existing items from that index onward are shifted forward by one position without data loss.",
    "hints": [
      "lista.insert(index, item) places the item at the specified position.",
      "Elements from that index onward are shifted one position forward.",
      "blacklist.insert(0, '0.0.0.0')\nprint(blacklist)"
    ],
    "successStory": "Priority IP in place. The firewall now scrutinizes this target ahead of all others."
  },
  "li-14": {
    "title": "Selective Quarantine",
    "description": "Use remove() to excise the node 'COMPROMETIDO' from the list 'cluster' and print the updated list.",
    "narrative": "A cluster node has been infected by malware. Quarantine it from the active pool before the contagion spreads to the remaining nodes.",
    "concept": "remove() Method",
    "conceptExplanation": "Unlike pop() — which removes by position —, remove() takes the actual VALUE you want to delete. This is useful when you know what to remove, but not its position.\n\nNote: if there are multiple occurrences, only the first one is removed.",
    "hints": [
      "lista.remove(value) removes the first occurrence of the specified value.",
      "cluster.remove('COMPROMETIDO')"
    ],
    "successStory": "Compromised node isolated. The cluster is operating under clean conditions once again."
  },
  "li-15": {
    "title": "Target Triangulation",
    "description": "Use index() to find the position of the IP '172.16.0.5' in the list 'rastreio' and print that index.",
    "narrative": "Locate exactly where the intruder surfaces in the intercepted log sequence to correlate with the attack timestamp.",
    "concept": "index() Method",
    "conceptExplanation": "While the 'in' operator only reports presence (True/False), index() goes further and delivers the exact position where the value first appears.\n\nIf the value is not in the list, ValueError is raised — so check with 'in' first if needed.",
    "hints": [
      "lista.index(value) returns the index of the first occurrence of the value.",
      "print(rastreio.index('172.16.0.5'))"
    ],
    "successStory": "Position triangulated. The intruder's timestamp has been matched with surveillance feeds."
  },
  "li-16": {
    "title": "Frequency Analysis",
    "description": "Use count() to determine how many times the IP '5.5.5.5' appears in the list 'tentativas' and print the result.",
    "narrative": "Defense protocols detected recurring requests from the same IP. Quantify the frequency to classify it as a brute-force assault or an isolated probe.",
    "concept": "count() Method",
    "conceptExplanation": "count() scans the entire list and tells you how many times a specific value appears. It is the ideal tool for frequency analysis without having to write a manual loop.",
    "hints": [
      "lista.count(value) returns how many times the value appears in the list.",
      "print(tentativas.count('5.5.5.5'))"
    ],
    "successStory": "Frequency confirmed: 3 attempts in mere seconds. Brute force alert triggered."
  },
  "li-17": {
    "title": "Buffer Fusion",
    "description": "Use extend() to append all elements from 'novos_alvos' to the end of 'alvos' and print 'alvos'.",
    "narrative": "Two parallel recon sweeps returned distinct target lists. Merge them into a single master buffer prior to the coordinated strike.",
    "concept": "extend() Method",
    "conceptExplanation": "extend() is the correct method for concatenating two lists into one while maintaining a flat structure. If you used append() with a list, it would become a nested item.\n\nAlternative: you can also use the '+' operator to create a new combined list (without mutating originals).",
    "hints": [
      "lista_a.extend(lista_b) adds ALL elements of lista_b to the end of lista_a.",
      "Caution: append(lista_b) would add the entire list as a SINGLE nested item. Use extend() to unpack."
    ],
    "successStory": "Buffers merged. Five targets primed for a parallel coordinated strike."
  },
  "li-18": {
    "title": "Reverse Decipher",
    "description": "Given the list 'codigo', reverse the order of its elements using slicing [::-1] and print the resulting list.",
    "narrative": "The transmission was intercepted in reverse order. Flip the buffer to reconstruct the payload's original sequence.",
    "concept": "Reverse Slicing",
    "conceptExplanation": "Slicing accepts three parameters: [start:end:step]. When step is -1, Python traverses the list from tail to head, producing a reversed copy.\n\nIt is one of Python's most elegant and idiomatic ways to reverse a sequence.",
    "hints": [
      "In slicing, the third parameter is the step. Using -1 reverses the sequence.",
      "lista[::-1] creates a new reversed list without mutating the original."
    ],
    "successStory": "Message decrypted. Original payload reconstructed byte by byte."
  },
  "li-19": {
    "title": "Batch Compiler",
    "description": "Use list comprehension to generate a new list 'dobrados' with each value from 'numeros' multiplied by 2, and print it.",
    "narrative": "Data packets must have their header value doubled to bypass the updated validation filter. Compress the entire transformation into a single expression.",
    "concept": "List Comprehension",
    "conceptExplanation": "List comprehension is a concise and powerful way to build lists from other iterables in a single line.\n\nSyntax: [expression for item in lista if condition]\n\nThis replaces an entire for loop with append() — faster, cleaner, and idiomatic in Python.",
    "hints": [
      "Syntax: [expression for item in lista]",
      "dobrados = [n * 2 for n in numeros]"
    ],
    "successStory": "Batch transformation complete. All packets cleared validation simultaneously."
  },
  "li-20": {
    "title": "Threat Ranking",
    "description": "Use sorted() with reverse=True to create 'ranking' containing the values of 'ameacas' in descending order, and print it.",
    "narrative": "Threat intelligence evaluated every attacking IP with a threat score. Rank them from most dangerous to least dangerous to prioritize countermeasures.",
    "concept": "sorted() Function with reverse",
    "conceptExplanation": "Unlike the sort() method — which modifies the list in-place —, the sorted() function returns a brand new sorted list while preserving the original.\n\nThe reverse=True parameter performs descending order. You can also pass key=function to sort by custom criteria.",
    "hints": [
      "sorted() returns a NEW sorted list (does not mutate the original like sort()).",
      "ranking = sorted(ameacas, reverse=True)"
    ],
    "successStory": "Threat ranking established. Countermeasures will neutralize the 92-score IP first."
  },
  "li-21": {
    "title": "Path Assembly",
    "description": "Given the list 'partes' containing path fragments, use .join() with the '/' separator to construct a single string. Print the result.",
    "narrative": "The path fragments are scattered. Stitch them together with separators to reconstruct the complete address of the target file.",
    "concept": "join() Method",
    "conceptExplanation": "str.join(iterable) is the idiomatic way to concatenate a list of strings into a single string with a delimiter. Note that the method belongs to the separator string, not the list. It works only on collections of strings — convert numbers via map(str, list) first if needed.",
    "hints": [
      "Syntax: separator.join(lista) — the method belongs to the string, not the list.",
      "print('/'.join(partes))"
    ],
    "successStory": "Path reconstructed. The full address is ready for direct access."
  },
  "li-22": {
    "title": "Header Fragmentation",
    "description": "Given the string 'csv' with comma-separated values, use .split(',') to break it into a list of tokens. Assign to 'tokens' and print.",
    "narrative": "A CSV header reached the buffer as a single line. Fragment it into individual tokens for field-by-field processing.",
    "concept": "split() Method",
    "conceptExplanation": "str.split(separator) is the inverse of join(): it breaks a string into a list of chunks. Without arguments, it splits on whitespace. It accepts a 'maxsplit' parameter to limit divisions. An essential tool for text parsing.",
    "hints": [
      "string.split(separator) returns a list with the pieces.",
      "tokens = csv.split(',')"
    ],
    "successStory": "Header fragmented into 4 fields. The parser can now process each column individually."
  },
  "li-23": {
    "title": "Compact Filter (Comprehension with if)",
    "description": "Given the list 'numeros', use list comprehension with 'if' to create 'pares' containing ONLY even numbers. Print the list.",
    "narrative": "The system only processes packets with even identifiers. Filter the batch in a single expression, dropping odds immediately.",
    "concept": "Filtered List Comprehension",
    "conceptExplanation": "Adding 'if condition' at the end of a list comprehension filters which items enter the resulting list. It replaces a for loop + if + append in a single line. For more complex filtering, consider filter() or dedicated functions.",
    "hints": [
      "Syntax: [expression for item in lista if condition]",
      "pares = [n for n in numeros if n % 2 == 0]"
    ],
    "successStory": "Filter applied. Only even packets moved down the pipeline."
  },
  "li-24": {
    "title": "Total Purge (clear)",
    "description": "Use the .clear() method to empty the list 'cache' completely, then print the list (should display []).",
    "narrative": "The cache contains sensitive payloads. Flush it completely before the audit system synchronizes with backup storage.",
    "concept": "clear() Method",
    "conceptExplanation": "clear() empties the list while keeping the original object intact (same memory address). Unlike 'cache = []', which assigns a NEW list — crucial when other references or structures point to the same object.",
    "hints": [
      "lista.clear() removes ALL items without destroying the variable reference.",
      "cache.clear()\nprint(cache)"
    ],
    "successStory": "Cache fully expunged. The audit will encounter nothing but a clean buffer."
  },
  "li-25": {
    "title": "Independent Backup (copy)",
    "description": "Use .copy() to create 'backup' as a shallow copy of 'original'. Then execute backup.append('NOVO'). Print 'original' (it must remain unchanged).",
    "narrative": "You need to test mutations without corrupting the core dataset. Create an isolated clone before executing destructive modifications.",
    "concept": "Copy vs. Reference",
    "conceptExplanation": "In Python, 'b = a' makes b point to the EXACT SAME list as a — mutations in one affect the other. Use .copy() (or list(a), or a[:]) to create an independent copy. Note: this is a shallow copy — nested collections remain shared. For deep copies, use copy.deepcopy().",
    "hints": [
      "Without copy(), 'backup = original' would only create an alias — changes would affect both!",
      "backup = original.copy()\nbackup.append('NOVO')\nprint(original)"
    ],
    "successStory": "Backup isolated. Experimental mutations did not contaminate the primary dataset."
  },
  "li-26": {
    "title": "Buffer Concatenation (+)",
    "description": "Given 'header' and 'payload', use the '+' operator to create a NEW list 'pacote' combining both. Print 'pacote' (originals MUST NOT be modified).",
    "narrative": "Merge the protocol header with the data payload without altering either original buffer — they remain needed for retransmissions.",
    "concept": "Concatenation with +",
    "conceptExplanation": "Unlike extend() (which mutates the original list), the '+' operator returns a BRAND NEW combined list. Use '+' when you want to preserve originals; use extend() when growing in-place. There is also '+=' (which acts like extend()).",
    "hints": [
      "The '+' operator on lists creates a NEW concatenated list (leaving originals untouched).",
      "pacote = header + payload\nprint(pacote)"
    ],
    "successStory": "Packet assembled while preserving original buffers. Ready for transmission."
  },
  "li-27": {
    "title": "Pattern Replication (*)",
    "description": "Create a list 'padrao' containing the number 0 repeated 5 times using the '*' operator. Print it.",
    "narrative": "Initialize a buffer of 5 zeroed slots to receive incoming telemetry. Multiply the list to avoid manual repetition.",
    "concept": "* Operator on Lists",
    "conceptExplanation": "[item] * n creates a new list with the item repeated n times. Useful for initializing buffers, zero-vectors, and repeating patterns. Beware with nested mutable objects: [[]] * 3 creates 3 references pointing to the EXACT SAME inner list.",
    "hints": [
      "[item] * n creates a list with the item repeated n times.",
      "padrao = [0] * 5\nprint(padrao)"
    ],
    "successStory": "5-slot zeroed buffer initialized. Ready for telemetry ingestion."
  },
  "li-28": {
    "title": "Coordinate Unpacking",
    "description": "Given the list 'coord' with 3 elements, unpack them into three variables 'x', 'y', and 'z' in a single assignment. Print x, y, and z (each on its own line).",
    "narrative": "Coordinates arrive formatted as a list. Assign each axis to an independent variable in a single atomic operation.",
    "concept": "Sequence Unpacking",
    "conceptExplanation": "Python allows unpacking collections into individual variables at once. The number of variables on the left must match the length of the collection exactly — otherwise ValueError is raised. Works with lists, tuples, and any iterable.",
    "hints": [
      "Multiple assignment: a, b, c = lista — works if variable count matches length.",
      "x, y, z = coord\nprint(x)\nprint(y)\nprint(z)"
    ],
    "successStory": "Coordinates extracted in parallel. All three axes ready for vector calculation."
  },
  "li-29": {
    "title": "Head and Tail (Starred Unpacking)",
    "description": "Given 'pacote', use starred unpacking with '*' to separate the first element into 'header' and the REST into 'corpo' (list). Print header (line 1) and corpo (line 2).",
    "narrative": "The first byte is the protocol header; the remainder is payload. Split them in a single expression using the star operator.",
    "concept": "Starred Unpacking",
    "conceptExplanation": "The * operator in unpacking captures a variable number of elements into a list. It can appear anywhere: 'a, *middle, b = lista' captures first, last, and middle into a list. A powerful idiom for data parsing.",
    "hints": [
      "Syntax: a, *rest = lista (a becomes first item, rest becomes list of remaining items).",
      "header, *corpo = pacote\nprint(header)\nprint(corpo)"
    ],
    "successStory": "Header isolated in one operation. Payload primed for block decryption."
  },
  "li-30": {
    "title": "Sorting by Length (key)",
    "description": "Given 'nomes' with strings of varying lengths, use sorted() with key=len to sort from SHORTEST to longest. Print the list.",
    "narrative": "The system renders identifiers sorted by length to optimize display queue throughput. Implement sorting using custom criteria.",
    "concept": "sorted() with key",
    "conceptExplanation": "The key= parameter accepts any callable taking an item and returning a comparison value. It can be len (length), str.lower (case-insensitive), a lambda (key=lambda x: x[1]), or a method. Enables sorting by ANY criterion beyond raw values.",
    "hints": [
      "The key= parameter accepts a function that computes the sort key for each item.",
      "print(sorted(nomes, key=len))"
    ],
    "successStory": "Queue optimized by length. Render pipeline now follows the optimal display sequence."
  },
  "py-loop-01": {
    introStory: "Something is sweeping the network in cycles, hunting for intruders. To slip past it, you need to think like it: in loops. Repeat, without mistakes, thousands of times.",
    "title": "Sequence Sweep",
    "description": "Use a for loop and the range() function to print numbers from 0 to 4.",
    "narrative": "The network scanner needs to sweep five consecutive ports. Automate the scan using a 'for' loop so you don't have to trigger each probe manually.",
    "concept": "'for' Loop",
    "conceptExplanation": "The 'for' loop allows you to execute the same code block repeatedly. It is like issuing an automated order to the computer: 'For each item in this collection, do this'.\n\nExample:\nfor i in range(3):\n    print('Repeating...')\n\nThis displays the phrase 3 times.",
    "hints": [
      "The range(5) function creates a sequence from 0 up to 4.",
      "The print(i) statement must be indented inside the for loop.",
      "for i in range(5):\n    print(i)"
    ],
    "successStory": "Sweep complete. The processing loop stabilized the sector's ingress ports."
  },
  "py-loop-02": {
    "title": "Security Countdown",
    "description": "Use a for loop and range() to print a countdown from 5 down to 1.",
    "narrative": "The self-destruct protocol triggered prematurely. Synchronize the override timer by transmitting abort signals from 5 to 1 in descending order.",
    "concept": "Range with Negative Step",
    "conceptExplanation": "The `range()` function is remarkably flexible. If you supply three arguments, the last is the 'step'. Using -1 makes Python count backward!",
    "hints": [
      "The range(5, 0, -1) function starts at 5, stops before 0 (exclusive), and decrements by 1 each step.",
      "for i in range(5, 0, -1):"
    ],
    "successStory": "Timer synchronized. Self-destruct protocol successfully aborted."
  },
  "py-loop-03": {
    "title": "Data Accumulator",
    "description": "Given the list 'cargas', use a for loop to calculate the total sum of the values and print the result.",
    "narrative": "Multiple data packets arrived fragmented. Traverse all of them, summing their payloads to reconstruct the original file.",
    "concept": "Accumulators",
    "conceptExplanation": "A cornerstone pattern in programming is the 'accumulator'. You initialize a variable before the loop and increment it on each iteration.",
    "hints": [
      "Create a total variable starting at 0 and add each load to it inside the loop.",
      "for c in cargas:\n    total = total + c"
    ],
    "successStory": "Sum calculated. The 100-byte file was reassembled and is ready for analysis."
  },
  "py-loop-04": {
    "title": "Maintenance 'while' Loop",
    "description": "Use a while loop to print the value of 'tentativas' while it is greater than 0. Decrement by 1 on each iteration.",
    "narrative": "The brute-force rig is cracking cipher keys. Run the attempt loop until remaining attempts are exhausted.",
    "concept": "Conditional 'while' Loop",
    "conceptExplanation": "`while` is utilized when you don't know the exact iteration count in advance, but know the condition that must remain true for execution to continue.",
    "hints": [
      "The while loop keeps repeating as long as the condition holds true.",
      "Don't forget to decrement the counter: tentativas = tentativas - 1",
      "while tentativas > 0:\n    print(tentativas)\n    tentativas -= 1"
    ],
    "successStory": "Cipher cracked on the final cycle. Sector access sustained."
  },
  "py-loop-05": {
    "title": "Intruder Scanner",
    "description": "Iterate through the list 'ips' and print each one. If you encounter '192.168.1.100', print 'ALERTA' and terminate the loop with break.",
    "narrative": "A rogue IP address was flagged on the network. Sweep active connections and halt the cycle immediately once the intruder is located.",
    "concept": "Loop Interruption (break)",
    "conceptExplanation": "`break` acts like an emergency brake. It terminates a loop instantly, even if remaining iterations were scheduled.",
    "hints": [
      "Use if inside the for loop to check the IP.",
      "The break statement terminates the loop immediately."
    ],
    "successStory": "Intruder located and quarantined. Scanner aborted to conserve defense resources."
  },
  "py-loop-06": {
    "title": "Empty Packet Filter",
    "description": "Iterate through the list 'dados'. If the value is 0, use continue to skip it. Otherwise, print the value.",
    "narrative": "The stream is clogged with empty packets (noise). Optimize processing by bypassing all zero values to process only actionable payloads.",
    "concept": "Skipping Iterations (continue)",
    "conceptExplanation": "`continue` tells the loop: 'Skip the rest of this pass and jump straight to the next one'. It is great for discarding invalid or irrelevant records.",
    "hints": [
      "The continue statement jumps to the next cycle without running the statements beneath it.",
      "if valor == 0:\n    continue"
    ],
    "successStory": "Noise filtered. Only actionable data processed, saving 40% of network throughput."
  },
  "py-loop-07": {
    "title": "Direct Collection Iteration",
    "description": "Given the list 'usuarios', use a for loop to print each name (one per line) without using range().",
    "narrative": "The audit system must log every active operator. Iterate directly over the collection without worrying about numerical indices.",
    "concept": "Direct Iteration",
    "conceptExplanation": "Python's for loop accepts any iterable: lists, strings, ranges, dictionaries... You don't need indices in most scenarios.\n\nThis makes code cleaner and more expressive. Reserve range() for when numeric indexing is truly required.",
    "hints": [
      "You can write 'for nome in usuarios:' directly.",
      "for u in usuarios:\n    print(u)"
    ],
    "successStory": "Audit recorded. Every operator cataloged into the master log."
  },
  "py-loop-08": {
    "title": "Synchronized Indexer",
    "description": "Use enumerate() to print 'indice: valor' for each item in the list 'modulos'. Example: '0: AUTH'.",
    "narrative": "The module loader requires a status dump pairing the index and label of each component. Synchronize index and value in a single loop traversal.",
    "concept": "enumerate() Function",
    "conceptExplanation": "When you need BOTH index and value during iteration, use enumerate(). It wraps the collection and yields (index, item) pairs on each pass.\n\nThis is Python's idiomatic approach to indexed loops — avoid the 'for i in range(len(lista))' anti-pattern.",
    "hints": [
      "for i, valor in enumerate(lista): yields both index and value simultaneously.",
      "Use an f-string to format: f'{i}: {valor}'"
    ],
    "successStory": "Report rendered. The loader verified the exact slot of every system component."
  },
  "py-loop-09": {
    "title": "Matrix Sweep",
    "description": "Given the matrix 'grid' (list of lists), use nested loops to print each number (one per line).",
    "narrative": "The scanner needs to traverse every node of a 2x2 security grid. Nest one loop within another to cover all rows and columns with zero blind spots.",
    "concept": "Nested Loops",
    "conceptExplanation": "You can place one for loop inside another. The inner loop executes completely during each iteration of the outer loop.\n\nThis is the natural method to sweep 2D structures (matrices, grids, arrays). Note: each nesting level compounds execution time.",
    "hints": [
      "The outer for loop traverses the rows (sublists). The inner for loop visits each value in the row.",
      "for linha in grid:\n    for valor in linha:\n        print(valor)"
    ],
    "successStory": "Grid exhaustively scanned. Not a single matrix node escaped detection."
  },
  "py-loop-10": {
    "title": "Surveillance Loop",
    "description": "Use 'while True' with break. On each cycle, print 'energia' and decrement it by 25. When 'energia' is less than 25, terminate the loop with break.",
    "narrative": "The surveillance drone operates in an infinite cycle until battery reserves reach critical status. Implement an infinite loop with exit controlled by an internal condition.",
    "concept": "Controlled Infinite Loop",
    "conceptExplanation": "Sometimes the exit condition cannot be evaluated upfront — it might hinge on an event, external socket, or internal calculation.\n\n'while True' creates an indefinite cycle that terminates only upon reaching a break. A standard architectural pattern across daemons, network listeners, and games.",
    "hints": [
      "while True: creates an infinite loop. break provides the exit latch.",
      "Print first, then decrement, then test the break condition.",
      "while True:\n    print(energia)\n    energia -= 25\n    if energia < 25:\n        break"
    ],
    "successStory": "Battery critical. Surveillance node entered deep sleep, safeguarding captured telemetry."
  },
  "py-loop-11": {
    "title": "Character Dissector",
    "description": "Iterate over each character of the string 'token' and print it (one per line).",
    "narrative": "An encrypted auth token arrived in the buffer. Dissect each character individually prior to executing a dictionary attack.",
    "concept": "String Iteration",
    "conceptExplanation": "In Python, strings behave like sequences of characters. You can traverse them using a for loop, slice them, call len(), and query them with 'in' — just like lists.\n\nThis unifies operations across text and data structures.",
    "hints": [
      "Strings are iterable in Python. You can write 'for char in string:' directly.",
      "for c in token:\n    print(c)"
    ],
    "successStory": "Token dissected character by character. Dictionary attack initiated."
  },
  "py-loop-12": {
    "title": "Selective Cataloger",
    "description": "Given the list 'valores', use a for loop combined with if to count how many numbers are even. Print the final count.",
    "narrative": "The packet collector must flag only packets bearing even identifiers. Tally how many clear the filter during the complete sweep.",
    "concept": "Conditional Counting",
    "conceptExplanation": "Combining a loop + conditional + accumulator is one of programming's primary idioms. You traverse data, test each element, and increment a counter based on the outcome.\n\nIt forms the backbone of data filtering, search, sanity checks, and reporting.",
    "hints": [
      "Use 'if v % 2 == 0:' inside the loop to identify even numbers.",
      "Add 1 to the counter for each even number discovered."
    ],
    "successStory": "Four even packets confirmed. Collector catalog updated."
  },
  "py-loop-13": {
    "title": "Stream Synchronizer",
    "description": "Use zip() to iterate over the lists 'ips' and 'portas' in parallel, printing 'ip:porta' on each line.",
    "narrative": "Two parallel data feeds arrived: target IPs and corresponding port numbers. Pair them in lockstep to build complete network socket endpoints.",
    "concept": "zip() Function",
    "conceptExplanation": "zip() accepts two (or more) iterables and yields synchronized pairs (tuples) — the first item of each, then the second, and so on.\n\nIf collections differ in length, zip() terminates at the shortest. It is the standard utility for parallel iteration without index tracking.",
    "hints": [
      "for ip, p in zip(ips, portas): provides a pair on each iteration.",
      "Use an f-string: f'{ip}:{p}'"
    ],
    "successStory": "Streams locked in sync. Full socket endpoints assembled without frame drops."
  },
  "py-loop-14": {
    "title": "One-Line Compiler",
    "description": "Use list comprehension to create 'quadrados' containing the square (n*n) of each number in the list 'numeros'. Print the resulting list.",
    "narrative": "High-throughput processing requires squaring every numerical sample. Condense the entire operation into a single, high-performance line of code.",
    "concept": "Advanced List Comprehension",
    "conceptExplanation": "List comprehension is Python's most idiomatic syntax for building lists from iterables. Under the hood it runs a loop, condensed into an atomic expression.\n\nFull syntax: [expression for item in iterable if condition]\n\nIt outpaces traditional for + append() loops and represents Pythonic design at its finest.",
    "hints": [
      "Syntax: [expression for item in iterable]",
      "quadrados = [n ** 2 for n in numeros]"
    ],
    "successStory": "Mass compilation achieved in a single cycle. The Iteration Sector acknowledges your mastery over CPU clock cycles."
  },
  "py-loop-15": {
    "title": "Bounded Range",
    "description": "Use range(2, 7) in a for loop to print numbers from 2 up to 6 (each on its own line).",
    "narrative": "The port scan must begin at port 2 and halt before reaching port 7. Calibrate the range with the exact bounds.",
    "concept": "range(start, stop)",
    "conceptExplanation": "range() accepts 1, 2, or 3 arguments. With 2: range(start, stop) generates values from 'start' to 'stop - 1'. The stop bound is always exclusive (analogous to slicing). Use this for custom intervals without manual index offsets.",
    "hints": [
      "range(start, stop) includes the start but EXCLUDES the stop.",
      "for i in range(2, 7):\n    print(i)"
    ],
    "successStory": "Port range scanned. The 5 intermediate ingress points have been logged."
  },
  "py-loop-16": {
    "title": "Custom Stride",
    "description": "Use range(0, 21, 5) to print multiples of 5 between 0 and 20 (inclusive).",
    "narrative": "Memory registers are aligned on 5-byte boundaries. Configure iterator stride to jump directly from one valid block to the next.",
    "concept": "range with Step",
    "conceptExplanation": "The third argument to range() is 'step' — the delta advanced each iteration. Default = 1. Use larger steps to traverse sparse strides; negative steps for reverse countdowns.",
    "hints": [
      "Syntax: range(start, stop, step)",
      "for i in range(0, 21, 5):\n    print(i)"
    ],
    "successStory": "Aligned blocks swept. Every base address was audited without burning surplus cycles."
  },
  "py-loop-17": {
    "title": "Stream Reversal",
    "description": "Given the list 'pilha', use reversed() in a for loop to print each item in reverse order (each on its own line).",
    "narrative": "The event stack arrived chronologically; process it from newest to oldest to triage the most recent incident first.",
    "concept": "reversed() Function",
    "conceptExplanation": "reversed() yields an iterator traversing the collection in reverse. More memory-efficient than lista[::-1] (which copies the entire structure). Consume directly inside a for loop or materialize via list(reversed(...)) when needed.",
    "hints": [
      "reversed(iterable) returns an iterator in reverse order without constructing a new list.",
      "for ev in reversed(pilha):\n    print(ev)"
    ],
    "successStory": "Events processed in reverse order. Incident triage resolved the latest intrusion first."
  },
  "py-loop-18": {
    "title": "The for-else Construct",
    "description": "Iterate over 'tentativas'. If any item equals 'SUCESSO', print 'achei' and break. If the loop completes WITHOUT breaking, the else block must print 'fracasso'. Expected output: fracasso.",
    "narrative": "After verifying every attempt without discovering a success flag, the system must log overall failure. Utilize for-else syntax to handle this terminal logic.",
    "concept": "for/else",
    "conceptExplanation": "Lesser-known feature: Python's for loop accepts an 'else' clause that triggers ONLY IF the loop finished naturally without hitting break. Perfect for search routines: 'found target? break. Completed without break? trigger else'.",
    "hints": [
      "The loop's else block only fires if the loop terminates NATURALLY without hitting break.",
      "for t in tentativas:\n    if t == 'SUCESSO':\n        print('achei')\n        break\nelse:\n    print('fracasso')"
    ],
    "successStory": "Scan completed with zero hits. System logged the failure for administrative escalation."
  },
  "py-loop-19": {
    "title": "while-else Execution",
    "description": "Initialize n=0. Use 'while n < 3: print(n) and n+=1'. Add else: print('feito'). Expected output: 0 / 1 / 2 / feito.",
    "narrative": "Once the retransmission loop completes without interruption, mark the protocol completed using the else clause.",
    "concept": "while/else",
    "conceptExplanation": "while loops also support an else block. It executes when the condition evaluates to False naturally without encountering a break. Ideal for retry schemes: if attempts expire, trigger else to log a timeout.",
    "hints": [
      "Just like for/else: the while-else block executes only if the loop terminates via its condition, not a break.",
      "n = 0\nwhile n < 3:\n    print(n)\n    n += 1\nelse:\n    print('feito')"
    ],
    "successStory": "Protocol completed without interruption. The system recorded a complete cycle in the audit log."
  },
  "py-loop-20": {
    "title": "Dictionary Key Sweep",
    "description": "Given 'sistema', use 'for chave in sistema:' to print each key (one per line).",
    "narrative": "The configuration system stores data in key-value pairs. Output the available field names for rapid inventory indexing.",
    "concept": "Dictionary Iteration",
    "conceptExplanation": "By default, iterating over a dict with 'for x in d' loops over KEYS. It is equivalent to 'for x in d.keys()'. To iterate values: 'for v in d.values()'. For both: 'for k, v in d.items()'.",
    "hints": [
      "Iterating directly over a dict iterates over its keys.",
      "for chave in sistema:\n    print(chave)"
    ],
    "successStory": "Field catalog generated. System architecture mapped."
  },
  "py-loop-21": {
    "title": "Synchronized Iteration with .items()",
    "description": "Given 'config', use .items() to iterate and print 'chave=valor' (exact format) for each pair.",
    "narrative": "Each configuration parameter must be exported in 'chave=valor' format to compile the server's .env file.",
    "concept": "Iteration with items()",
    "conceptExplanation": "dict.items() returns a view of (key, value) tuples — the idiomatic pattern for concurrent access. It is internally faster than querying d[k] inside every loop turn.",
    "hints": [
      ".items() yields (key, value) pairs — unpack them into two loop variables.",
      "for k, v in config.items():\n    print(f'{k}={v}')"
    ],
    "successStory": ".env configuration file generated. Parameters primed for deployment."
  },
  "py-loop-22": {
    "title": "Filtered List Comprehension",
    "description": "Given 'valores', use list comprehension with if to create 'pares' containing only multiples of 2. Print the list.",
    "narrative": "Compress an even-number filter into a single expression. The processing pipeline demands optimal code density.",
    "concept": "Comprehension with if",
    "conceptExplanation": "The trailing 'if' filters incoming items. It marries filtering and mapping in a single line. It is faster than manual loop + append, and the standard pattern across Python codebases.",
    "hints": [
      "Syntax: [expr for item in iter if condition]",
      "pares = [v for v in valores if v % 2 == 0]"
    ],
    "successStory": "Dense filter applied. Only even elements traversed the pipeline."
  },
  "py-loop-23": {
    "title": "Generator Expression in sum()",
    "description": "Given 'numeros', use a generator expression INSIDE sum() to sum ONLY numbers greater than 10. Print the result.",
    "narrative": "Calculate total bandwidth consumption ignoring heartbeat packets (which are small keep-alive pings). Use a generator expression to avoid allocating an intermediary list.",
    "concept": "Generator Expression",
    "conceptExplanation": "A generator expression resembles list comprehension but uses parentheses: '(expr for x in it)'. It does not build an in-memory list — it yields items lazily on demand. Inside aggregators like sum(), max(), any(), all(), it eliminates memory overhead.",
    "hints": [
      "Generator expressions use parentheses (rather than brackets) — zero buffer overhead.",
      "print(sum(n for n in numeros if n > 10))"
    ],
    "successStory": "Streaming reduction completed. Zero RAM wasted on transient lists."
  },
  "py-loop-24": {
    "title": "Accumulated Product (Factorial)",
    "description": "Calculate the factorial of 6 (6 * 5 * 4 * 3 * 2 * 1) using a for loop. Accumulate inside 'resultado' initialized to 1. Print the final result.",
    "narrative": "The encryption routine requires a factorial cryptographic seed. Use accumulated multiplication to compute the constant.",
    "concept": "Multiplicative Accumulator",
    "conceptExplanation": "Accumulators are not limited to addition. For multiplication: initialize with 1 (the identity element) and apply *=. For string concatenation: initialize with ''. The pattern remains identical — adjust the seed value and operator.",
    "hints": [
      "Initialize resultado=1 (not 0, otherwise multiplication zeros everything).",
      "for i in range(1, 7):\n    resultado *= i"
    ],
    "successStory": "Factorial key 720 generated. Cryptographic engine primed for handshake."
  },
  "py-loop-25": {
    "title": "Fibonacci Sequence",
    "description": "Use while to generate the first 7 terms of the Fibonacci sequence (0, 1, 1, 2, 3, 5, 8). Print each on its own line.",
    "narrative": "Fibonacci progressions mimic natural network traffic patterns. Synthesize the sequence to feed the honeytoken decoy generator.",
    "concept": "Classic Iterative Algorithm",
    "conceptExplanation": "Fibonacci is the canonical stateful iteration: each term relies on its two predecessors. Multiple assignment 'a, b = b, a + b' updates both variables concurrently without temp buffers — a hallmark of Python elegance.",
    "hints": [
      "Use multiple assignment 'a, b = b, a + b' to update both without temporary variables.",
      "a, b = 0, 1\ncount = 0\nwhile count < 7:\n    print(a)\n    a, b = b, a + b\n    count += 1"
    ],
    "successStory": "Fractal sequence fed to decoy generator. Honeytokens will exhibit organic traffic signatures."
  },
  "py-loop-26": {
    "title": "Search with Flag",
    "description": "Given 'alvos' and 'procurado=\"BACKDOOR\"', use a for loop with a flag 'encontrado=False'. When found, set flag to True. After the loop, print 'achei' if flag is True, else 'nao_achei'. Expected output: achei.",
    "narrative": "Use a flag-based tracking approach to record whether the target was discovered during the sweep — useful when processing must persist past the initial match.",
    "concept": "Flag Pattern",
    "conceptExplanation": "The 'flag pattern' employs a boolean sentinel to record whether an event transpired during iteration. An alternative to for/else, especially useful when work continues after detection rather than terminating.",
    "hints": [
      "Create 'encontrado = False'. Inside the for loop, if matched, set 'encontrado = True'.",
      "After the for loop, use if encontrado: print('achei') else: print('nao_achei')."
    ],
    "successStory": "Backdoor spotted and logged. Scanner maintained inspection across subsequent blocks."
  },
  "py-loop-27": {
    "title": "Dict Comprehension",
    "description": "Use dict comprehension to create 'tabela' with each number from range(1, 4) as key and its cube as value. Print the table.",
    "narrative": "Synthesize a precomputed lookup table for the cryptography module in a single expression.",
    "concept": "Dict Comprehension",
    "conceptExplanation": "Shares the foundation of list comprehensions, but constructs dictionaries. Syntax '{key: value for ...}'. Perfect for generating lookup tables and key-value maps straight from iterables, optionally filtered via 'if'.",
    "hints": [
      "Syntax: {key: value for item in iter}",
      "tabela = {n: n**3 for n in range(1, 4)}\nprint(tabela)"
    ],
    "successStory": "Precalculated lookup table assembled. Runtime queries will resolve in O(1) time."
  },
  "py-loop-28": {
    "title": "Set Comprehension",
    "description": "Given the list 'logs', use set comprehension to create 'unicos' containing only distinct values. Print the size of the set (len).",
    "narrative": "Audit how many unique IP addresses hit the infrastructure. Employ set comprehension to deduplicate in a single pass.",
    "concept": "Set Comprehension",
    "conceptExplanation": "Syntax: '{expr for item in iter}' (without ':', distinct from dict comprehension). Constructs a set — automatically pruning duplicate entries. Same expressive power as list/dict comprehensions with mathematical set semantics.",
    "hints": [
      "Set comprehension uses curly braces {} without a ':' — expression only.",
      "unicos = {x for x in logs}\nprint(len(unicos))"
    ],
    "successStory": "Unique adversaries tallied: 4. Incident response will isolate the discrete IPs."
  },
  "py-loop-29": {
    "title": "Reverse Range Iteration",
    "description": "Use range to iterate from 10 down to 1 (inclusive), stepping down by 2. Print each value. Expected output: 10, 8, 6, 4, 2.",
    "narrative": "The shutdown sequencer decrements in strides of 2 to align with the core system clock cycle.",
    "concept": "Reverse Range with Step",
    "conceptExplanation": "Combining all three range() parameters with a negative step produces custom decreasing progressions. Keep in mind the stop bound remains exclusive — calibrate it to capture the terminal value.",
    "hints": [
      "To stop at 2 inclusive: step towards 0 (exclusive) using step -2.",
      "for i in range(10, 0, -2):\n    print(i)"
    ],
    "successStory": "Countdown locked to cycle. Safe shutdown executed on the designated clock tick."
  },
  "py-loop-30": {
    "title": "Cycle Master: Transposed Matrix",
    "description": "Given 'matriz = [[1,2,3],[4,5,6]]' (2 rows, 3 columns), use nested list comprehension to create 'transposta' (3 rows, 2 columns). Print 'transposta'.",
    "narrative": "Computer vision heuristics require rotating the spatial matrix. Construct the transposition in a single dense expression.",
    "concept": "Nested Comprehension",
    "conceptExplanation": "List comprehensions can be nested inside one another, generating multi-dimensional arrays in one pass. Evaluation reads outside-in: the outermost for governs the outer structure while the inner loop builds each row. Use judiciously — nesting can reduce readability.",
    "hints": [
      "You need two 'for' clauses — outer: iterate over column indices; inner: pull elements from each row.",
      "transposta = [[linha[i] for linha in matriz] for i in range(len(matriz[0]))]"
    ],
    "successStory": "Transposed matrix generated in a single expression. The Iteration Sector registers you as Cycle Master."
  }
};
