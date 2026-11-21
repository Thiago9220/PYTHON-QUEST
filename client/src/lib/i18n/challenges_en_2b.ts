import type { LocalizedChallengeFields } from './worlds_en';

export const CHALLENGES_EN_2B: Record<string, LocalizedChallengeFields> = {
  "py-oop-01": {
    "title": "The Class Blueprint",
    "description": "Create an empty class named 'Bot'. Then, create an instance of this class named 'meu_bot' and print the type (type) of 'meu_bot'.",
    "narrative": "Before assembling an army of automatons, we need the blueprint. Define the foundational structure of Bot so we can instantiate it in memory.",
    "concept": "Classes and Instances",
    "conceptExplanation": "A Class is like an architectural blueprint or a mold. An Instance (Object) is the constructed building or finished product. You write the class once and instantiate as many independent objects from it as needed.",
    "hints": [
      "Use the syntax 'class Bot:' and put 'pass' inside it so it does not raise an error.",
      "To instantiate it, do: meu_bot = Bot()"
    ],
    "successStory": "Blueprint defined. The matrix has begun generating the first instances."
  },
  "py-oop-02": {
    "title": "The Soul of the Object (__init__)",
    "description": "In class Bot, add the __init__ method that receives 'nome' and stores it in 'self.nome'. Create bot 'Alpha' and print its '.nome' attribute.",
    "narrative": "An unconfigured Bot is useless. Equip it with a constructor method so that, the moment it is initialized, it writes its own name into internal memory.",
    "concept": "Constructor and Properties",
    "conceptExplanation": "The special `__init__` method runs automatically when an object is instantiated. It serves as the initialization routine. The `self` parameter represents the object instance itself; through `self`, it binds and stores attributes within its own memory namespace.",
    "hints": [
      "def __init__(self, nome):\n    self.nome = nome",
      "meu_bot = Bot('Alpha')\nprint(meu_bot.nome)"
    ],
    "successStory": "Identity online. Bot Alpha is now self-aware."
  },
  "py-oop-03": {
    "title": "Autonomous Action (Methods)",
    "description": "In class Bot, add a method named 'atacar' (which takes self) and prints '[nome] está atacando!'. Create bot 'Zeta' and call the atacar() method.",
    "narrative": "Now that the Bot has an identity, teach it to act. Add a method so it can execute attack subroutines using its own identity.",
    "concept": "Class Methods",
    "conceptExplanation": "Methods are simply functions that belong to a class. The crucial detail is that the first parameter of any instance method is ALWAYS `self`. This allows the method to access attributes (such as `self.nome`) belonging to that specific instance.",
    "hints": [
      "def atacar(self):\n    print(f'{self.nome} está atacando!')",
      "Instantiate: b = Bot('Zeta'). Then call: b.atacar()"
    ],
    "successStory": "Offensive protocol engaged. The object autonomously executed the combat subroutine."
  },
  "py-oop-04": {
    "title": "State Mutation",
    "description": "Add the attribute 'energia = 100' in __init__. In the 'tomar_dano' method, decrease energia by 20. Create a Bot, make it take damage, and print its final energia.",
    "narrative": "Combat drains resources. Objects must maintain and modify their internal states in isolation, without relying on global variables.",
    "concept": "State",
    "conceptExplanation": "An object retains its 'State' (internal variables). When a method modifies data using `self`, only that specific object is affected. If you had 10 bots, each would maintain its own independent energia level.",
    "hints": [
      "Inside tomar_dano, do: self.energia -= 20"
    ],
    "successStory": "Combat simulation concluded. The bot logged the damage while preserving persistent state."
  },
  "py-oop-05": {
    "title": "Code Evolution (Inheritance)",
    "description": "Create a class 'BotSniper' that INHERITS from 'Bot'. Without rewriting __init__ or energia, instantiate a BotSniper, make it take damage, and print its energia.",
    "narrative": "Avoid rewriting core routines by using Inheritance. The Sniper inherits all baseline resilience and attributes from the standard Bot, ready to serve as a specialized combat unit.",
    "concept": "Inheritance",
    "conceptExplanation": "Inheritance allows you to create a 'child class' that automatically acquires all attributes and methods of its 'parent class'. It is a foundational concept for code reuse across large-scale software systems.",
    "hints": [
      "class BotSniper(Bot):\n    pass"
    ],
    "successStory": "New unit deployed! The class inherited the baseline architecture without redundant code."
  },
  "py-oop-06": {
    "title": "Multiple Independent Instances",
    "description": "Create class 'Drone' with __init__ taking 'id'. Instantiate 'd1 = Drone(1)' and 'd2 = Drone(2)'. Print d1.id and d2.id (each on its own line).",
    "narrative": "Every drone must broadcast its own unique identifier. Verify that instances do not bleed memory into one another.",
    "concept": "Instance Identity",
    "conceptExplanation": "Every time you invoke the class constructor (Drone()), Python instantiates an entirely new object in memory. Mutating an attribute on one instance never alters the other—each maintains its own isolated state.",
    "hints": [
      "Each call to Drone(...) creates a NEW object with its own memory allocation.",
      "class Drone:\n    def __init__(self, id):\n        self.id = id"
    ],
    "successStory": "Squadron registered. Each drone operates with its own isolated identifier."
  },
  "py-oop-07": {
    "title": "Class Attribute (Shared)",
    "description": "Create class 'Soldado' with a CLASS attribute 'faccao = \"Resistencia\"' (defined outside of __init__). Instantiate a soldier and print 'Soldado.faccao'.",
    "narrative": "Every operative in this division pledges loyalty to the same faction. Define this value once, shared uniformly across all instances.",
    "concept": "Class Attributes vs Instance Attributes",
    "conceptExplanation": "Attributes defined directly in the class body (outside `__init__`) are SHARED across every instance of that class. In contrast, attributes bound to `self.xxx` are unique per instance. Useful for constants or class-wide counters.",
    "hints": [
      "class Soldado:\n    faccao = 'Resistencia'",
      "print(Soldado.faccao) — direct access via the class."
    ],
    "successStory": "Allegiance configured. The entire division reports to the same faction without data duplication."
  },
  "py-oop-08": {
    "title": "String Representation (__str__)",
    "description": "Create class 'Agente' with __init__(nome) and the special method __str__ that returns f'Agente:{self.nome}'. Instantiate 'Smith' and simply run print(a).",
    "narrative": "When system routines log an object, they need a clear textual description. Implement the self-description method for crisp log output.",
    "concept": "The __str__ Method",
    "conceptExplanation": "The `__str__` dunder method is invoked automatically whenever you call `print(obj)` or `str(obj)`. Without it, Python displays raw memory pointers like `<__main__.Agente object at 0x7f...>`. Implementing `__str__` is standard practice for production classes.",
    "hints": [
      "__str__ must RETURN a string, not call print.",
      "def __str__(self):\n    return f'Agente:{self.nome}'"
    ],
    "successStory": "Self-description enabled. System logs now display readable identities instead of raw pointer addresses."
  },
  "py-oop-09": {
    "title": "Method with Parameters",
    "description": "Create 'Conta' with initial saldo 0. Add method 'depositar(valor)' that adds valor to saldo. Instantiate it, deposit 250, then 150, and print the final saldo.",
    "narrative": "A credit vault requires dynamic inputs. Instance methods accept parameters just like regular functions, following the mandatory self argument.",
    "concept": "Methods with Arguments",
    "conceptExplanation": "Beyond `self`, methods can accept as many arguments as necessary. `self` is always first and passed implicitly. All other parameters are passed explicitly: `conta.depositar(250)`.",
    "hints": [
      "def depositar(self, valor):\n    self.saldo += valor"
    ],
    "successStory": "Transactions logged. The vault processed sequential deposits with zero loss of state."
  },
  "py-oop-10": {
    "title": "Encapsulation (_ Convention)",
    "description": "Create 'Cofre' with an __init__ setting 'self._senha = \"1234\"' (an underscore indicates private). Add method 'verificar(tentativa)' that returns True if equal, False otherwise. Test with 'verificar(\"1234\")' and print the result.",
    "narrative": "Sensitive attributes should be marked private by convention. A leading underscore is the universal Python cue: 'INTERNAL USE ONLY, interact through public interfaces'.",
    "concept": "Encapsulation",
    "conceptExplanation": "Python lacks strict 'private' access modifiers like Java or C++, but the ecosystem adheres to a leading underscore `_` as a clear convention: 'this attribute is internal; do not mutate directly'. External operations should route through public methods to safeguard object integrity.",
    "hints": [
      "Python has no hard 'private' keyword — we use the `_` prefix by standard convention.",
      "def verificar(self, tentativa):\n    return tentativa == self._senha"
    ],
    "successStory": "Vault sealed. The passcode is accessible only through verified authorization channels."
  },
  "py-oop-11": {
    "title": "Property (Magic Getter)",
    "description": "Create 'Reator' with __init__ taking 'temp_celsius'. Add a @property named 'fahrenheit' that returns 'self.temp_celsius * 9/5 + 32'. Instantiate with 100 and print 'reator.fahrenheit' (without parentheses!).",
    "narrative": "Exposing a derived metric as a standard attribute, while encapsulating computation logic, is the hallmark of a clean interface.",
    "concept": "@property",
    "conceptExplanation": "The `@property` decorator transforms a method into a computed attribute. Consumers access it without parentheses (`object.attribute`), while execution happens behind the scenes. It is the idiomatic Python mechanism for elegant getters and read-only properties.",
    "hints": [
      "@property turns a method into a computed attribute — accessed without ().",
      "@property\ndef fahrenheit(self):\n    return self.temp_celsius * 9/5 + 32"
    ],
    "successStory": "Thermal conversion encapsulated. The interface remains clean without leaking raw computational routines."
  },
  "py-oop-12": {
    "title": "Method Overriding",
    "description": "Given class 'Veiculo' with method 'mover' that prints 'rodando', create 'Aviao(Veiculo)' that OVERRIDES 'mover' to print 'voando'. Instantiate an Aviao and call .mover().",
    "narrative": "Not all fortress units navigate identically. Subclasses must be able to override inherited behaviors when specialized operations require it.",
    "concept": "Method Overriding",
    "conceptExplanation": "When a child class defines a method with the same name as its parent, it overrides the inherited behavior. Python resolves methods starting at the most specific class in the hierarchy.",
    "hints": [
      "Simply declare a method with the same name in the child class — Python prioritizes the most specific definition.",
      "class Aviao(Veiculo):\n    def mover(self):\n        print('voando')"
    ],
    "successStory": "Specialized subclass registered. The aerial unit now navigates using its own flight protocol."
  },
  "py-oop-13": {
    "title": "Parent Class Delegation (super)",
    "description": "Given 'Pessoa' with __init__(nome), create 'Funcionario(Pessoa)' with __init__(nome, salario). Use super().__init__(nome) to delegate constructor initialization. Instantiate 'Funcionario(\"Ana\", 5000)' and print nome and salario, one per line.",
    "narrative": "Subclasses do not need to reinvent base logic—delegate initialization to the parent class and append only specialized attributes.",
    "concept": "super()",
    "conceptExplanation": "`super()` returns a proxy object delegating method calls to the parent class. Invoking `super().__init__(...)` inside a subclass constructor reuses parent initialization logic cleanly. It is essential for deep object hierarchies and multiple inheritance.",
    "hints": [
      "Inside the child's __init__, call: super().__init__(nome)",
      "class Funcionario(Pessoa):\n    def __init__(self, nome, salario):\n        super().__init__(nome)\n        self.salario = salario"
    ],
    "successStory": "Initialization chain integrated. The subclass fulfilled the contracts established by its ancestor class."
  },
  "py-oop-14": {
    "title": "Tactical Polymorphism",
    "description": "Create 'Gato' and 'Cachorro', each with method 'falar' returning 'miau' and 'au', respectively. In a list 'animais = [Gato(), Cachorro()]', iterate and print the sound of each.",
    "narrative": "The Operator does not need to know the concrete type of each unit—invoke the unified interface method and each reacts according to its nature. That is the core of polymorphism.",
    "concept": "Polymorphism",
    "conceptExplanation": "Polymorphism (many forms) is the ability to interact with different object types through a shared interface. If each class implements `falar()`, you do not need type-checks—just call the method. This eliminates sprawling if/elif type ladders.",
    "hints": [
      "No inheritance required here—both classes simply need a method with the exact same name.",
      "for a in animais:\n    print(a.falar())"
    ],
    "successStory": "Unified interface response. Distinct types executed unique behaviors across a single dispatch loop."
  },
  "py-oop-15": {
    "title": "Type Verification (isinstance)",
    "description": "Given 'obj = \"Texto\"', use isinstance(obj, str) and print True/False. Then, use isinstance(obj, int) and print the result.",
    "narrative": "Before executing specialized subroutines, verify the concrete type of the incoming payload. `isinstance` is superior to `type()` because it accounts for inheritance hierarchies.",
    "concept": "isinstance()",
    "conceptExplanation": "`isinstance(object, classinfo)` checks whether an object is an instance of a specified class or any subclass derived from it. It is strongly preferred over `type(x) == X` because it honors polymorphism and inheritance.",
    "hints": [
      "isinstance(val, type) returns True if the value matches the type or inherits from it.",
      "print(isinstance(obj, str))\nprint(isinstance(obj, int))"
    ],
    "successStory": "Type verification successful. The system intercepts incompatible payloads prior to execution."
  },
  "py-oop-16": {
    "title": "Class Method (@classmethod)",
    "description": "Create 'Contador' with class attribute 'total = 0'. Add a @classmethod 'incrementar(cls)' that executes 'cls.total += 1'. Call Contador.incrementar() three times and print Contador.total.",
    "narrative": "Certain operations affect the class as a whole rather than a single instance. Employ `@classmethod` for administrative and factory operations.",
    "concept": "@classmethod",
    "conceptExplanation": "A `@classmethod` receives the CLASS itself (`cls`) as its first argument instead of an instance (`self`). This is ideal for managing class-level state, creating alternative constructor factory methods, and tracking shared counters.",
    "hints": [
      "@classmethod\ndef incrementar(cls):\n    cls.total += 1",
      "Invoke directly on the class: Contador.incrementar()"
    ],
    "successStory": "Centralized counter active. Administrative routines operate at the class level rather than per instance."
  },
  "py-oop-17": {
    "title": "Static Method (@staticmethod)",
    "description": "Create 'Calculadora' with a @staticmethod 'somar(a, b)' that returns a + b (no self, no cls). Call Calculadora.somar(15, 27) and print the result.",
    "narrative": "Certain utility routines do not require object state or class context—they simply belong inside the class namespace. Use `@staticmethod` for self-contained helper functions.",
    "concept": "@staticmethod",
    "conceptExplanation": "A `@staticmethod` behaves like a plain function neatly namespaced inside a class. It receives neither `self` nor `cls`. Use it for utility procedures logically related to the class domain that do not inspect or mutate state.",
    "hints": [
      "@staticmethod\ndef somar(a, b):\n    return a + b",
      "Call: Calculadora.somar(15, 27) — without instantiating."
    ],
    "successStory": "Utility registered. The procedure lives in the class namespace with zero instance overhead."
  },
  "py-oop-18": {
    "title": "Multiple Inheritance",
    "description": "Create 'Voador' with method 'voar' (prints 'voa'). Create 'Nadador' with method 'nadar' (prints 'nada'). Create 'Pato(Voador, Nadador)' inheriting from both. Instantiate a Pato and call .voar() and .nadar().",
    "narrative": "Certain units require capabilities synthesized from multiple lineages. Python allows inheriting from multiple parent classes simultaneously—when designed judiciously.",
    "concept": "Multiple Inheritance",
    "conceptExplanation": "Unlike languages like Java, Python supports multiple inheritance natively. Class inheritance order matters: Python resolves attributes via MRO (Method Resolution Order) from left to right. Apply carefully to avoid attribute collisions.",
    "hints": [
      "Syntax: class Pato(Voador, Nadador):",
      "You can simply put 'pass' in Pato's body — it inherits all routines automatically."
    ],
    "successStory": "Lineages synthesized. The unit absorbed capabilities from both ancestor classes without conflict."
  },
  "py-oop-19": {
    "title": "Composition (Object Inside Object)",
    "description": "Create 'Motor' with __init__(potencia). Create 'Carro' com __init__(nome) that STORES a Motor(200) in self.motor. Instantiate 'Carro(\"Mustang\")' and print 'c.motor.potencia'.",
    "narrative": "Rather than inheriting behavior, systems often COMPOSE other objects. Composition frequently offers greater flexibility and looser coupling than inheritance hierarchies.",
    "concept": "Composition",
    "conceptExplanation": "Composition means storing instances of other classes as attributes. A core design principle is 'favor composition over inheritance'. It allows swapping components dynamically without redesigning inheritance trees.",
    "hints": [
      "Composition = HAS-A relationship. Inheritance = IS-A relationship. Here Car HAS A motor, rather than IS A motor.",
      "class Carro:\n    def __init__(self, nome):\n        self.nome = nome\n        self.motor = Motor(200)"
    ],
    "successStory": "Subsystem linked. The vehicle delegated mechanical power to its engine without hardcoding inheritance."
  },
  "py-oop-20": {
    "title": "Custom Equality (__eq__)",
    "description": "Create 'Chave' with __init__(codigo). Implement __eq__(self, outro) returning True if self.codigo == outro.codigo. Create c1=Chave('AB') and c2=Chave('AB'), and print 'c1 == c2'.",
    "narrative": "By default, two distinct objects evaluate as equal only if they occupy the EXACT same memory address. To compare them by internal data, customize their equality logic.",
    "concept": "The __eq__ Method",
    "conceptExplanation": "Special dunder methods customize how standard operators interact with your objects. `__eq__` implements `==`, `__lt__` implements `<`, `__add__` implements `+`, and so on. They power Python's operator polymorphism.",
    "hints": [
      "def __eq__(self, outro):\n    return self.codigo == outro.codigo",
      "Without __eq__, c1 == c2 evaluates to False even with matching codes because it compares memory IDs."
    ],
    "successStory": "Equivalence criterion activated. The system now validates content equivalence rather than raw memory addresses."
  },
  "py-exc-01": {
    "title": "Fault Containment (Try/Except)",
    "description": "Attempt to divide 10 by 0 inside a try/except block. In the except block, print 'Erro Detectado'.",
    "narrative": "Division by zero triggers a fatal Kernel panic. Deploy the Try/Except shield to intercept the arithmetic blast and keep system services running.",
    "concept": "Exception Handling",
    "conceptExplanation": "A `try` block attempts to execute hazardous code. If a crash occurs (such as division by zero or a missing key), the application does not crash! Execution jumps directly to the `except` block, giving you complete control over failure recovery.",
    "hints": [
      "The basic structure is:\ntry:\n    print(10 / 0)\nexcept:\n    print('Erro Detectado')"
    ],
    "successStory": "Panic averted. The Kernel maintained runtime stability despite the arithmetic breach."
  },
  "py-exc-02": {
    "title": "Specific Exception Handling",
    "description": "The variable 'dado' holds the string 'Texto'. Try converting it to int() inside a try block. Use 'except ValueError:' and print 'Dado Invalido'.",
    "narrative": "Always catch the exact anomaly you anticipate. The data parser is digesting corrupted streams—intercept value casting failures with ValueError.",
    "concept": "Specific Exceptions",
    "conceptExplanation": "A bare `except:` intercepts ALL errors (including syntax typos and keyboard interrupts). Handling specific exception classes like `ValueError` (casting errors), `KeyError` (dictionary keys), and `IndexError` (out-of-bounds indices) is the mark of an elite engineer.",
    "hints": [
      "except ValueError: intercepts only invalid conversion errors, allowing unexpected exceptions to surface for system auditing."
    ],
    "successStory": "Robust data sanitization. The system filtered out malformed inputs without interrupting core execution."
  },
  "py-exc-03": {
    "title": "The False Alarm",
    "description": "Inside a try block, use raise Exception('Invasor') to trigger an error on purpose. Catch it with except Exception as e and print the message (e).",
    "narrative": "To throw trackers off your trail, trigger a false alarm in the system — but catch it before it takes down your own script.",
    "concept": "Raising Exceptions (raise)",
    "conceptExplanation": "Sometimes YOU want the program to stop. The `raise` keyword throws an error on purpose when something is critically wrong. The calling code can catch that error with `try/except` and decide what to do:\n\ntry:\n    raise Exception('Failure')\nexcept Exception as e:\n    print(e)  # prints: Failure",
    "hints": [
      "raise Exception('Invasor') throws the error immediately. It must be inside the try block.",
      "except Exception as e: stores the error in e. print(e) shows just the message.",
      "try:\n    raise Exception('Invasor')\nexcept Exception as e:\n    print(e)"
    ],
    "successStory": "False alarm dispatched successfully. The incident response squad is hunting ghosts."
  },
  "py-exc-04": {
    "title": "External Armaments (Imports)",
    "description": "Import the 'math' module. Use the 'math.sqrt()' function to compute the square root of 144 and print the result converted to an integer (int).",
    "narrative": "Python's core namespace doesn't include every advanced mathematical routine. Import the heavy arithmetic package to crack this quadratic cryptographic lock.",
    "concept": "Modules (Imports)",
    "conceptExplanation": "Python ships with a massive 'Standard Library' of pre-built tools. With the `import` statement, you load external modules (such as `math` for mathematical routines, `random` for entropy, and `datetime` for timestamps) directly into your execution context.",
    "hints": [
      "import math\nprint(int(math.sqrt(144)))"
    ],
    "successStory": "Arsenal imported. The cryptographic cipher dissolved under the arithmetic module."
  },
  "py-exc-05": {
    "title": "Random Cryptography",
    "description": "Import the 'randint' function from the 'random' module. Generate and print a random integer between 1 and 10. (The test validates correct code execution rather than a fixed output).",
    "narrative": "We need an unpredictable seed number to forge a clean digital signature. A selective import ensures a lightweight, efficient payload.",
    "concept": "Selective Imports",
    "conceptExplanation": "Instead of loading an entire module into memory, use `from module import function` to extract only the routines you need. This keeps namespace clutter low and makes dependencies explicit.",
    "hints": [
      "The selective import syntax is: from random import randint",
      "from random import randint\nprint(randint(1, 10))"
    ],
    "successStory": "Entropy injected. Your telemetry trail is now completely unpredictable."
  },
  "py-exc-06": {
    "title": "Capturing Error Messages (as)",
    "description": "Inside a try block, attempt to access 'lista[10]' where lista is [1, 2, 3]. In 'except IndexError as e:', print the error message converted to a string: str(e).",
    "narrative": "Catching an anomaly is only half the battle. The Operator must READ the diagnostic message to determine the root cause of failure.",
    "concept": "except ... as",
    "conceptExplanation": "The `as` clause captures the exception OBJECT into a local variable, letting you inspect its message, access diagnostic attributes, and produce detailed logs. Without it, you know something failed, but not why.",
    "hints": [
      "The syntax is: except ErrorType as variable:",
      "try:\n    lista[10]\nexcept IndexError as e:\n    print(str(e))"
    ],
    "successStory": "Diagnostic payload captured. Telemetry details routed to the security audit console."
  },
  "py-exc-07": {
    "title": "The Finally Block (Cleanup)",
    "description": "Use try/except/finally. In the try block, trigger ZeroDivisionError with 1/0. In except, print 'erro'. In finally, print 'limpeza'. Expected output: erro / limpeza.",
    "narrative": "Certain operations must close sockets, release file handles, or decommission drones—regardless of whether a failure occurred. The 'finally' clause guarantees execution.",
    "concept": "The finally Clause",
    "conceptExplanation": "The `finally` block executes unconditionally following a `try` suite, whether an exception was raised or not. It is the canonical place for resource deallocation: closing connections, flushing file descriptors, or releasing locks.",
    "hints": [
      "finally runs ALWAYS — whether an error occurred or not. Ideal for teardown routines.",
      "try:\n    1/0\nexcept:\n    print('erro')\nfinally:\n    print('limpeza')"
    ],
    "successStory": "Shutdown sequence complete. Allocated resources were safely released despite the crash."
  },
  "py-exc-08": {
    "title": "The Happy Path (else)",
    "description": "Use try/except/else. In try, execute 'valor = int(\"42\")' (without error). In except ValueError, print 'falha'. In else, print the converted valor. Expected output: 42.",
    "narrative": "The else block executes only if the try block SUCCEEDS. It isolates downstream logic from the risky block, ensuring crystal-clear code architecture.",
    "concept": "The else Clause in try",
    "conceptExplanation": "The `else` clause in a try block runs only when NO exceptions are raised. It is ideal for separating business logic that runs upon success from the volatile code under inspection, keeping your try blocks minimal.",
    "hints": [
      "The else block runs only if NO exception occurred in try. It precedes finally.",
      "try:\n    valor = int('42')\nexcept ValueError:\n    print('falha')\nelse:\n    print(valor)"
    ],
    "successStory": "Conversion successful. Post-validation logic executed smoothly along the verified path."
  },
  "py-exc-09": {
    "title": "Multiple Error Vectors",
    "description": "Inside try, call int(\"abc\"). Set up TWO separate except blocks: 'except ValueError:' prints 'valor' and 'except KeyError:' prints 'chave'. Expected output: valor.",
    "narrative": "Different threat vectors require distinct countermeasures. Configure multiple handlers to respond appropriately to each specific error type.",
    "concept": "Multiple except Blocks",
    "conceptExplanation": "You can chain as many `except` clauses as needed after a `try`. Python checks them sequentially from top to bottom and executes only the first matching handler. Place specific exceptions before broader ones to prevent shadowing.",
    "hints": [
      "You can chain multiple except clauses. Python executes the first matching block.",
      "try:\n    int('abc')\nexcept ValueError:\n    print('valor')\nexcept KeyError:\n    print('chave')"
    ],
    "successStory": "Fault routing active. Each failure category now routes to its dedicated handler."
  },
  "py-exc-10": {
    "title": "Grouped Catch (Tuple)",
    "description": "Inside try, call int(\"abc\"). In a SINGLE except block, catch both ValueError and TypeError using a tuple. Print 'erro_dado'.",
    "narrative": "When multiple failure scenarios demand identical mitigation, group them into a single handler using a tuple.",
    "concept": "Exception Tuples",
    "conceptExplanation": "When multiple exception types warrant the EXACT same recovery logic, combine them into a tuple within a single `except` statement. This avoids code duplication and signals that both errors share identical recovery procedures.",
    "hints": [
      "Use parentheses: except (ValueError, TypeError):",
      "try:\n    int('abc')\nexcept (ValueError, TypeError):\n    print('erro_dado')"
    ],
    "successStory": "Unified handler deployed. Divergent failure vectors converge into a single countermeasure protocol."
  },
  "py-exc-11": {
    "title": "Missing Key (KeyError)",
    "description": "Given 'config = {\"host\": \"local\"}', attempt to access config['porta'] inside try. Catch with 'except KeyError:' and print 'chave_ausente'.",
    "narrative": "Malformed configuration packets may omit critical parameters. Intercept KeyError specifically to handle missing configuration fields.",
    "concept": "KeyError",
    "conceptExplanation": "`KeyError` is raised whenever you query a non-existent key from a dictionary using bracket syntax. Unlike `.get()` which defaults to `None`, direct lookup `[]` raises an exception if the key is missing.",
    "hints": [
      "Querying a missing key via brackets automatically triggers KeyError.",
      "try:\n    config['porta']\nexcept KeyError:\n    print('chave_ausente')"
    ],
    "successStory": "Incomplete configuration detected. The system shifted into safe operating mode."
  },
  "py-exc-12": {
    "title": "Index Out of Bounds (IndexError)",
    "description": "Given 'lista = [10, 20]', attempt to access lista[5]. Catch with 'except IndexError:' and print 'fora_dos_limites'.",
    "narrative": "Short arrays paired with high index queries cause memory boundary violations. Anticipate this failure vector when parsing unverified external feeds.",
    "concept": "IndexError",
    "conceptExplanation": "`IndexError` occurs when attempting to subscript a sequence (list, tuple, string) past its valid bounds. It is common in misconfigured loops or unvalidated slice operations.",
    "hints": [
      "Accessing an index >= len(lista) triggers IndexError.",
      "try:\n    lista[5]\nexcept IndexError:\n    print('fora_dos_limites')"
    ],
    "successStory": "Out-of-bounds buffer read blocked. Potential buffer overflow neutralized."
  },
  "py-exc-13": {
    "title": "Type Mismatch (TypeError)",
    "description": "Inside try, attempt 'len(5)' (len does not accept int). Catch with 'except TypeError:' and print 'tipo_invalido'.",
    "narrative": "Incompatible types in operational pipelines cause immediate runtime termination. Trap them before failures cascade.",
    "concept": "TypeError",
    "conceptExplanation": "`TypeError` is raised when an operation or function is applied to an object of inappropriate type: combining strings with ints, calling `len()` on a scalar, or invoking non-callables. In dynamic systems, catch these early.",
    "hints": [
      "len() accepts sequences and collections — passing an int triggers TypeError.",
      "try:\n    len(5)\nexcept TypeError:\n    print('tipo_invalido')"
    ],
    "successStory": "Type mismatch isolated. The pipeline continues without propagating faults to downstream modules."
  },
  "py-exc-14": {
    "title": "Invalid Arithmetic Division",
    "description": "Inside try, execute 100/0. Catch with 'except ZeroDivisionError:' and print 'div_zero'. Immediately after the try block, print 'continuou' — to prove the script kept running.",
    "narrative": "Demonstrate that the runtime survives arithmetic collapse and continues processing subsequent instructions.",
    "concept": "ZeroDivisionError",
    "conceptExplanation": "`ZeroDivisionError` guards against undefined mathematical division. Always guard equations where divisors derive from dynamic user input or untrusted data sources.",
    "hints": [
      "try:\n    100/0\nexcept ZeroDivisionError:\n    print('div_zero')\nprint('continuou')"
    ],
    "successStory": "Arithmetic core preserved. The system resumed pipeline execution after neutralizing the division error."
  },
  "py-exc-15": {
    "title": "Custom Exception",
    "description": "Create a class 'AcessoNegadoError' that inherits from Exception. In try, execute 'raise AcessoNegadoError(\"sem permissao\")'. Catch it and print its message using str(e).",
    "narrative": "Generic exceptions fail to express domain-level failure states. Define custom exception types tailored to your application logic—access control, business rules, and security policies.",
    "concept": "Custom Exceptions",
    "conceptExplanation": "You can define domain-specific exceptions by subclassing `Exception`. This creates an expressive error taxonomy (`AcessoNegadoError`, `SaldoInsuficienteError`), enabling precise error interception rather than catching coarse generic errors.",
    "hints": [
      "class AcessoNegadoError(Exception):\n    pass",
      "try:\n    raise AcessoNegadoError('sem permissao')\nexcept AcessoNegadoError as e:\n    print(str(e))"
    ],
    "successStory": "Custom error class registered. Internal security taxonomy now identifies domain-specific access violations."
  },
  "py-exc-16": {
    "title": "Re-raising After Logging (raise)",
    "description": "Inside an outer try, create another try that calls int('xyz'). In the inner except, print 'logado' and THEN use raise (with no arguments) to pass the error on. In the outer except, catch the re-raised error and print 'escalado'.",
    "narrative": "Sometimes you need to log an incident without swallowing the exception. A bare 'raise' re-dispatches the active exception up the stack while preserving the full traceback.",
    "concept": "Re-raising Exceptions",
    "conceptExplanation": "Inside an except block, a bare `raise` re-emits the original exception, preserving its traceback and exact type. This is standard pattern for auditing or intercepting failures before passing them to higher-level handlers.",
    "hints": [
      "Inside the inner except, print 'logado' and then write raise on its own, with nothing after it.",
      "try:\n    try:\n        int('xyz')\n    except ValueError:\n        print('logado')\n        raise\nexcept ValueError:\n    print('escalado')"
    ],
    "successStory": "Fault recorded in security logs and escalated up the call stack. Audit trail preserved."
  },
  "py-exc-17": {
    "title": "System Timestamp (datetime)",
    "description": "Import 'datetime' from the 'datetime' module. Call datetime.now() and store it in 'agora'. Print type(agora) — it should display datetime.datetime.",
    "narrative": "Every operational payload requires an immutable timestamp. Leverage the standard library module to query the current system time with precision.",
    "concept": "The datetime Module",
    "conceptExplanation": "The `datetime` module provides classes for managing dates and time series. `datetime.now()` returns the current local timestamp. Other utilities include `date.today()`, `timedelta` for intervals, and `strftime` for custom serialization.",
    "hints": [
      "from datetime import datetime",
      "agora = datetime.now()\nprint(type(agora))"
    ],
    "successStory": "Timestamp applied. Every execution record now carries an exact temporal signature."
  },
  "py-exc-18": {
    "title": "Random Choice (random.choice)",
    "description": "Import 'choice' from the 'random' module. Use choice(['a', 'b', 'c']) to select an item from the list and print it. (The test verifies valid syntax and execution, not the specific picked element).",
    "narrative": "Select a random exfiltration route from the available escape vectors. To prevent predictable surveillance patterns, delegate selection to entropy.",
    "concept": "random.choice",
    "conceptExplanation": "`choice()` is the most straightforward method to retrieve a random element from a non-empty sequence. Alongside `sample()` (multiple unique items) and `shuffle()` (in-place list shuffling), it forms the core toolkit of the random module.",
    "hints": [
      "choice(seq) returns a single random element from the sequence.",
      "from random import choice\nprint(choice(['a', 'b', 'c']))"
    ],
    "successStory": "Vector randomly selected. The exfiltration pattern remains fully unpredictable."
  },
  "py-exc-19": {
    "title": "Module Aliasing (import as)",
    "description": "Import 'math' under the alias 'm' (import math as m). Use m.pi to print the value of pi.",
    "narrative": "To shorten verbose namespaces or avoid identifier collisions, apply import aliases. This keeps imports concise and expressive.",
    "concept": "Import Aliases",
    "conceptExplanation": "`import X as Y` binds a module under an alias within the current namespace. It is standard convention across major data libraries (`import numpy as np`, `import pandas as pd`) and prevents naming collisions when integrating identically named modules.",
    "hints": [
      "Syntax: import module as alias",
      "import math as m\nprint(m.pi)"
    ],
    "successStory": "Namespace aliased. Code density increased without compromising readability."
  },
  "py-exc-20": {
    "title": "Runtime Inspection (sys)",
    "description": "Import the 'sys' module. Print type(sys.version) — it should output '<class \\'str\\'>' (since sys.version is a string representing interpreter version metadata).",
    "narrative": "Production systems must query their host runtime environment. The `sys` module exposes internal interpreter parameters and execution flags.",
    "concept": "The sys Module",
    "conceptExplanation": "The `sys` module provides access to variables and functions that interact directly with the Python runtime: `sys.version`, `sys.argv` (CLI arguments), `sys.exit()` (termination), and `sys.path` (module search paths). Crucial for scripts adapting dynamically to host environments.",
    "hints": [
      "sys.version is a string containing full Python version details.",
      "import sys\nprint(type(sys.version))"
    ],
    "successStory": "Runtime diagnosis concluded. The system logged its execution environment specs."
  }
};
