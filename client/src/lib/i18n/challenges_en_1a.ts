import type { LocalizedChallengeFields } from './worlds_en';

export const CHALLENGES_EN_1A: Record<string, LocalizedChallengeFields> = {
  "py-01": {
    "title": "Reconnaissance Ping",
    "description": "Use print() to send the string 'Ola, Python!' to the terminal.",
    "narrative": "To establish a handshake with the Core, you must broadcast a recognition signal. The print() command projects your digital signature onto the system log.",
    "concept": "Output Command (print)",
    "conceptExplanation": "Think of print() as a megaphone or a projection screen. Whatever you place inside the parentheses of print() will be displayed on the screen (the Console) for you or other operators to read.\n\nFor example:\nprint('Acesso Liberado!')\n\nWill cause that phrase to appear on the terminal screen.",
    "hints": [
        "The print() statement displays data on the standard terminal output.",
        "Strings (text) must be enclosed in single or double quotes.",
        "Try: print('Ola, Python!')"
    ],
    "introStory": "Connection established, Operator. The city's Mainframe is unstable and the central Core has been quarantined by the defense grid. Your first destination is Terminal Alpha. There, you will learn to allocate memory and execute your first intrusion scripts.",
    "successStory": "Ping received. The gateway has registered your presence on the network. Local terminal access granted."
},
  "py-02": {
    "title": "Memory Allocation",
    "description": "Declare a variable named nome with the value 'Python' and print it to the console.",
    "narrative": "A hacker doesn't just manipulate raw data, but named addresses in RAM. Store the system identifier in a variable and read its content.",
    "concept": "Data Addressing (Variables)",
    "conceptExplanation": "Think of a variable as a labeled 'box' where you store information for later use. To create one, simply name the label and use the '=' sign to store the value inside.\n\nFor example:\nidade = 25\n\nThis creates a box named 'idade' holding the number 25. Later, you can reference that name in your code and the computer will remember what's inside!",
    "hints": [
        "Variables are memory allocations: nome = valor.",
        "To display the data, pass the variable name to print() without quotes.",
        "nome = 'Python'\nprint(nome)"
    ],
    "successStory": "Memory block allocated successfully. The system now recognizes the identifier 'Python' in your local scope."
},
  "py-03": {
    "title": "Thread Synchronization",
    "description": "The variable a has the value 5, and b has the value 10. Print the sum of these two values.",
    "narrative": "Two encrypted processing packets have arrived at your thread. Sum their numeric payloads to generate the access key for the next Node.",
    "concept": "Arithmetic Processing (Operators)",
    "conceptExplanation": "You can use Python like a supercomputer calculator. The symbol '+' adds, '-' subtracts, '*' multiplies, and '/' divides. You can perform these operations directly with your variables!\n\nFor example, if:\na = 10\nb = 5\n\nThen writing print(a + b) will display 15 on the screen.",
    "hints": [
        "Use the + operator to add integer values.",
        "The result of the sum should be passed inside print().",
        "print(a + b)"
    ],
    "successStory": "Synchronization complete! The numeric key stabilized the connection. The Primary Node is online. You are ready to advance across the network."
},
  "py-04": {
    "title": "Protocol Fusion",
    "description": "Concatenate the variable 'base' with the variable 'versao' and print the result. The expected result is 'Python3'.",
    "narrative": "To upgrade your intrusion software, you must merge the software name with the version number into a single command string.",
    "concept": "String Concatenation",
    "conceptExplanation": "Concatenation is the technical term for 'gluing' one string to another. In Python, we use the + sign to join text, as if assembling a puzzle of data packets.\n\nExample:\nnome = 'Ciber' + 'Operador'\nprint(nome)  # Displays CiberOperador",
    "hints": [
        "You can join two strings using the + operator.",
        "Example: 'Cyber' + 'Punk' results in 'CyberPunk'.",
        "print(base + versao)"
    ],
    "successStory": "Fusion complete. The Python3 protocol has been loaded into your execution buffer."
},
  "py-05": {
    "title": "Payload Analysis",
    "description": "Discover the type of the variable 'carga' using the type() function and print the result.",
    "narrative": "Before processing an intercepted packet, you must identify whether it contains raw text (str) or numeric data (int). Run the system's type scanner.",
    "concept": "Data Types",
    "conceptExplanation": "Not all data is equal. Python distinguishes between whole numbers (int), text (str), floating-point decimals (float), and more. The type() function acts like an X-ray revealing the underlying nature of a variable.\n\nExample:\nprint(type(42))      # <class 'int'>\nprint(type('Oi'))    # <class 'str'>",
    "hints": [
        "The type(variavel) function returns the data type.",
        "Remember to wrap type() inside a print() call to see the output.",
        "print(type(carga))"
    ],
    "successStory": "Scanner finished. The data was identified as 'int'. The decoding system has been calibrated."
},
  "py-06": {
    "title": "Digital Handshake",
    "description": "Use the input() function to prompt for the user's name and print 'Ola, ' followed by the typed name.",
    "narrative": "To gain access to the system, you must authenticate yourself. Write a script that captures your operator handle and registers it in the welcome buffer.",
    "concept": "Data Input (input)",
    "conceptExplanation": "input() is the counterpart to print(). While print() 'speaks', input() 'listens'. It allows the user to enter information that your program can use to make decisions or process data.",
    "hints": [
        "The input('prompt') function pauses execution and waits for user input.",
        "Store the result of input() in a variable.",
        "nome = input('Nome: ')\nprint('Ola, ' + nome)"
    ],
    "successStory": "Identity confirmed. Welcome to the grid, Operator Neo."
},
  "py-07": {
    "title": "Identity Injection",
    "description": "Use an f-string to print the message: 'Operador: [nome], Nivel: [nivel]'.",
    "narrative": "Hackers use rapid templates to inject data payloads. f-strings are the modern, high-speed standard for formatting logs and system messages.",
    "concept": "String Formatting (f-strings)",
    "conceptExplanation": "f-strings (Formatted String Literals) make it seamless to construct text containing variables. Simply prefix the string with 'f' and enclose variables within {curly_braces}.",
    "hints": [
        "Prefix the string with f before the quotes: f'Text'.",
        "Place variables inside braces within the string: {variavel}.",
        "print(f'Operador: {nome}, Nivel: {nivel}')"
    ],
    "successStory": "Credentials formatted and injected into the central log. Display stream optimized."
},
  "py-08": {
    "title": "Numeric Decoder",
    "description": "The variable 'texto' contains '50'. Convert it to an integer, add 10, and print the result.",
    "narrative": "Intercepted data often arrives formatted as text, even when holding numbers. You must cast the data format to perform mathematical operations.",
    "concept": "Type Casting",
    "conceptExplanation": "Casting transforms data from one type to another. Python is strictly typed: you cannot add the text '10' to the number 5. You must first convert '10' into an actual integer using int().",
    "hints": [
        "Use int(variavel) to convert a string into an integer.",
        "You cannot add a string and a number without converting first.",
        "numero = int(texto)\nprint(numero + 10)"
    ],
    "successStory": "Conversion successful. The value can now be processed by the Arithmetic Logic Unit."
},
  "py-09": {
    "title": "The Remainder Operator",
    "description": "Calculate the remainder of dividing 17 by 3 using the '%' operator and print the result.",
    "narrative": "In cryptography, modulo division is fundamental for generating keys. Extract what 'remains' from this data packet.",
    "concept": "Modulo Operator (%)",
    "conceptExplanation": "The % operator does not calculate percentages! It divides two numbers and yields only the remainder. It is widely used to test parity (even/odd) or establish cyclical patterns.",
    "hints": [
        "The % operator returns the remainder of division.",
        "17 % 3 means: what remains after dividing 17 by 3?",
        "print(17 % 3)"
    ],
    "successStory": "Remainder isolated. This leftover 'bit' is critical for our upcoming bypass key."
},
  "py-10": {
    "title": "Cell Division",
    "description": "Perform an integer division of 25 by 4 using '//' and print the result.",
    "narrative": "When carving large packets into fixed memory slots, decimal fractions cause memory leaks. Use floor division to obtain the exact integer quotient.",
    "concept": "Floor Division (//)",
    "conceptExplanation": "Standard division (/) of 25 by 4 yields 6.25. Floor division (//) truncates the .25 and returns just 6. This is essential when you need whole-number results without floating-point overhead.",
    "hints": [
        "The // operator divides and truncates everything after the decimal point.",
        "Unlike /, // always yields a whole number without decimals.",
        "print(25 // 4)"
    ],
    "successStory": "Memory slots allocated. The remainder was discarded to preserve block alignment."
},
  "py-11": {
    "title": "Signal Amplification",
    "description": "Calculate 2 raised to the power of 10 using the '**' operator and print the result.",
    "narrative": "To shatter the firewall's defense grid, we need exponential power output. Boost the signal to the 10th power.",
    "concept": "Exponentiation (**)",
    "conceptExplanation": "In Python, to raise a number to a power, use double asterisks. 2 ** 3 is equivalent to 2 x 2 x 2.",
    "hints": [
        "The power operator in Python is **.",
        "base ** exponent.",
        "print(2 ** 10)"
    ],
    "successStory": "Signal amplified! 1024 terahertz struck the firewall. The barrier is flickering."
},
  "py-12": {
    "title": "Integrity Scan",
    "description": "Check if the variable 'senha' is equal to 'admin123' and print the result (True or False).",
    "narrative": "The final step for the bypass is a boolean verification. The system will accept only one truth value: True or False.",
    "concept": "Comparison Operators",
    "conceptExplanation": "Comparisons always evaluate to 'True' or 'False'. They form the bedrock of conditional execution. The primary operator is '==', asking: 'Is this identical to that?'",
    "hints": [
        "Use the equality operator == to compare two values.",
        "Do not confuse = (assignment) with == (comparison).",
        "print(senha == 'admin123')"
    ],
    "successStory": "Bypass complete! The firewall has fallen. You have full access to Terminal Alpha and may advance to the next sector."
},
  "py-13": {
    "title": "Port Swap",
    "description": "The variables 'p1' and 'p2' represent network ports. Swap the values of p1 and p2 in a single line and print: 'p1: [valor], p2: [valor]'.",
    "narrative": "To evade CorpHQ's packet sniffer, swiftly swap your ingress and egress ports in the connection buffer.",
    "concept": "Multiple Assignment",
    "conceptExplanation": "Python enables assigning multiple values to multiple variables simultaneously. This is ideal for swapping variables without needing a temporary third variable.",
    "hints": [
        "In Python, you can write: a, b = b, a.",
        "Use an f-string for the final print statement."
    ],
    "successStory": "Ports rotated. The tracker lost your trace."
},
  "py-14": {
    "title": "Payload Rounding",
    "description": "The variable 'fluxo' contains the value 3.14159. Print this value rounded to 2 decimal places using the round() function.",
    "narrative": "Precision telemetry sensors are flooding our buffer with excessive decimal places. Normalize the readout.",
    "concept": "round() Function",
    "conceptExplanation": "Extensive decimal places often clutter data streams. The round() function cleans up floating-point values into readable figures.",
    "hints": [
        "The round(number, decimals) function handles rounding."
    ],
    "successStory": "Data normalized. Telemetry stream is now clean and legible."
},
  "py-15": {
    "title": "Entropy Meter",
    "description": "Use the len() function to measure the length of the variable 'hash_key' and print the result.",
    "narrative": "Longer cryptographic keys have higher entropy. Verify the byte length of the intercepted hash.",
    "concept": "String Length (len)",
    "conceptExplanation": "The len() function (short for length) measures the size of collections and strings in Python.",
    "hints": [
        "len(text) returns the number of characters in a string."
    ],
    "successStory": "Length verified. It is a standard 32-character MD5 hash."
},
  "py-16": {
    "title": "System Shout",
    "description": "The variable 'comando' contains 'sudo su'. Print this command in all UPPERCASE using the .upper() method.",
    "narrative": "Legacy mainframe nodes only parse uppercase directives. Capitalize the string before transmission.",
    "concept": ".upper() Method",
    "conceptExplanation": "The .upper() method returns a copy of the string converted entirely to uppercase letters.",
    "hints": [
        "String methods are called with a dot after the variable: text.upper()."
    ],
    "successStory": "Signal broadcast on high-priority frequency."
},
  "py-17": {
    "title": "User Normalization",
    "description": "The variable 'login' contains 'AdMiN'. Print the login in all lowercase using .lower().",
    "narrative": "The authentication server is case-sensitive. Normalize the login credentials to lowercase to avoid authentication rejection.",
    "concept": ".lower() Method",
    "conceptExplanation": "The .lower() method is the inverse of .upper(). It converts all characters to lowercase, essential for normalizing input data.",
    "hints": [
        "Use login.lower()."
    ],
    "successStory": "Credential normalized. Database synchronization established."
},
  "py-18": {
    "title": "Dynamic Obfuscation",
    "description": "The variable 'ip' contains '10.0.0.1'. Use .replace('.', '[dot]') to obfuscate the IP and print the result.",
    "narrative": "When posting logs to darknet bulletin boards, hackers defang IP addresses to evade automated crawler detection. Replace dots with [dot].",
    "concept": ".replace() Method",
    "conceptExplanation": "Replaces all occurrences of a target substring with a replacement substring. Essential for rapid data sanitization.",
    "hints": [
        "The syntax is: text.replace('old', 'new')."
    ],
    "successStory": "IP obfuscated. Identity concealed in public logs."
},
  "py-19": {
    "title": "Buffer Purge",
    "description": "The variable 'dado' contains extra spaces: '   senha_secreta   '. Strip these spaces using .strip() and print the result.",
    "narrative": "User inputs frequently introduce invisible trailing whitespace. Clean both ends of the buffer before execution.",
    "concept": ".strip() Method",
    "conceptExplanation": "The .strip() method trims leading and trailing whitespace characters, tabs, and newlines from a string.",
    "hints": [
        "The .strip() method trims whitespace from the start and end of a string."
    ],
    "successStory": "Buffer purged. The string has been sanitized."
},
  "py-20": {
    "title": "Slicing: Magic Header",
    "description": "The variable 'arquivo' contains 'MZ_executavel.exe'. Print only the first 2 characters using slicing [start:end].",
    "narrative": "In malware triage, the 'MZ' magic bytes identify a Windows executable binary. Isolate the first two bytes of the signature.",
    "concept": "String Slicing",
    "conceptExplanation": "Strings can be sliced like lists. You specify start and end indices inside square brackets to slice the desired segment.",
    "hints": [
        "Use arquivo[0:2] or simply arquivo[:2]."
    ],
    "successStory": "MZ signature detected. Flagged as a potential binary payload."
},
  "py-21": {
    "title": "Slicing: Hidden Extension",
    "description": "The variable 'payload' contains 'imagem_fofa.jpg.exe'. Print only the last 4 characters to reveal the true file extension.",
    "narrative": "Adversaries rely on double extensions to deceive end-users. Use negative indexing to slice only the trailing extension.",
    "concept": "Negative Slicing",
    "conceptExplanation": "Using negative indices (-1, -2, etc.) instructs Python to count backwards from the end. payload[-4:] means 'slice from the 4th character from the end to the finish'.",
    "hints": [
        "Negative indices count backwards from the end. Use payload[-4:]."
    ],
    "successStory": "Deception exposed! That's no image—it's an executable."
},
  "py-22": {
    "title": "Frequency Analysis",
    "description": "The variable 'log' contains a sequence of system events. Print how many times the word 'ERROR' appears using .count().",
    "narrative": "A denial-of-service attack generates bursts of repeated errors. Tally the error occurrences in the event stream.",
    "concept": ".count() Method",
    "conceptExplanation": "A fast built-in method for statistical frequency analysis across strings and lists.",
    "hints": [
        "The method log.count('word') counts occurrences of that substring."
    ],
    "successStory": "Error spike detected. Intrusion alert triggered."
},
  "py-23": {
    "title": "Signature Search",
    "description": "The variable 'memoria' contains mixed system data. Find the numeric index where the word 'root' begins using .find().",
    "narrative": "To inject shellcode, we need the exact memory address offset where the admin signature is stored.",
    "concept": ".find() Method",
    "conceptExplanation": "Searches for a substring and returns its starting index. Returns -1 if the substring is not found.",
    "hints": [
        "memoria.find('root') returns the starting index of the word."
    ],
    "successStory": "Memory address located. Target pointer updated."
},
  "py-24": {
    "title": "Packet Splitting",
    "description": "The variable 'conexao' is '192.168.0.1:8080'. Use .split(':') to dissect it and store in two variables: 'ip' and 'porta'. Print the ip.",
    "narrative": "Network sockets bundle IP and Port separated by a colon ':'. Split these components to route your exploit to the correct port.",
    "concept": ".split() Method",
    "conceptExplanation": "The .split() method splits a string into chunks based on a delimiter (space, comma, colon) and returns a list or unpacks into multiple variables.",
    "hints": [
        "You can unpack: ip, porta = conexao.split(':')"
    ],
    "successStory": "Packet dissected successfully. Target IP extracted."
},
  "py-25": {
    "title": "Terminal Alpha Overload",
    "description": "input() receives a string containing '  1024  '. 1. Strip whitespace with .strip(). 2. Convert to integer. 3. Multiply by 2. 4. Print with an f-string: 'Carga Máxima: [resultado]'.",
    "narrative": "This is the ultimate trial of Terminal Alpha. Intercept the firewall's dirty payload, filter interference, double raw capacity, and feed it into the core.",
    "concept": "Method Chaining & Advanced Formatting",
    "conceptExplanation": "Here you combine string methods, user input, casting, and formatting into a concise, powerful pipeline.",
    "hints": [
        "You can chain methods: valor = int(input().strip())",
        "Then simply print f'Carga Máxima: {valor * 2}'"
    ],
    "successStory": "PARTIAL OVERLOAD SUCCESSFUL! The payload was accepted, but the firewall generated new sub-protocols. Keep moving!"
},
  "py-26": {
    "title": "Header Decipherer",
    "description": "The system receives a packet formatted as 'PKT-99-DATA'. Use slicing to extract the number '99', convert it to an integer, add 1, and print: 'Proximo Pacote: PKT-[resultado]'.",
    "narrative": "To maintain synchronization with the Core, you must predict the ID of the incoming packet. Extract the current ID and compute its successor.",
    "concept": "Data Extraction and Manipulation",
    "conceptExplanation": "Numeric sequence identifiers are frequently embedded inside protocol strings. Extracting and casting them is a vital operational skill.",
    "hints": [
        "The number 99 lies between indices 4 and 6: pacote[4:6].",
        "Use int() to convert and an f-string for the final print."
    ],
    "successStory": "Synchronization restored. The Core is waiting for packet 100."
},
  "py-27": {
    "title": "Hacker Log Sanitization",
    "description": "The variable 'log_bruto' contains '  error:failure:critical  '. Strip spaces, replace ':' with ' > ', convert to UPPERCASE, and print the result.",
    "narrative": "Raw system logs are messy. Transform the raw trace into an operational report for your analyst unit.",
    "concept": "Method Chaining",
    "conceptExplanation": "In Python, you can chain multiple methods consecutively on a single line for elegant text processing pipelines.",
    "hints": [
        "You can chain the methods: log.strip().replace(':', ' > ').upper()"
    ],
    "successStory": "Log sanitized. Failure severity is now clearly visible to all operators."
},
  "py-28": {
    "title": "Metadata Extractor",
    "description": "The variable 'meta' is 'FILE_NAME:system.exe'. Use .find() to locate the ':' and slicing to extract only the filename. Print: 'Arquivo: [nome], Tamanho: [tamanho_do_nome]'.",
    "narrative": "Before injecting code, we must isolate the target binary's name and calculate its digital footprint.",
    "concept": "Dynamic Substring Positioning",
    "conceptExplanation": "Hardcoded slice indices break whenever payloads vary in length. Using .find() allows your code to adapt dynamically to variable-length headers.",
    "hints": [
        "pos = meta.find(':') followed by nome = meta[pos+1:]"
    ],
    "successStory": "Metadata extracted. Target 'system.exe' marked for replacement."
},
  "py-29": {
    "title": "Port Knocking",
    "description": "input() receives '10.0.0.1,8000'. Use .split(',') to separate the IP from the port. Convert the port to an int, add 1, and print the destination: 'Acessando 10.0.0.1 na porta 8001'.",
    "narrative": "Port knocking is a stealth technique where you probe a sequence of closed ports to trigger a firewall bypass rule. Calculate the next port hop.",
    "concept": "Unpacking and Arithmetic",
    "conceptExplanation": "Splitting structured strings and transforming elements is daily routine in network programming.",
    "hints": [
        "ip, porta = info.split(',')"
    ],
    "successStory": "Knock sequence verified. The firewall opened a temporary passage on port 8001."
},
  "py-30": {
    "title": "Core Bypass: Final Protocol",
    "description": "Final Challenge: input() receives ' user:ADMIN_V1 '. 1. Strip outer whitespace. 2. Split into two variables using ':'. 3. Convert value to lowercase. 4. Print: 'Usuario: [valor], ID: [tamanho_do_valor]'.",
    "narrative": "You have arrived at the gate of the Core. Every skill acquired across Terminal Alpha will now be required to generate the master clearance token.",
    "concept": "Variable and String Mastery",
    "conceptExplanation": "Congratulations! You have mastered the fundamentals of Python variables and string processing. You are now prepared to traverse the realm of conditions and loops.",
    "hints": [
        "Combine strip(), split(':'), and lower().",
        "Remember: prefixo, valor = entrada.strip().split(':')"
    ],
    "successStory": "ACCESS GRANTED. Terminal Alpha has been completely overridden. The Core is unlocked. Welcome to the next tier of Python Quest."
},
  "py-cond-01": {
    introStory: "Initial bypass complete, Operator. The next lock is the Routing Node: every packet in the city passes through here and is accepted or dropped by CorpHQ's rules. Whoever controls the decisions controls the traffic. Let's start with if.",
    "title": "Access Firewall",
    "description": "Use an if statement to check if idade is greater than or equal to 18. If so, print 'Acesso Permitido'.",
    "narrative": "A primary firewall protects internal server clusters. Only connections carrying a valid 'Access Age' token may pass. Construct the validation script.",
    "concept": "The 'if' Logical Gate",
    "conceptExplanation": "The 'if' statement empowers code to make autonomous decisions based on conditional logic.\n\nFor example:\nif idade >= 18:\n    print('Entrada Liberada')\n\nThis instructs the program: 'If idade is 18 or greater, execute the indented statement below'. Indented blocks only trigger when the condition evaluates to True.",
    "hints": [
        "The structure begins with if condition: followed by a newline.",
        "The print call must be indented to belong to the if block.",
        "if idade >= 18:\n    print('Acesso Permitido')"
    ],
    "successStory": "Access granted. You executed your first structural bypass on the grid."
},
  "py-cond-02": {
    "title": "Power Management",
    "description": "Use if and else. If energia is greater than 50, print 'Correr'. Otherwise, print 'Descansar'.",
    "narrative": "To optimize Node execution, you must balance power draw. If battery levels are high, the system accelerates; if low, it initiates hibernation.",
    "concept": "Branching Paths (if/else)",
    "conceptExplanation": "While 'if' dictates action when a condition is met, 'else' handles the alternative when it is false. It creates diverging execution paths!\n\nFor example:\nif chover:\n    print('Leve o guarda-chuva')\nelse:\n    print('Leve óculos de sol')\n\nThe interpreter always picks exactly one branch.",
    "hints": [
        "The else clause does not take a new condition.",
        "Ensure consistent indentation in both branches.",
        "if energia > 50:\n    print('Correr')\nelse:\n    print('Descansar')"
    ],
    "successStory": "Power balance restored. Your scripts now handle both flow states of the matrix."
},
  "py-cond-03": {
    "title": "Multi-Layer Access Levels",
    "description": "Use if and elif. If 'nivel' is 1, print 'Acesso Baixo'. If 2, print 'Acesso Medio'. If 3, print 'Acesso Alto'.",
    "narrative": "The security perimeter is tiered into multiple clearance strata. Inspect your clearance token level to unlock the matching gateway.",
    "concept": "Sequential Branching (elif)",
    "conceptExplanation": "The `elif` statement (short for 'else if') lets you evaluate multiple conditions in sequence. Python tests them top-to-bottom until encountering the first one that is True.",
    "hints": [
        "Use elif to test a secondary condition when preceding ones evaluate to False.",
        "You can chain multiple elif statements between if and else.",
        "if nivel == 1:\n    print('Acesso Baixo')\nelif nivel == 2:\n    print('Acesso Medio')"
    ],
    "successStory": "Medium clearance confirmed. You now possess authorization to inspect internal sector telemetry."
},
  "py-cond-04": {
    "title": "Two-Factor Verification",
    "description": "Use the 'and' operator in an if statement. If 'has_token' is True AND 'has_pass' is True, print 'Sistema Desbloqueado'.",
    "narrative": "Unlocking the Core requires more than a security token; the master passphrase is also required. Verify that both prerequisites are fulfilled.",
    "concept": "Logical Conjunction (and)",
    "conceptExplanation": "Logical operators combine multiple conditions. The `and` operator requires all constituent expressions to be True for the compound expression to evaluate to True.\n\nExample: If you have a ticket AND a photo ID, then you are admitted.",
    "hints": [
        "The 'and' operator evaluates to True only if BOTH sides are True.",
        "Syntax: if condicao1 and condicao2:",
        "if has_token and has_pass:\n    print('Sistema Desbloqueado')"
    ],
    "successStory": "Two-factor authentication complete. The Core lockdown has been lifted."
},
  "py-cond-05": {
    "title": "Redundancy Protocol",
    "description": "Use the 'or' operator. If 'servidor_a' is True OR 'servidor_b' is True, print 'Conexão Estável'.",
    "narrative": "To maintain system uptime, at least one of our failover server clusters must remain active. Verify high-availability network health.",
    "concept": "Logical Disjunction (or)",
    "conceptExplanation": "The `or` operator evaluates to True if at least one operand is True. If any condition in the chain is met, the dependent code block will execute.",
    "hints": [
        "The 'or' operator returns True if AT LEAST ONE side evaluates to True.",
        "if servidor_a or servidor_b:"
    ],
    "successStory": "Redundancy engaged. Traffic rerouted to server B. Network connection remains stable."
},
  "py-cond-06": {
    "title": "Logic Inversion",
    "description": "Use the 'not' operator. If there is NO 'virus', print 'Sistema Limpo'.",
    "narrative": "Sometimes the sharpest defense is verifying the absence of hostile signatures. Invert scanner logic to confirm filesystem integrity.",
    "concept": "Logical Negation (not)",
    "conceptExplanation": "The `not` operator negates boolean values. If an expression evaluates to False, `not expression` becomes True. Like saying: 'If it is not raining, proceed outdoors'.",
    "hints": [
        "The 'not' operator flips boolean polarity: not True becomes False.",
        "if not virus:"
    ],
    "successStory": "Threat scan returned negative. System operating in secure perimeter mode."
},
  "py-cond-07": {
    "title": "Port Range Scanner",
    "description": "Check if 'porta' is between 1024 and 65535 (inclusive). If so, print 'Porta de Usuario'.",
    "narrative": "System ports are segmented into distinct tiers. Upper ranges are reserved for userland processes. Determine if packet ingress originates from these ports.",
    "concept": "Chained Comparisons",
    "conceptExplanation": "Python elegantly allows chained comparisons identical to standard mathematics: `10 < x < 20`. This keeps relational logic clean, readable, and concise.",
    "hints": [
        "You can combine conditions with 'and' or use chained syntax: min <= x <= max.",
        "if porta >= 1024 and porta <= 65535:"
    ],
    "successStory": "Port identified as userland application traffic. Packets authorized for dispatch."
},
  "py-cond-08": {
    "title": "Access Whitelist",
    "description": "Check if 'usuario' is present in the list 'lista_branca' using the 'in' operator. If so, print 'Acesso VIP'.",
    "narrative": "The firewall maintains a roster of elite operators. Check whether the current user holds elevated administrative clearance.",
    "concept": "Membership Operator (in)",
    "conceptExplanation": "The `in` operator checks membership across collections. It scans an iterable and reveals if the target item exists within it—like searching for a name on a guest list.",
    "hints": [
        "The 'in' operator tests if an element exists inside a collection.",
        "if usuario in lista_branca:"
    ],
    "successStory": "Elite credentials confirmed. You now possess full root access to the Routing Node."
},
  "py-cond-09": {
    "title": "Anomaly Detector",
    "description": "Use the '!=' operator. If 'sinal' is not equal to 'ERRO', print 'Transmissao Limpa'.",
    "narrative": "A listener scans the comms channel 24/7. Any transmission that is not explicitly flagged as 'ERRO' is valid for deep packet inspection.",
    "concept": "Inequality Operator (!=)",
    "conceptExplanation": "While `==` tests for equality, `!=` verifies inequality. It is crucial for detecting state deviations and anomalous spikes.\n\nExample:\nif status != 'offline':\n    print('Sistema ativo')\n\nThe block only fires if status is NOT 'offline'.",
    "hints": [
        "The '!=' operator stands for 'not equal to'.",
        "if sinal != 'ERRO':",
        "if sinal != 'ERRO':\n    print('Transmissao Limpa')"
    ],
    "successStory": "Clean channel. Receiver confirms no anomalous line noise detected."
},
  "py-cond-10": {
    "title": "Parity Analyzer",
    "description": "Use the modulo operator (%). If 'porta' is even, print 'Porta Par'. Otherwise, print 'Porta Impar'.",
    "narrative": "The System balances throughput by segregating packets across odd and even routing channels. Compute port parity to direct flow.",
    "concept": "Modulo and Parity",
    "conceptExplanation": "The `%` (modulo) operator returns division remainder. 10 % 2 is 0, whereas 11 % 2 is 1.\n\nThis is the idiomatic way to test whether an integer is even (remainder 0) or odd (remainder 1):\nif n % 2 == 0:\n    print('par')",
    "hints": [
        "The % operator returns division remainder. A number is even if 'number % 2' equals 0.",
        "if porta % 2 == 0:",
        "if porta % 2 == 0:\n    print('Porta Par')\nelse:\n    print('Porta Impar')"
    ],
    "successStory": "Traffic directed to the even channel. Load balancer logs the transaction."
},
  "py-cond-11": {
    "title": "Exact Hash Comparator",
    "description": "Compare 'hash_recebido' against 'hash_oficial'. If identical, print 'Integridade OK'. Python strings are case-sensitive.",
    "narrative": "An encrypted packet has landed. To verify cryptographic authenticity, perform an exact match between the received hash and the server's registered checksum.",
    "concept": "String Comparison",
    "conceptExplanation": "In Python, strings are compared character-by-character using `==` and `!=`. The evaluation is strictly case-sensitive: 'Senha' is distinct from 'senha'.\n\nThis strict check is paramount in cryptographic and auth systems where a single mismatched byte invalidates the payload.",
    "hints": [
        "Strings can be compared directly using '=='.",
        "if hash_recebido == hash_oficial:"
    ],
    "successStory": "Hashes match. The packet has been authenticated by a trusted source."
},
  "py-cond-12": {
    "title": "Nested Permission Layers",
    "description": "Use nested if statements. If 'autenticado' is True, inspect 'nivel'. If level is 5, print 'Acesso Root'. Otherwise, print 'Acesso Limitado'.",
    "narrative": "The mainframe vault features two security barriers: the first validates primary credentials, while the second evaluates clearance tier. Model this defense in depth.",
    "concept": "Nested Conditionals",
    "conceptExplanation": "You can place conditional blocks within other conditionals. The inner `if` is only evaluated when the outer `if` evaluates to True, creating hierarchical decision trees.\n\nBe mindful: excessive nesting impairs readability. Whenever appropriate, prefer compounding conditions with `and` on a single line.",
    "hints": [
        "You can place an 'if' inside the indented block of an outer 'if'.",
        "Each level of nesting requires another level of indentation.",
        "if autenticado:\n    if nivel == 5:\n        print('Acesso Root')\n    else:\n        print('Acesso Limitado')"
    ],
    "successStory": "Maximum privileges granted. You have penetrated the inner sanctum of the Central System."
},
  "py-cond-13": {
    "title": "Composite Traffic Filter",
    "description": "Combine 'and' and 'or'. If ('admin' is True OR 'vip' is True) AND 'banido' is False, print 'Trafego Permitido'.",
    "narrative": "The ingress gateway admits traffic from admins or VIP accounts, but any banned node must be dropped regardless of clearance. Code this policy.",
    "concept": "Combining Logical Operators",
    "conceptExplanation": "You can blend `and`, `or`, and `not` within a single expression. Use parentheses to eliminate precedence ambiguity: expressions enclosed within parentheses evaluate first, mirroring mathematical order of operations.\n\nExample: `(a or b) and not c` ensures either a or b is True while c must be False.",
    "hints": [
        "Use parentheses to group the 'or' clause before evaluating the 'and'.",
        "if (admin or vip) and not banido:"
    ],
    "successStory": "VIP packet authenticated with zero blacklist flags. Traffic forwarded."
},
  "py-cond-14": {
    "title": "Compact Routing",
    "description": "Use the ternary conditional operator. Assign to the variable 'status' the value 'Online' if 'ping' is less than 100, otherwise 'Offline'. Then, print 'status'.",
    "narrative": "In ultra-low-latency networks, clean and concise code matters. Compress your branching decision into a single line with Python's conditional expression.",
    "concept": "Ternary Operator",
    "conceptExplanation": "Python enables writing an entire if/else construct as a single-line expression when assigning values.\n\nSyntax:\nresultado = valor_A if condicao else valor_B\n\nRead as: 'assign valor_A if condition is True, else assign valor_B'. Streamlines assignments for straightforward binary decisions.",
    "hints": [
        "The syntax is: <true_value> if <condition> else <false_value>",
        "status = 'Online' if ping < 100 else 'Offline'"
    ],
    "successStory": "Low latency verified. The node is online and responding within operational thresholds."
},
  "py-cond-15": {
    "title": "Type Sniffer",
    "description": "Use 'isinstance()' to check if 'dado' is of type int. If so, print 'Numero Inteiro'. Otherwise, print 'Tipo Desconhecido'.",
    "narrative": "Unidentified packets arrive through an open socket. Before feeding them to downstream routines, verify payload type to prevent fatal exceptions in the Central System.",
    "concept": "Type Inspection (isinstance)",
    "conceptExplanation": "The `isinstance(object, classinfo)` function returns True if the target matches the specified type. It is the safe, PEP-compliant approach for type validation in Python.\n\nCommon built-in types: int (integer), float (decimal), str (string), list (list), bool (boolean).\n\nUse this to sanitize and validate input payloads before executing type-sensitive operations.",
    "hints": [
        "isinstance() accepts two arguments: the variable and the expected type (int, str, list...).",
        "if isinstance(dado, int):"
    ],
    "successStory": "Packet typed successfully. Payload dispatched to arithmetic processing unit."
},
  "py-cond-16": {
    "title": "Command Dispatcher",
    "description": "Use match/case. For 'comando' = 'start', print 'Iniciando'. For 'stop', print 'Parando'. For 'reboot', print 'Reiniciando'. For any other, print 'Comando Desconhecido'.",
    "narrative": "The Central System terminal receives administrative directives. Implement a dispatcher that routes commands to corresponding actions using Python's structural pattern matching.",
    "concept": "Pattern Matching (match/case)",
    "conceptExplanation": "Since Python 3.10, `match/case` provides native structural pattern matching—replacing unwieldy `if/elif/else` ladders with clean pattern dispatch.\n\nBasic syntax:\nmatch valor:\n    case 'a':\n        ...\n    case 'b':\n        ...\n    case _:\n        ... # default case\n\nThe wildcard underscore `_` acts as a catch-all default branch.",
    "hints": [
        "Syntax: match variable: followed by indented 'case value:' branches.",
        "Use 'case _:' as the fallback default handler.",
        "match comando:\n    case 'start':\n        print('Iniciando')\n    case 'stop':\n        print('Parando')\n    case 'reboot':\n        print('Reiniciando')\n    case _:\n        print('Comando Desconhecido')"
    ],
    "successStory": "Dispatcher operational. The Central System responds to terminal instructions with near-zero latency."
},
  "py-cond-17": {
    "title": "Empty Buffer Detector",
    "description": "In Python, empty lists are considered 'falsy'. If the list 'fila' is empty (without using len()), print 'Buffer Vazio'. Otherwise, print 'Buffer com Dados'.",
    "narrative": "Before batch processing, the pipeline must know if tasks await execution. Leverage Python's implicit truthiness—an empty list naturally evaluates to False.",
    "concept": "Truthy and Falsy Values",
    "conceptExplanation": "In Python, various empty values evaluate as falsy in boolean contexts: 0, '', [], {}, None, and False. Everything else evaluates as truthy. This allows clean, idiomatic idioms like `if not fila:` instead of verbose checks like `if len(fila) == 0:`.",
    "hints": [
        "An empty list [] is Falsy. Simply check 'if not fila:' to detect an empty buffer.",
        "if not fila:\n    print('Buffer Vazio')\nelse:\n    print('Buffer com Dados')"
    ],
    "successStory": "Buffer verified empty. The CPU idles cleanly without wasting processing cycles."
},
  "py-cond-18": {
    "title": "Missing Signal Verification (is None)",
    "description": "Use 'is None' to check if 'resposta' is missing (is None). If so, print 'Sem Resposta'. Otherwise, print its value.",
    "narrative": "A remote telemetry sensor dropped connection. Detect the 'None' state using the identity operator rather than equality.",
    "concept": "Identity Operator (is)",
    "conceptExplanation": "'is' checks OBJECT IDENTITY (whether both sides reference the exact same memory address), whereas '==' checks equality of values. Singletons like None, True, and False should always be compared using 'is'/'is not' as mandated by PEP 8.",
    "hints": [
        "By convention, singleton checks with None use 'is' and 'is not', never '==' or '!='.",
        "if resposta is None:"
    ],
    "successStory": "Missing signal detected. Rescheduling polling request to remote sensor."
},
  "py-cond-19": {
    "title": "Exclusion List (not in)",
    "description": "Check if 'ip' is NOT in the list 'banidos' using 'not in'. If not present, print 'Conexao Liberada'.",
    "narrative": "Before accepting an inbound socket connection, confirm that the source IP does not appear on the firewall's blacklist.",
    "concept": "Negative Membership (not in)",
    "conceptExplanation": "'not in' is the counterpart of 'in'—it returns True if an element does NOT belong to a collection. While equivalent to 'not (x in list)', it is significantly more readable and idiomatic.",
    "hints": [
        "The 'not in' operator checks whether an item is absent from a collection.",
        "if ip not in banidos:"
    ],
    "successStory": "IP not on blacklist. Packet forwarded to next verification stage."
},
  "py-cond-20": {
    "title": "Command Normalization",
    "description": "Compare 'comando' against 'EXIT' case-insensitively using .lower(). If equivalent, print 'Saindo'.",
    "narrative": "Fatigued operators enter keystrokes erratically. Standardize input casing before evaluating—'exit', 'Exit', and 'EXIT' must all trigger the shutdown handler.",
    "concept": "Case-Insensitive Comparison",
    "conceptExplanation": "To perform case-insensitive comparisons, normalize both sides using .lower() or .upper(). This is standard procedure for handling user input, terminal commands, and external network payloads.",
    "hints": [
        "Use 'comando.lower() == \"exit\"' for case-insensitive matching.",
        "if comando.lower() == 'exit':"
    ],
    "successStory": "Command identified regardless of casing. Session terminating gracefully."
},
  "py-cond-21": {
    "title": "Boolean Conversion",
    "description": "Use bool() to convert the value 'dado' (an empty string) and print the result. Next, do the same with 'outro' (the string 'ok'). Expected output: False / True.",
    "narrative": "To determine if a payload field was populated, explicitly cast it to a boolean flag. Empty strings become False; populated strings become True.",
    "concept": "bool() Built-in Function",
    "conceptExplanation": "The bool() function casts any value to a boolean according to Python's truth value testing rules. Crucial when serializing, logging, or storing explicit True/False flags. Note: bool(0) → False, bool(1) → True, bool([]) → False.",
    "hints": [
        "bool('') evaluates to False; bool('text') evaluates to True following truthy/falsy rules.",
        "print(bool(dado))\nprint(bool(outro))"
    ],
    "successStory": "Explicit conversion executed. Boolean flags ready for serialization."
},
  "py-cond-22": {
    "title": "At Least One Alert (any)",
    "description": "The list 'alertas' contains boolean values from grid sensors. Use any() to check if AT LEAST ONE sensor triggered. If so, print 'Alerta Ativo'.",
    "narrative": "If any perimeter sensor flags an intrusion, the defensive lockdown must engage immediately. Sweep all sensors simultaneously using any().",
    "concept": "any() Function",
    "conceptExplanation": "any(iterable) functions as a collective 'OR' gate—it evaluates to True if any element in the collection is truthy. Far cleaner than chaining 'a or b or c'. Pair with generator expressions for complex conditions: any(x > 100 for x in values).",
    "hints": [
        "any(iterable) returns True if at least one item evaluates to truthy.",
        "if any(alertas):\n    print('Alerta Ativo')"
    ],
    "successStory": "Sensor 3 triggered. Defense protocol activated across all perimeter nodes."
},
  "py-cond-23": {
    "title": "All Sensors OK (all)",
    "description": "The list 'checks' contains the status flags of critical systems. Use all() to confirm that ALL systems are operational. If so, print 'Sistema Pronto'. Otherwise, print 'Falha Detectada'.",
    "narrative": "Before initiating payload injection, EVERY subsystem must report green simultaneously. Perform a comprehensive check using all().",
    "concept": "all() Function",
    "conceptExplanation": "all(iterable) functions as a collective 'AND' gate—returning True only if every element in the collection is truthy. Note: an empty iterable returns True (vacuous truth). Keep this edge case in mind.",
    "hints": [
        "all(iterable) returns True only if EVERY item evaluates to truthy.",
        "if all(checks):\n    print('Sistema Pronto')\nelse:\n    print('Falha Detectada')"
    ],
    "successStory": "All subsystems report green. Authorization granted for next operational phase."
},
  "py-cond-24": {
    "title": "Temperature Threshold",
    "description": "Given 'temperatura', use if/elif/else. If > 80 print 'CRITICO'. If between 50 and 80 (inclusive) print 'ALTO'. If between 20 and 49 print 'NORMAL'. Otherwise, print 'BAIXO'.",
    "narrative": "The reactor operates across strict thermal thresholds. Classify the telemetry reading into the proper operational band to trigger correct coolant pumps.",
    "concept": "Chained elif Thresholds",
    "conceptExplanation": "When categorizing values across numeric ranges, chain elif blocks in monotonic order (descending or ascending). Since prior conditions filter out preceding bands, each elif only needs to evaluate one boundary.",
    "hints": [
        "Remember that an elif branch only executes if previous conditions failed—chaining ranges is straightforward.",
        "if temperatura > 80:\n    print('CRITICO')\nelif temperatura >= 50:\n    print('ALTO')\nelif temperatura >= 20:\n    print('NORMAL')\nelse:\n    print('BAIXO')"
    ],
    "successStory": "Temperature classified as ALTO. Preventative cooling protocol activated."
},
  "py-cond-25": {
    "title": "Telemetry Peak",
    "description": "Given 'leituras = [12, 89, 34, 67, 91, 23]', use max() to find the highest value. If it exceeds 80, print 'PICO_PERIGOSO followed by a space and the value'. Expected output: 'PICO_PERIGOSO 91'.",
    "narrative": "Telemetry streams log dozens of sensor readings every second. Pinpoint the burst peak and raise an alert if it breaches safe limits.",
    "concept": "max/min in Decision Making",
    "conceptExplanation": "max() and min() are built-in functions accepting any iterable. Combined with conditionals, they enable evaluations over extremes without writing manual loop logic. They also accept key= functions for custom metrics.",
    "hints": [
        "max(list) returns the maximum value. Use this expression inside your if statement.",
        "pico = max(leituras)\nif pico > 80:\n    print(f'PICO_PERIGOSO {pico}')"
    ],
    "successStory": "Peak 91 isolated and flagged as dangerous. Incident response team alerted."
},
  "py-cond-26": {
    "title": "Inline Capture (Walrus)",
    "description": "Use the walrus operator ':=' to assign 'len(dados)' to the variable 'n' directly within the if condition. If n > 5, print f'Pacotes:{n}'. Expected output: 'Pacotes:7'.",
    "narrative": "Streamline execution: evaluate and assign packet buffer count in a single expression. The walrus operator cuts redundancy in intermediate calculations.",
    "concept": "Walrus Operator (:=)",
    "conceptExplanation": "Introduced in Python 3.8, the assignment expression ':=' allows assigning and evaluating within the same expression. Helpful when the calculated value is needed both in the conditional check and inside the body.",
    "hints": [
        "Syntax: if (variable := expression) condition:",
        "if (n := len(dados)) > 5:\n    print(f'Pacotes:{n}')"
    ],
    "successStory": "Inline assignment successful. Denser code with clear intent."
},
  "py-cond-27": {
    "title": "Match with Guard Clause",
    "description": "Use match/case with a guard (if inside case). Given 'codigo = 200', if 200 with guard 'if codigo < 300', print 'OK'. If 500+, print 'ERRO_SERVIDOR'. Otherwise, print 'OUTRO'.",
    "narrative": "HTTP status codes span semantic ranges. Combine pattern matching with guards to categorize status bands cleanly without nested elif statements.",
    "concept": "Match with Guard",
    "conceptExplanation": "In pattern matching, you can append an 'if' clause after a pattern (called a 'guard') to refine when the case fires. Combines pattern destructuring with conditional expressions.",
    "hints": [
        "Syntax: case value if extra_condition:",
        "match codigo:\n    case n if n < 300:\n        print('OK')\n    case n if n >= 500:\n        print('ERRO_SERVIDOR')\n    case _:\n        print('OUTRO')"
    ],
    "successStory": "Status code 200 classified as successful. HTTP flow proceeds normally."
},
  "py-cond-28": {
    "title": "Match Multiple Patterns",
    "description": "Use match/case with the '|' operator to combine patterns. For 'metodo' = 'GET' OR 'HEAD', print 'leitura'. For 'POST' OR 'PUT' OR 'PATCH', print 'escrita'. Otherwise, print 'outro'.",
    "narrative": "HTTP verbs group into operational families. Use alternate pattern syntax to handle multiple verbs within shared handler blocks.",
    "concept": "Match with OR (|)",
    "conceptExplanation": "The '|' symbol within a case pattern allows grouping multiple candidate values that share identical handling. Far cleaner than repeating blocks across multiple cases.",
    "hints": [
        "case 'A' | 'B': groups values that trigger the same execution block.",
        "match metodo:\n    case 'GET' | 'HEAD':\n        print('leitura')\n    case 'POST' | 'PUT' | 'PATCH':\n        print('escrita')\n    case _:\n        print('outro')"
    ],
    "successStory": "Verb classified as write operation. Enhanced payload validation enabled."
},
  "py-cond-29": {
    "title": "Defensive Short-Circuit",
    "description": "Print 'usuario' IF it is not None AND has more than 3 characters. Use 'and' for short-circuit evaluation (the second check only runs if the first passes). Expected output: 'admin'.",
    "narrative": "To prevent an AttributeError when invoking len() on None, chain your checks defensively. Python evaluates 'and' left-to-right and halts on the first False.",
    "concept": "Short-Circuit Evaluation",
    "conceptExplanation": "Logical 'and' and 'or' operators evaluate lazily from left to right. In 'A and B', if A is False, B is never evaluated. In 'A or B', if A is True, B is never evaluated. Use this for defensive gating.",
    "hints": [
        "In 'A and B', if A is False, B is never evaluated—preventing errors in B.",
        "if usuario is not None and len(usuario) > 3:\n    print(usuario)"
    ],
    "successStory": "Chained validation executed without raising an exception. Operator authenticated with full defense."
},
  "py-cond-30": {
    "title": "Protocol Identifier",
    "description": "Given 'url', use .startswith() to detect the protocol. If it starts with 'https://', print 'SEGURO'. If with 'http://', print 'INSEGURO'. Otherwise, print 'DESCONHECIDO'.",
    "narrative": "The ingress scanner must determine how to handle each target URL—secure connections route to an encrypted tunnel, insecure ones to an inspection sandbox.",
    "concept": "startswith / endswith",
    "conceptExplanation": "str.startswith(prefix) and str.endswith(suffix) return booleans testing the beginning or end of a string. Far more idiomatic and safe than manual slicing ('s[:5] == \"https\"'). They also accept tuples to test multiple prefixes: `url.startswith((\"http://\", \"https://\"))`.",
    "hints": [
        "Order matters: test 'https://' BEFORE 'http://' (otherwise the latter would match first if tested improperly).",
        "if url.startswith('https://'):\n    print('SEGURO')\nelif url.startswith('http://'):\n    print('INSEGURO')\nelse:\n    print('DESCONHECIDO')"
    ],
    "successStory": "URL classified as secure. Encrypted pipeline activated for this session."
},
};
